# 🖼️ User Avatar Update API

## Overview

Endpoint untuk mengupdate avatar pengguna dengan sistem file upload yang aman. Terintegrasi dengan secure file upload system untuk memastikan keamanan maksimal.

## 🎯 Endpoint Details

### Update Avatar
```http
PATCH /user/:id/avatar
Authorization: Bearer {jwt-token}
Content-Type: multipart/form-data
```

## 🔒 Security Features

### File Validation
- **Allowed Types**: Only image files (JPEG, PNG, GIF, WebP)
- **File Size Limit**: 5MB maximum
- **File Signature Check**: Magic bytes validation
- **Extension Validation**: Secure extension checking

### Access Control
- **Authentication Required**: JWT Bearer token
- **Permission Check**: 
  - Users can only update their own avatar
  - Admins can update any user's avatar
- **Rate Limiting**: 3 avatar updates per minute

### File Management
- **UUID-based Storage**: Non-guessable file names
- **Private Storage**: Files stored in secure directory
- **Old File Cleanup**: Automatically deletes previous avatar
- **Metadata Tracking**: Full audit trail

## 📝 Request Format

### Multipart Form Data
```bash
curl -X PATCH \
  -H "Authorization: Bearer your-jwt-token" \
  -F "avatar=@avatar.jpg" \
  "http://localhost:3000/user/123e4567-e89b-12d3-a456-426614174000/avatar"
```

### JavaScript/TypeScript Example
```typescript
const updateAvatar = async (userId: string, file: File, token: string) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await fetch(`/user/${userId}/avatar`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

## 📋 Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "fileId": "123e4567-e89b-12d3-a456-426614174000",
    "avatarUrl": "/files/download/123e4567-e89b-12d3-a456-426614174000",
    "originalName": "avatar.jpg",
    "size": 1024576,
    "uploadedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - No File
```json
{
  "statusCode": 400,
  "message": "Avatar file is required",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Invalid File Type
```json
{
  "statusCode": 400,
  "message": "Avatar must be an image file. Allowed types: image/jpeg, image/png, image/gif, image/webp",
  "error": "Bad Request"
}
```

#### 413 Payload Too Large
```json
{
  "statusCode": 413,
  "message": "File size exceeds maximum allowed size of 5MB",
  "error": "Payload Too Large"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "You can only update your own avatar",
  "error": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

#### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

## 🔄 Process Flow

1. **Validation Phase**
   - Check authentication token
   - Validate user permissions
   - Check file presence and type
   - Validate file size and signature

2. **Upload Phase**
   - Upload file to secure storage
   - Generate UUID-based filename
   - Create file checksum
   - Process metadata stripping

3. **Database Update**
   - Update user profile with new avatar URL
   - Create profile if doesn't exist (upsert)

4. **Cleanup Phase**
   - Delete old avatar file (if exists)
   - Log operation for audit

5. **Response**
   - Return success with file metadata

## 🛡️ Security Considerations

### File Validation
```typescript
// File type validation
const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// File size validation  
const maxSize = 5 * 1024 * 1024; // 5MB

// File signature validation (magic bytes)
await this.validateFileSignature(file);
```

### Permission Checking
```typescript
// Only owner or admin can update avatar
if (currentUser.role !== Role.ADMIN && currentUser.id !== userId) {
  throw new UnauthorizedException('You can only update your own avatar');
}
```

### Rate Limiting
```typescript
@Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 per minute
```

## 📊 Database Schema Updates

### UserProfile Model
```prisma
model UserProfile {
  id          String    @id @default(uuid())
  firstName   String?   @map("first_name")
  lastName    String?   @map("last_name")
  bio         String?
  avatarUrl   String?   @map("avatar_url")  // Stores avatar file URL
  phoneNumber String?   @unique @map("phone_number")
  birthDate   DateTime? @map("birth_date")

  userId String @unique @map("user_id")
  user   User   @relation(fields: [userId], references: [id])

  @@map("user_profiles")
}
```

## 🧪 Testing Examples

### Valid Avatar Upload
```bash
# Test with valid image
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@test-avatar.jpg" \
  "http://localhost:3000/user/$USER_ID/avatar"
```

### Invalid File Type Test
```bash
# Test with non-image file (should fail)
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@document.pdf" \
  "http://localhost:3000/user/$USER_ID/avatar"
```

### Permission Test
```bash
# Test updating another user's avatar (should fail for non-admin)
curl -X PATCH \
  -H "Authorization: Bearer $OTHER_USER_TOKEN" \
  -F "avatar=@avatar.jpg" \
  "http://localhost:3000/user/$DIFFERENT_USER_ID/avatar"
```

### Rate Limiting Test
```bash
# Test rapid uploads (should get 429 after 3 attempts)
for i in {1..5}; do
  curl -X PATCH \
    -H "Authorization: Bearer $TOKEN" \
    -F "avatar=@avatar.jpg" \
    "http://localhost:3000/user/$USER_ID/avatar"
  sleep 1
done
```

## 🔧 Configuration

### Environment Variables
```bash
# Avatar-specific settings
MAX_FILE_SIZE=5242880                    # 5MB for avatars
ALLOWED_MIME_TYPES="image/jpeg,image/png,image/gif,image/webp"
ENABLE_METADATA_STRIPPING=true
```

### Swagger Documentation
- **Operation**: Update user avatar
- **Tags**: User
- **Security**: Bearer Auth required
- **Content-Type**: multipart/form-data
- **Parameters**: User ID (path), Avatar file (form)

## 🚀 Frontend Integration

### React Example
```tsx
const AvatarUpload: React.FC<{ userId: string }> = ({ userId }) => {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    setUploading(true);
    
    try {
      const result = await updateAvatar(userId, file, authToken);
      console.log('Avatar updated:', result);
      // Update UI with new avatar
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
```

Endpoint ini memberikan cara yang aman dan lengkap untuk mengelola avatar pengguna dengan semua fitur security yang diperlukan! 🔥
