# 🔐 Secure File Upload Blueprint - NestJS

## Overview

Blueprint implementasi file upload yang aman dengan 5 layer security yang telah terintegrasi ke dalam NestJS application. Sistem ini menggunakan pendekatan "security-first" untuk mencegah berbagai jenis serangan.

## 🛡️ Security Layers

### Layer 1: Pre-Upload Validation
- **File Size Validation**: Batasi ukuran maksimal file (default: 10MB)
- **MIME Type Validation**: Whitelist mime types yang diizinkan
- **Extension Validation**: Validasi ekstensi file dengan whitelist
- **File Signature Validation**: Cek magic bytes untuk memastikan file type
- **Dangerous Extension Blocking**: Blokir ekstensi berbahaya (.exe, .php, .sh, dll)

### Layer 2: Secure Storage
- **UUID-based Filenames**: Generate nama file random untuk keamanan
- **Private Storage Directory**: File disimpan di folder private, bukan public
- **Checksum Generation**: SHA-256 checksum untuk integrity checking
- **Duplicate Detection**: Deteksi file duplicate berdasarkan checksum

### Layer 3: File Security Processing
- **Antivirus Scanning**: Integrasi dengan ClamAV (optional)
- **Metadata Stripping**: Hapus EXIF dan metadata sensitif dari gambar
- **File Encryption**: Opsi enkripsi at-rest untuk data sensitif

### Layer 4: Secure Access Control
- **Authentication Required**: Upload, info, dan delete butuh JWT token
- **Permission Checking**: User hanya bisa delete file mereka sendiri
- **Public Downloads**: Download public tapi dengan UUID non-guessable
- **Rate Limiting**: Throttling untuk upload dan delete operations

### Layer 5: Audit & Monitoring
- **Comprehensive Logging**: Log semua operasi file dengan user info
- **Access Tracking**: Track download count dan last accessed
- **Security Events**: Log attempt akses file berbahaya atau tidak sah

## 🚀 API Endpoints

### 1. Upload File (Secure)
```http
POST /files/upload
Authorization: Bearer {jwt-token}
Content-Type: multipart/form-data

{
  "file": [binary data]
}
```

**Security Features:**
- Rate limiting: 5 uploads per minute
- File validation: size, type, signature
- UUID-based naming
- Antivirus scanning
- Metadata stripping

### 2. Download File (Public with UUID)
```http
GET /files/download/{fileId}
```
**Security Features:**
- UUID validation
- Non-guessable file IDs
- Security headers
- Access logging

### 3. File Information (Authenticated)
```http
GET /files/info/{fileId}
Authorization: Bearer {jwt-token}
```

### 4. Delete File (Authenticated + Permission)
```http
DELETE /files/{fileId}
Authorization: Bearer {jwt-token}
```
**Security Features:**
- Only uploader can delete
- Rate limiting: 10 deletes per minute

## 🔧 Configuration

### Environment Variables
```bash
# File Upload Security
UPLOADS_DIR="./uploads/private"
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_MIME_TYPES="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,application/zip"
ALLOWED_EXTENSIONS=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.zip"
DANGEROUS_EXTENSIONS=".exe,.bat,.cmd,.com,.pif,.scr,.vbs,.js,.jar,.php,.asp,.aspx,.jsp,.sh,.bash,.ps1,.py"

# Security Features
ENABLE_ANTIVIRUS_SCAN=false
ENABLE_METADATA_STRIPPING=true
```

## 📁 File Structure

```
src/
├── common/
│   └── services/
│       ├── file-upload.service.ts         # Original simple service
│       └── secure-file-upload.service.ts  # New secure service ✨
└── modules/
    └── files/
        ├── file.controller.ts              # Upgraded secure controller ✨
        └── file.module.ts                  # Updated module

uploads/
└── private/                               # Secure storage directory ✨
    ├── uuid-1234-5678-9abc-def0.jpg
    └── uuid-abcd-efgh-ijkl-mnop.pdf
```

## 🔐 Security Implementation Details

### File Validation Process
```typescript
// 1. Size validation
if (file.size > this.maxFileSize) {
  throw new BadRequestException('File too large');
}

// 2. MIME type validation
if (!this.allowedMimeTypes.includes(file.mimetype)) {
  throw new BadRequestException('File type not allowed');
}

// 3. Extension validation
const extension = path.extname(file.originalname).toLowerCase();
if (!this.allowedExtensions.includes(extension)) {
  throw new BadRequestException('Extension not allowed');
}

// 4. Magic bytes validation
await this.validateFileSignature(file);
```

### Secure Storage Process
```typescript
// 1. Generate secure filename
const fileId = uuidv4();
const secureFilename = `${fileId}${extension}`;

// 2. Generate checksum
const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

// 3. Store in private directory
const filePath = path.join(this.uploadsDir, secureFilename);
await writeFile(filePath, processedBuffer);
```

### Permission Control
```typescript
// Only uploader can delete their files
if (metadata.uploadedBy !== userId) {
  throw new UnauthorizedException('Can only delete own files');
}
```

## 🚨 Security Monitoring

### Logged Events
- File upload attempts (success/failure)
- File access patterns
- Dangerous file detection
- Unauthorized access attempts
- Rate limiting violations

### Example Log Output
```json
{
  "level": "info",
  "message": "File uploaded successfully",
  "userId": "user-uuid",
  "fileId": "file-uuid",
  "filename": "secure-filename.jpg",
  "originalName": "user-photo.jpg",
  "size": 1024576,
  "checksum": "sha256-hash",
  "scanResult": "clean"
}
```

## 🔄 Migration from Simple to Secure

### What Changed
1. **Service**: `FileUploadService` → `SecureFileUploadService`
2. **Storage**: `./uploads/` → `./uploads/private/`
3. **Naming**: `original-name.ext` → `uuid.ext`
4. **Access**: Direct file access → Controller-mediated access
5. **Security**: Basic validation → Multi-layer security

### Backward Compatibility
- Legacy endpoint `/files/:filename` still supported
- Automatic UUID extraction from filename
- Graceful fallback for existing files

## 🎯 Next Steps

### Optional Enhancements
1. **Cloud Storage Integration** (S3, GCS, Azure Blob)
2. **Image Processing** (resize, optimize, watermark)
3. **Virus Scanning** (ClamAV integration)
4. **CDN Integration** (CloudFlare, AWS CloudFront)
5. **File Versioning** (Keep multiple versions)
6. **Bulk Operations** (Batch upload/delete)

### Production Considerations
1. **Database Storage**: Move metadata dari memory ke database
2. **Queue Processing**: Background antivirus scanning
3. **Monitoring**: Integration dengan monitoring tools
4. **Backup Strategy**: Regular backup file storage
5. **Performance**: Caching dan optimization

## 💡 Best Practices

1. **Never trust user input** - Validate everything
2. **Use whitelist approach** - Only allow known safe types
3. **Store files privately** - Serve via controller with permission
4. **Log everything** - Audit trail untuk security
5. **Rate limit** - Prevent abuse dan flooding
6. **Regular security updates** - Keep dependencies updated

---

**Blueprint ini memberikan foundation yang solid untuk file upload yang aman di production environment.** 🔥
