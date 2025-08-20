#!/bin/bash

# 🔥 Secure File Upload API Testing Script
# Test semua endpoint dengan security scenarios

BASE_URL="http://localhost:3000"
JWT_TOKEN="your-jwt-token-here"  # Replace with actual token

echo "🔐 Testing Secure File Upload API"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Upload a valid image file
echo -e "\n${YELLOW}Test 1: Upload Valid Image${NC}"
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "file=@test-image.jpg" \
  "$BASE_URL/files/upload" \
  | jq '.'

# Test 2: Try to upload dangerous file (should fail)
echo -e "\n${YELLOW}Test 2: Upload Dangerous File (should fail)${NC}"
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "file=@malicious.exe" \
  "$BASE_URL/files/upload" \
  | jq '.'

# Test 3: Try to upload oversized file (should fail)
echo -e "\n${YELLOW}Test 3: Upload Oversized File (should fail)${NC}"
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "file=@large-file.zip" \
  "$BASE_URL/files/upload" \
  | jq '.'

# Test 4: Try to upload without auth (should fail)
echo -e "\n${YELLOW}Test 4: Upload Without Auth (should fail)${NC}"
curl -X POST \
  -F "file=@test-image.jpg" \
  "$BASE_URL/files/upload" \
  | jq '.'

# Test 5: Download file (public access)
FILE_ID="123e4567-e89b-12d3-a456-426614174000"  # Replace with actual file ID
echo -e "\n${YELLOW}Test 5: Download File (public)${NC}"
curl -I "$BASE_URL/files/download/$FILE_ID"

# Test 6: Get file info (requires auth)
echo -e "\n${YELLOW}Test 6: Get File Info (authenticated)${NC}"
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "$BASE_URL/files/info/$FILE_ID" \
  | jq '.'

# Test 7: Delete file (requires auth and ownership)
echo -e "\n${YELLOW}Test 7: Delete File (authenticated)${NC}"
curl -X DELETE \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "$BASE_URL/files/$FILE_ID" \
  | jq '.'

# Test 8: Rate limiting test (upload spam)
echo -e "\n${YELLOW}Test 8: Rate Limiting Test (should get 429 after 5 uploads)${NC}"
for i in {1..7}; do
  echo "Upload attempt $i"
  curl -X POST \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -F "file=@test-image.jpg" \
    "$BASE_URL/files/upload" \
    -w "HTTP Status: %{http_code}\n" \
    -o /dev/null -s
  sleep 1
done

echo -e "\n${GREEN}Security testing completed!${NC}"
echo "Check the server logs for detailed security events."
