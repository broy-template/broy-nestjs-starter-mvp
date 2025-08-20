# Email Service Documentation

## Overview

Email Service menyediakan abstraksi untuk pengiriman email dengan dukungan multiple providers seperti SendGrid, AWS SES, atau Nodemailer. Service ini memudahkan pengiriman email transactional dan template-based.

## Features

### ✅ **Multi-Provider Support**
- SendGrid integration ready
- AWS SES integration ready
- Nodemailer integration ready
- Mock mode untuk testing

### ✅ **Template Support**
- HTML templates
- Dynamic content dengan context
- Common email templates (welcome, reset password)

### ✅ **Development Friendly**
- Mock mode untuk development
- MailHog integration
- Email preview dan debugging

## Basic Usage

### Import and Inject

```typescript
import { EmailService } from '../common/services/email.service';

@Injectable()
export class AuthService {
  constructor(private emailService: EmailService) {}
}
```

### Send Basic Email

```typescript
await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Our Platform',
  html: '<h1>Welcome!</h1><p>Thanks for joining us.</p>',
  text: 'Welcome! Thanks for joining us.'
});
```

### Send Template-based Email

```typescript
// Welcome email
await this.emailService.sendWelcomeEmail('user@example.com', 'John Doe');

// Password reset email
await this.emailService.sendPasswordResetEmail('user@example.com', 'reset-token-123');
```

## Real-world Examples

### User Registration Flow

```typescript
@Injectable()
export class AuthService {
  constructor(
    private emailService: EmailService,
    private userService: UserService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Create user
    const user = await this.userService.create(registerDto);

    // Send welcome email
    const emailSent = await this.emailService.sendWelcomeEmail(
      user.email,
      user.profile?.firstName || 'User'
    );

    if (!emailSent) {
      // Log error but don't fail registration
      console.warn(`Failed to send welcome email to ${user.email}`);
    }

    return this.generateAuthResponse(user);
  }
}
```

### Password Reset Flow

```typescript
@Injectable()
export class AuthService {
  async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Return success even if user not found (security)
      return { success: true };
    }

    // Generate reset token
    const resetToken = this.generateResetToken();
    await this.userService.saveResetToken(user.id, resetToken);

    // Send reset email
    const emailSent = await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { success: emailSent };
  }
}
```

### Order Confirmation

```typescript
@Injectable()
export class OrderService {
  constructor(private emailService: EmailService) {}

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const order = await this.saveOrder(orderData);

    // Send order confirmation
    await this.emailService.sendEmail({
      to: order.customerEmail,
      subject: `Order Confirmation #${order.id}`,
      html: this.renderOrderTemplate(order),
      context: { order }
    });

    return order;
  }

  private renderOrderTemplate(order: Order): string {
    return `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order #${order.id}</p>
      <h2>Order Details:</h2>
      <ul>
        ${order.items.map(item => `
          <li>${item.name} x ${item.quantity} = $${item.total}</li>
        `).join('')}
      </ul>
      <p><strong>Total: $${order.total}</strong></p>
    `;
  }
}
```

### Notification System Integration

```typescript
@Injectable()
export class NotificationService {
  constructor(private emailService: EmailService) {}

  async sendUserNotification(userId: string, notification: NotificationDto): Promise<void> {
    const user = await this.userService.findById(userId);
    
    if (user.emailNotifications) {
      await this.emailService.sendEmail({
        to: user.email,
        subject: notification.title,
        html: this.renderNotificationTemplate(notification),
        context: { user, notification }
      });
    }
  }

  private renderNotificationTemplate(notification: NotificationDto): string {
    return `
      <div style="font-family: Arial, sans-serif;">
        <h2>${notification.title}</h2>
        <p>${notification.body}</p>
        ${notification.actionUrl ? `
          <a href="${notification.actionUrl}" 
             style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            ${notification.actionText || 'View Details'}
          </a>
        ` : ''}
      </div>
    `;
  }
}
```

## Email Templates

### Welcome Email Template

```typescript
export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to {{platformName}}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #f8f9fa; padding: 20px; text-align: center;">
    <h1 style="color: #007bff;">Welcome to {{platformName}}!</h1>
  </div>
  
  <div style="padding: 20px;">
    <p>Hi {{userName}},</p>
    
    <p>Welcome to our platform! We're excited to have you on board.</p>
    
    <h2>Get Started:</h2>
    <ul>
      <li>Complete your profile</li>
      <li>Explore our features</li>
      <li>Join our community</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{dashboardUrl}}" 
         style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
        Go to Dashboard
      </a>
    </div>
    
    <p>If you have any questions, feel free to reach out to our support team.</p>
    
    <p>Best regards,<br>The {{platformName}} Team</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
    <p>© {{currentYear}} {{platformName}}. All rights reserved.</p>
  </div>
