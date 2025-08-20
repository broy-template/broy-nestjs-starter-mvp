# 🔐 Role-Based Access Control (RBAC) Documentation

## Overview

Sistem RBAC pada aplikasi ini menggunakan pendekatan hierarkis dengan 2 role utama: **ADMIN** dan **USER**. Setiap endpoint memiliki aturan akses yang berbeda berdasarkan role dan ownership.

## 🎭 Role Definitions

### 1. ADMIN Role
- **Description**: Administrator dengan akses penuh ke sistem
- **Capabilities**: 
  - Manage semua user accounts
  - View semua data users
  - Create, update, delete users
  - Override ownership restrictions
- **Hierarchy**: Highest level access

### 2. USER Role  
- **Description**: Regular user dengan akses terbatas
- **Capabilities**:
  - Update own profile data (avatar)
  - Access own account information
  - Limited to personal data only
- **Hierarchy**: Standard user level

## 🛡️ Access Control Matrix

### User Management Endpoints

| Endpoint | Method | Route | Admin | User | Owner* | Public | Description |
|----------|--------|-------|-------|------|--------|--------|-------------|
| **Create User** | POST | `/user` | ✅ | ❌ | ❌ | ❌ | Create new user account |
| **List Users** | GET | `/user` | ✅ | ❌ | ❌ | ❌ | Get paginated user list |
| **Get User** | GET | `/user/:id` | ✅ | ❌ | ❌ | ❌ | Get specific user details |
| **Update User** | PATCH | `/user/:id` | ✅ | ❌ | ❌ | ❌ | Update user profile data |
| **Update Avatar** | PATCH | `/user/:id/avatar` | ✅ | ❌ | ✅ | ❌ | Upload/update avatar image |
| **Delete User** | DELETE | `/user/:id` | ✅ | ❌ | ❌ | ❌ | Permanently delete user |

### File Management Endpoints

| Endpoint | Method | Route | Admin | User | Owner* | Public | Description |
|----------|--------|-------|-------|------|--------|--------|-------------|
| **Upload File** | POST | `/files/upload` | ✅ | ✅ | ✅ | ❌ | Upload file securely |
| **Download File** | GET | `/files/download/:id` | ✅ | ✅ | ✅ | ✅ | Download file (public) |
| **File Info** | GET | `/files/info/:id` | ✅ | ✅ | ✅ | ❌ | Get file metadata |
| **Delete File** | DELETE | `/files/:id` | ✅ | ❌ | ✅ | ❌ | Delete uploaded file |

### Authentication Endpoints

| Endpoint | Method | Route | Admin | User | Owner* | Public | Description |
|----------|--------|-------|-------|------|--------|--------|-------------|
| **Login** | POST | `/auth/login` | ✅ | ✅ | ✅ | ✅ | User authentication |
| **Register** | POST | `/auth/register` | ✅ | ✅ | ✅ | ✅ | User registration |
| **Refresh Token** | POST | `/auth/refresh` | ✅ | ✅ | ✅ | ✅ | Token refresh |

**Legend:**
- ✅ = Full Access
- ❌ = No Access
- ✅* = Owner = User can only access their own data

## 🔧 Implementation Details

### 1. Role Decorators
```typescript
// Admin only access
@Roles(Role.ADMIN)
@Get('/admin-only')
adminOnlyEndpoint() { ... }

// Multiple roles allowed  
@Roles(Role.ADMIN, Role.USER)
@Get('/authenticated')
authenticatedEndpoint() { ... }
```

### 2. Owner-Based Permissions
```typescript
// Permission check in controller
async updateAvatar(@Param('id') id: string, @CurrentUser() user: UserPayload) {
  // Admin can update any user's avatar
  // User can only update their own avatar
  if (user.role !== Role.ADMIN && user.id !== id) {
    throw new UnauthorizedException('You can only update your own avatar');
  }
}
```

### 3. Guard Hierarchy
```typescript
// Guard execution order in app.module.ts
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard,    // 1. Rate limiting
},
{
  provide: APP_GUARD, 
  useClass: JwtAuthGuard,      // 2. Authentication
},
{
  provide: APP_GUARD,
  useClass: RolesGuard,        // 3. Authorization
}
```

## 🚦 Permission Patterns

### Pattern 1: Admin Only
- **Use Case**: Sensitive administrative operations
- **Implementation**: `@Roles(Role.ADMIN)`
- **Examples**: User management, system configuration

### Pattern 2: Authenticated Users
- **Use Case**: General authenticated operations
- **Implementation**: `@Roles(Role.ADMIN, Role.USER)` or no decorator (default authenticated)
- **Examples**: File upload, profile viewing

### Pattern 3: Owner + Admin
- **Use Case**: Personal data operations
- **Implementation**: Runtime permission check in controller
- **Examples**: Avatar update, personal file management

### Pattern 4: Public Access
- **Use Case**: Public resources
- **Implementation**: `@Public()` decorator
- **Examples**: File downloads, health checks

## 🔍 Security Considerations

### 1. Principle of Least Privilege
- Users have minimal necessary permissions
- Admin privileges are restricted to administrative functions
- Owner-based restrictions prevent unauthorized data access

### 2. Defense in Depth
- Multiple security layers: Authentication → Authorization → Business Logic
- Rate limiting prevents abuse
- Audit logging tracks all access attempts

### 3. Data Isolation
- Users can only access their own data (except admins)
- File operations are scoped to uploader
- Cross-user data access requires admin privileges

## 📊 Access Audit

### Logged Events
```typescript
// Example audit log entry
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "Avatar update attempt",
  "userId": "user-id",
  "targetUserId": "target-user-id", 
  "userRole": "USER",
  "action": "UPDATE_AVATAR",
  "result": "SUCCESS",
  "ip": "192.168.1.1"
}
```

### Monitored Actions
- User creation/modification/deletion
- Avatar updates
- File uploads/downloads/deletions
- Role escalation attempts
- Failed authentication/authorization

## 🚨 Error Handling

### Common HTTP Status Codes
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Valid token but insufficient permissions
- **404 Not Found**: Resource doesn't exist or no access
- **429 Too Many Requests**: Rate limit exceeded

### Security Error Messages
```typescript
// Generic messages to prevent information leakage
"Insufficient permissions"           // Instead of "Admin role required"
"Resource not found"                // Instead of "User X exists but you can't access"
"You can only update your own data" // Clear ownership message
```

## 💡 Best Practices

1. **Always validate ownership** in owner-based endpoints
2. **Use specific error messages** for user experience without revealing sensitive info
3. **Log security events** for audit and monitoring
4. **Apply rate limiting** to prevent abuse
5. **Regular permission reviews** ensure access patterns are correct
6. **Test authorization logic** thoroughly with different user roles
