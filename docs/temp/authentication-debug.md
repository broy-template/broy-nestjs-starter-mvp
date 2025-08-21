# 🚨 Authentication Debug Guide

## Problem: 401 Unauthorized pada Avatar Upload

### Common Issues & Solutions:

### 1. **Swagger JWT Token Setup**

#### ✅ **Correct Way:**
1. **Login first** via `/auth/login` endpoint
2. **Copy the accessToken** from response
3. **Click "Authorize" button** di Swagger UI (kunci icon)
4. **Paste token TANPA "Bearer" prefix**
   ```
   # ❌ WRONG:
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # ✅ CORRECT:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 2. **Test dengan CURL**

```bash
# 1. Login dulu
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# 2. Copy accessToken dari response, lalu test avatar upload
curl -X PATCH "http://localhost:3000/api/v1/user/USER_ID/avatar" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "avatar=@path/to/image.jpg"
```

### 3. **Debugging Steps**

#### Check JWT Token Validity:
```bash
# Decode JWT token (tanpa verify signature)
echo "YOUR_JWT_TOKEN" | base64 -d
```

#### Check Server Logs:
```bash
# Lihat error logs di terminal server
# Should show authentication attempt details
```

### 4. **Common Fixes**

#### Fix 1: Refresh/Login Ulang
- Token mungkin sudah expired
- Login ulang untuk dapat token baru

#### Fix 2: Check User ID
- Pastikan USER_ID di URL sesuai dengan user yang login
- Atau gunakan admin token untuk test

#### Fix 3: Check File Size
- Pastikan file < 5MB untuk avatar
- Cek file type (JPEG, PNG, GIF, WebP only)

### 5. **Test Script**

```bash
#!/bin/bash
# test-avatar-upload.sh

BASE_URL="http://localhost:3000/api/v1"

echo "🔐 Testing Avatar Upload"

# Step 1: Login
echo "Step 1: Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com", 
    "password": "password123"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token (requires jq)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')

if [ "$TOKEN" != "null" ]; then
  echo "✅ Token obtained: ${TOKEN:0:50}..."
  
  # Step 2: Test avatar upload
  echo "Step 2: Testing avatar upload..."
  UPLOAD_RESPONSE=$(curl -s -X PATCH "$BASE_URL/user/USER_ID_HERE/avatar" \
    -H "Authorization: Bearer $TOKEN" \
    -F "avatar=@test-image.jpg")
  
  echo "Upload Response: $UPLOAD_RESPONSE"
else
  echo "❌ Failed to get token. Check login credentials."
fi
```

### 6. **Swagger Authorization Settings**

Setelah update config, pastikan:
1. **Restart server** untuk apply config changes
2. **Refresh Swagger page** di browser  
3. **Re-authorize** dengan token baru

### 7. **Environment Check**

```bash
# Check environment variables
echo "JWT_SECRET: $JWT_SECRET"
echo "JWT_EXPIRES_IN: $JWT_EXPIRES_IN"

# Pastikan ada JWT_SECRET di .env file
```
