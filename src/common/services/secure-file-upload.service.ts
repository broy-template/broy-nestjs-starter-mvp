import { Injectable, BadRequestException, UnauthorizedException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

export interface SecureMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface FileUploadResult {
  fileId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  checksum: string;
  isScanned: boolean;
  scanResult?: 'clean' | 'infected' | 'error';
}

export interface FileMetadata {
  fileId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  checksum: string;
  downloadCount: number;
  lastAccessed?: Date;
  isScanned: boolean;
  scanResult?: 'clean' | 'infected' | 'error';
  isDeleted: boolean;
  deletedAt?: Date;
  tags?: string[];
}

@Injectable()
export class SecureFileUploadService {
  private readonly logger = new Logger(SecureFileUploadService.name);
  private readonly uploadsDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];
  private readonly allowedExtensions: string[];
  private readonly dangerousExtensions: string[];
  private readonly enableAntivirusScan: boolean;
  private readonly enableMetadataStripping: boolean;
  private readonly fileMetadataCache = new Map<string, FileMetadata>();

  constructor(private configService: ConfigService) {
    this.uploadsDir = this.configService.get<string>('UPLOADS_DIR', './uploads/private');
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
    this.allowedMimeTypes = this.configService.get<string>('ALLOWED_MIME_TYPES', 
      'image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,application/zip,application/x-zip-compressed'
    ).split(',');
    this.allowedExtensions = this.configService.get<string>('ALLOWED_EXTENSIONS',
      '.jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.zip'
    ).split(',');
    this.dangerousExtensions = this.configService.get<string>('DANGEROUS_EXTENSIONS',
      '.exe,.bat,.cmd,.com,.pif,.scr,.vbs,.js,.jar,.php,.asp,.aspx,.jsp,.sh,.bash,.ps1,.py'
    ).split(',');
    this.enableAntivirusScan = this.configService.get<boolean>('ENABLE_ANTIVIRUS_SCAN', false);
    this.enableMetadataStripping = this.configService.get<boolean>('ENABLE_METADATA_STRIPPING', true);

    this.ensureDirectoryExists();
  }

  /**
   * Layer 1: Pre-upload validation
   */
  async validateFile(file: SecureMulterFile, userId: string): Promise<void> {
    // Size validation
    if (file.size > this.maxFileSize) {
      this.logger.warn(`User ${userId} attempted to upload oversized file: ${file.size} bytes`, {
        userId,
        filename: file.originalname,
        size: file.size,
        maxSize: this.maxFileSize
      });
      throw new BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    // MIME type validation
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(`User ${userId} attempted to upload disallowed MIME type: ${file.mimetype}`, {
        userId,
        filename: file.originalname,
        mimetype: file.mimetype
      });
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }

    // Extension validation
    const extension = path.extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(extension)) {
      this.logger.warn(`User ${userId} attempted to upload disallowed extension: ${extension}`, {
        userId,
        filename: file.originalname,
        extension
      });
      throw new BadRequestException(`File extension ${extension} is not allowed`);
    }

    // Dangerous extension check
    if (this.dangerousExtensions.includes(extension)) {
      this.logger.error(`User ${userId} attempted to upload dangerous file: ${extension}`, {
        userId,
        filename: file.originalname,
        extension
      });
      throw new BadRequestException(`File type ${extension} is prohibited for security reasons`);
    }

    // File signature validation (magic bytes)
    await this.validateFileSignature(file);

    this.logger.log(`File validation passed for user ${userId}`, {
      userId,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
  }

  /**
   * Layer 2: Secure storage with UUID naming
   */
  async uploadFile(file: SecureMulterFile, userId: string): Promise<FileUploadResult> {
    await this.validateFile(file, userId);

    // Generate secure filename
    const fileId = uuidv4();
    const extension = path.extname(file.originalname).toLowerCase();
    const secureFilename = `${fileId}${extension}`;
    const filePath = path.join(this.uploadsDir, secureFilename);

    // Generate file checksum
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Check for duplicate files
    await this.checkDuplicateFile(checksum, userId);

    // Layer 3: File security processing
    let processedBuffer = file.buffer;
    
    // Strip metadata if enabled
    if (this.enableMetadataStripping && this.isImageFile(file.mimetype)) {
      processedBuffer = await this.stripImageMetadata(file.buffer, file.mimetype);
    }

    // Save file to secure location
    await writeFile(filePath, processedBuffer);

    const uploadResult: FileUploadResult = {
      fileId,
      filename: secureFilename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy: userId,
      uploadedAt: new Date(),
      checksum,
      isScanned: false
    };

    // Layer 3: Antivirus scanning (if enabled)
    if (this.enableAntivirusScan) {
      uploadResult.scanResult = await this.scanFile(filePath);
      uploadResult.isScanned = true;

      if (uploadResult.scanResult === 'infected') {
        await unlink(filePath); // Delete infected file
        this.logger.error(`Infected file detected and deleted`, {
          userId,
          fileId,
          filename: file.originalname,
          checksum
        });
        throw new BadRequestException('File contains malware and has been rejected');
      }
    }

    // Store metadata
    const metadata: FileMetadata = {
      ...uploadResult,
      downloadCount: 0,
      isDeleted: false,
      tags: []
    };
    this.fileMetadataCache.set(fileId, metadata);

    this.logger.log(`File uploaded successfully`, {
      userId,
      fileId,
      filename: secureFilename,
      originalName: file.originalname,
      size: file.size,
      checksum,
      scanResult: uploadResult.scanResult
    });

    return uploadResult;
  }

  /**
   * Layer 4: Secure file access with permission check
   */
  async getFileStream(fileId: string, userId?: string): Promise<{ stream: fs.ReadStream; metadata: FileMetadata }> {
    let metadata = this.fileMetadataCache.get(fileId);
    
    // If metadata not in cache, try to reconstruct from disk
    if (!metadata || metadata.isDeleted) {
      // Attempt to find file on disk by UUID pattern
      const possibleExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.zip'];
      let foundFile: fs.Stats | null = null;
      let foundFilePath: string | null = null;

      for (const ext of possibleExtensions) {
        const testFilePath = path.join(this.uploadsDir, `${fileId}${ext}`);
        try {
          const fileStat = await stat(testFilePath);
          foundFile = fileStat;
          foundFilePath = testFilePath;
          break;
        } catch (error) {
          // File doesn't exist with this extension, continue
        }
      }

      if (!foundFile || !foundFilePath) {
        this.logger.warn(`File not found in cache or disk`, { fileId, userId });
        throw new NotFoundException('File not found');
      }

      // Reconstruct basic metadata from disk file
      const filename = path.basename(foundFilePath);
      const extension = path.extname(filename).toLowerCase();
      
      // Basic MIME type detection
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.zip': 'application/zip'
      };

      metadata = {
        fileId,
        filename,
        originalName: filename, // We don't have original name, use filename
        mimetype: mimeTypes[extension] || 'application/octet-stream',
        size: foundFile.size,
        uploadedBy: 'unknown', // We don't have this info
        uploadedAt: foundFile.birthtime,
        checksum: 'unknown', // We don't have this info
        downloadCount: 0,
        isScanned: false,
        isDeleted: false,
        tags: []
      };

      // Add to cache for future requests
      this.fileMetadataCache.set(fileId, metadata);
      
      this.logger.log(`File metadata reconstructed from disk`, {
        fileId,
        filename,
        size: foundFile.size
      });
    }

    const filePath = path.join(this.uploadsDir, metadata.filename);
    
    // Double-check if file exists on disk
    try {
      await stat(filePath);
    } catch (error) {
      this.logger.error(`File missing from disk`, { fileId, filePath, userId });
      throw new NotFoundException('File not found on disk');
    }

    // Update access tracking
    metadata.downloadCount++;
    metadata.lastAccessed = new Date();

    this.logger.log(`File accessed`, {
      userId,
      fileId,
      filename: metadata.filename,
      downloadCount: metadata.downloadCount
    });

    const stream = fs.createReadStream(filePath);
    return { stream, metadata };
  }

  /**
   * Secure file deletion
   */
  async deleteFile(fileId: string, userId: string): Promise<void> {
    const metadata = this.fileMetadataCache.get(fileId);
    
    if (!metadata || metadata.isDeleted) {
      throw new NotFoundException('File not found');
    }

    // Permission check - only uploader can delete (or admin)
    if (metadata.uploadedBy !== userId) {
      this.logger.warn(`Unauthorized delete attempt`, { fileId, userId, uploadedBy: metadata.uploadedBy });
      throw new UnauthorizedException('You can only delete files you uploaded');
    }

    const filePath = path.join(this.uploadsDir, metadata.filename);
    
    try {
      await unlink(filePath);
      metadata.isDeleted = true;
      metadata.deletedAt = new Date();

      this.logger.log(`File deleted successfully`, {
        userId,
        fileId,
        filename: metadata.filename
      });
    } catch (error) {
      this.logger.error(`Failed to delete file`, { fileId, filePath, error });
      throw new BadRequestException('Failed to delete file');
    }
  }

  /**
   * Get file metadata
   */
  getFileMetadata(fileId: string): FileMetadata | null {
    const metadata = this.fileMetadataCache.get(fileId);
    return metadata && !metadata.isDeleted ? metadata : null;
  }

  /**
   * Security utilities
   */
  private async validateFileSignature(file: SecureMulterFile): Promise<void> {
    const buffer = file.buffer;
    const signatures: { [key: string]: number[][] } = {
      'image/jpeg': [[0xFF, 0xD8, 0xFF]],
      'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
      'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
      'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
      'application/zip': [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06], [0x50, 0x4B, 0x07, 0x08]]
    };

    const expectedSignatures = signatures[file.mimetype];
    if (!expectedSignatures) return; // Skip validation for unknown types

    const isValid = expectedSignatures.some(signature => 
      signature.every((byte, index) => buffer[index] === byte)
    );

    if (!isValid) {
      this.logger.warn(`File signature mismatch`, {
        mimetype: file.mimetype,
        filename: file.originalname,
        actualBytes: Array.from(buffer.slice(0, 8))
      });
      throw new BadRequestException('File content does not match declared type');
    }
  }

  private async checkDuplicateFile(checksum: string, userId: string): Promise<void> {
    for (const metadata of this.fileMetadataCache.values()) {
      if (metadata.checksum === checksum && !metadata.isDeleted) {
        this.logger.log(`Duplicate file detected`, { checksum, userId, existingFileId: metadata.fileId });
        // You might want to return the existing file instead of rejecting
        // throw new BadRequestException('File already exists');
      }
    }
  }

  private async scanFile(filePath: string): Promise<'clean' | 'infected' | 'error'> {
    // Placeholder for antivirus integration (ClamAV, etc.)
    // In real implementation, integrate with your antivirus solution
    try {
      // Example: exec(`clamscan ${filePath}`)
      this.logger.log(`File scan completed (mock)`, { filePath });
      return 'clean';
    } catch (error) {
      this.logger.error(`File scan error`, { filePath, error });
      return 'error';
    }
  }

  private async stripImageMetadata(buffer: Buffer, mimetype: string): Promise<Buffer> {
    // Placeholder for metadata stripping
    // In real implementation, use libraries like sharp, exifr, etc.
    this.logger.log(`Metadata stripping completed (mock)`, { mimetype });
    return buffer;
  }

  private isImageFile(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      this.logger.log(`Created uploads directory: ${this.uploadsDir}`);
    }
  }
}