</body>
</html>
`;
```

### Password Reset Template

```typescript
export const PASSWORD_RESET_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset Request</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #f8f9fa; padding: 20px; text-align: center;">
    <h1 style="color: #dc3545;">Password Reset Request</h1>
  </div>
  
  <div style="padding: 20px;">
    <p>Hello,</p>
    
    <p>We received a request to reset your password. Click the button below to reset it:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{resetUrl}}" 
         style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      This link will expire in {{expiryHours}} hours.
    </p>
    
    <p style="color: #666; font-size: 14px;">
      If you didn't request this password reset, please ignore this email.
    </p>
    
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    
    <p style="color: #666; font-size: 12px;">
      If the button doesn't work, copy and paste this link in your browser:<br>
      <a href="{{resetUrl}}">{{resetUrl}}</a>
    </p>
  </div>
</body>
</html>
`;
```

## Provider Implementations

### SendGrid Implementation

```typescript
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class SendGridEmailService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get('email.sendgrid.apiKey'));
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await sgMail.send({
        to: options.to,
        from: this.configService.get('email.fromEmail'),
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
  }
}
```

### Nodemailer Implementation

```typescript
import * as nodemailer from 'nodemailer';

@Injectable()
export class NodemailerEmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get('email.smtp.host'),
      port: this.configService.get('email.smtp.port'),
      secure: this.configService.get('email.smtp.secure'),
      auth: {
        user: this.configService.get('email.smtp.user'),
        pass: this.configService.get('email.smtp.password'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('email.fromEmail'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error('SMTP error:', error);
      return false;
    }
  }
}
```

## Testing

### Mock Email Service

```typescript
describe('AuthService', () => {
  let authService: AuthService;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const mockEmail = {
      sendEmail: jest.fn().mockResolvedValue(true),
      sendWelcomeEmail: jest.fn().mockResolvedValue(true),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mockEmailService = module.get(EmailService);
  });

  it('should send welcome email on registration', async () => {
    const registerDto = { email: 'test@example.com', password: 'password' };
    
    await authService.register(registerDto);

    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(String)
    );
  });
});
```

### Email Testing dengan MailHog

```typescript
// For development testing
const emailService = new EmailService(configService);

// This will be caught by MailHog on http://localhost:8025
await emailService.sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>This is a test email</p>'
});
```

## Configuration

### Environment Variables

```bash
# Email Provider Selection
EMAIL_PROVIDER=sendgrid # or 'nodemailer' or 'mock'

# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# SMTP Configuration (for Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# MailHog (Development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
```

## Best Practices

### 1. Handle Email Failures Gracefully

```typescript
async sendWelcomeEmail(email: string, name: string): Promise<void> {
  try {
    const success = await this.emailService.sendWelcomeEmail(email, name);
    if (!success) {
      // Log error but don't throw - registration should still succeed
      this.logger.warn(`Failed to send welcome email to ${email}`);
    }
  } catch (error) {
    this.logger.error('Email service error:', error);
  }
}
```

### 2. Use Email Queues for Production

```typescript
// For high volume, use background jobs
@Injectable()
export class EmailQueueService {
  async queueWelcomeEmail(email: string, name: string): Promise<void> {
    await this.queue.add('send-welcome-email', { email, name });
  }
}
```

### 3. Template Validation

```typescript
private validateEmailTemplate(template: string, context: any): boolean {
  // Check if all required variables are provided
  const requiredVars = template.match(/\{\{(\w+)\}\}/g) || [];
  return requiredVars.every(variable => {
    const key = variable.replace(/\{\{|\}\}/g, '');
    return context.hasOwnProperty(key);
  });
}
```

Email Service ini memberikan foundation yang solid untuk email functionality di aplikasi MVP Anda! 📧
