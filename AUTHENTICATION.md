# CosmoStream Authentication System

## Overview

CosmoStream uses a simple, secure authentication system with support for:
- **Email/Password signup and login**
- **Google OAuth 2.0 login**
- **Password reset via email**
- **JWT-based session management**

---

## Features

✅ Email/password authentication with bcrypt hashing
✅ Google OAuth 2.0 integration
✅ Password reset via secure email tokens
✅ JWT access tokens (7-day expiry)
✅ Refresh tokens (30-day expiry)
✅ Welcome emails on signup
✅ Role-based access control (viewer, creator, admin)
✅ Responsive, mobile-friendly UI
✅ Security best practices implemented

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer',
    oauth_providers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP
);
```

---

## Environment Variables

### API Configuration (`apps/api/.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cosmostream

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API URL (for OAuth callbacks)
API_URL=http://localhost:4000

# Frontend URL (for redirects)
WEB_URL=http://localhost:3000

# Email Configuration (for password reset)
# Development: Emails logged to console
# Production: Use real SMTP service

# For Gmail SMTP:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM="CosmoStream" <noreply@cosmostream.com>

# For SendGrid:
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_USER=apikey
# EMAIL_PASSWORD=your-sendgrid-api-key

NODE_ENV=development
```

### Web Configuration (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
# API dependencies
cd apps/api
npm install nodemailer passport passport-google-oauth20
npm install --save-dev @types/nodemailer @types/passport @types/passport-google-oauth20

# Web dependencies (already installed)
cd ../web
npm install @apollo/client graphql
```

### 2. Database Setup

```bash
# Run migrations to create tables
make db-migrate

# Or manually:
psql -d cosmostream -f database/schema.sql
```

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Set **Authorized redirect URIs**:
   - Development: `http://localhost:4000/auth/google/callback`
   - Production: `https://your-api-domain.com/auth/google/callback`
7. Copy **Client ID** and **Client Secret** to `.env`

### 4. Configure Email Service

#### For Development (Logs to Console)
No configuration needed! Emails will be logged to the console.

#### For Production with Gmail

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App-Specific Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail" → "Other (Custom name)"
3. Use this password in `EMAIL_PASSWORD` environment variable

#### For Production with SendGrid

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Configure environment variables:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   ```

### 5. Update API Server to Use Auth Routes

Add to `apps/api/src/index.ts`:

```typescript
import authRoutes from './routes/auth';
import passport from 'passport';

// Before GraphQL middleware
app.use(passport.initialize());
app.use('/auth', authRoutes);
```

### 6. Start the Application

```bash
# Start all services
npm run dev

# Or start individually
cd apps/api && npm run dev
cd apps/web && npm run dev
```

---

## User Flows

### Email/Password Signup

1. User visits `/signup`
2. Enters name, email, password (min 8 chars)
3. Clicks "Create Account"
4. Account created, welcome email sent
5. Automatically logged in with JWT tokens
6. Redirected to homepage

### Email/Password Login

1. User visits `/login`
2. Enters email and password
3. Clicks "Sign In"
4. JWT tokens generated and stored
5. Redirected to homepage

### Google OAuth Login/Signup

1. User clicks "Login with Google" button
2. Redirected to Google OAuth consent screen
3. User approves access
4. Redirected back to `/auth/google/callback`
5. User found/created in database
6. JWT tokens generated
7. Redirected to `/auth/callback` with tokens
8. Tokens stored in localStorage
9. Redirected to homepage

### Password Reset

1. User clicks "Forgot password?" on login page
2. Redirected to `/forgot-password`
3. Enters email address
4. Secure reset token generated (1-hour expiry)
5. Email sent with reset link
6. User clicks link in email
7. Redirected to `/reset-password/[token]`
8. Enters new password (min 8 chars)
9. Password updated, token marked as used
10. Redirected to login page

---

## API Endpoints

### GraphQL Mutations

```graphql
# Sign up with email/password
mutation Signup($email: String!, $password: String!, $name: String!) {
  signup(email: $email, password: $password, name: $name) {
    token
    refreshToken
    user {
      id
      email
      name
      role
    }
  }
}

# Login with email/password
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    refreshToken
    user {
      id
      email
      name
      role
    }
  }
}

# Request password reset
mutation RequestPasswordReset($email: String!) {
  requestPasswordReset(email: $email) {
    success
    message
  }
}

# Reset password with token
mutation ResetPassword($token: String!, $newPassword: String!) {
  resetPassword(token: $token, newPassword: $newPassword) {
    success
    message
  }
}

# Refresh access token
mutation RefreshToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    token
    refreshToken
    user {
      id
      email
      name
      role
    }
  }
}
```

### REST Endpoints (OAuth)

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback handler

---

## Security Features

### Password Security
- **bcrypt hashing** with 10 salt rounds
- **Minimum 8 characters** required
- **No maximum length** (bcrypt truncates at 72 chars)

### Token Security
- **JWT access tokens** expire in 7 days
- **Refresh tokens** expire in 30 days
- **Secure random tokens** for password reset (32 bytes)
- **1-hour expiry** for password reset tokens
- **One-time use** reset tokens

### Email Security
- **No email enumeration** - same success message whether email exists or not
- **Secure token generation** using crypto.randomBytes
- **Token invalidation** after successful password reset

### OAuth Security
- **State parameter** validation (handled by Passport.js)
- **HTTPS required** in production
- **Secure redirect URIs**

---

## Testing

### Manual Testing

```bash
# Test signup
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { signup(email:\"test@example.com\", password:\"password123\", name:\"Test User\") { token user { email } } }"}'

# Test login
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(email:\"test@example.com\", password:\"password123\") { token user { email } } }"}'

# Test password reset request
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { requestPasswordReset(email:\"test@example.com\") { success message } }"}'
```

### Test Google OAuth Flow

1. Visit `http://localhost:3000/login`
2. Click "Login with Google"
3. Sign in with Google account
4. Verify redirect to homepage with token

---

## Troubleshooting

### Google OAuth Not Working

**Error**: "Redirect URI mismatch"
- **Solution**: Add exact callback URL to Google Cloud Console
- Check `API_URL` environment variable matches your setup

**Error**: "Access blocked: This app's request is invalid"
- **Solution**: Configure OAuth consent screen in Google Cloud Console
- Add test users if app is in testing mode

### Email Not Sending

**Development**: Check console logs - emails are logged, not sent
**Production**:
- Verify SMTP credentials
- Check email provider settings
- Enable "Less secure app access" (Gmail)
- Use App-Specific Password (Gmail with 2FA)

### Password Reset Token Invalid

- Tokens expire after 1 hour
- Tokens are one-time use only
- Check system time is synchronized
- Verify database table exists

### JWT Token Issues

- Verify `JWT_SECRET` is set correctly
- Check token hasn't expired
- Ensure Authorization header format: `Bearer <token>`

---

## Production Checklist

Before deploying to production:

- [ ] Change all JWT secrets to strong random values
- [ ] Set up real SMTP email service (SendGrid recommended)
- [ ] Configure Google OAuth with production URLs
- [ ] Enable HTTPS for API and Web app
- [ ] Set `NODE_ENV=production`
- [ ] Remove or comment out demo users in seed file
- [ ] Set up database backups
- [ ] Configure rate limiting on auth endpoints
- [ ] Set up monitoring and logging (Sentry, etc.)
- [ ] Test password reset flow end-to-end
- [ ] Test Google OAuth flow end-to-end
- [ ] Configure CORS properly
- [ ] Use HttpOnly cookies for tokens (more secure than localStorage)

---

## Additional Features (Future)

Potential enhancements:

- [ ] Two-factor authentication (2FA)
- [ ] Email verification on signup
- [ ] Remember device/session management
- [ ] Social login with GitHub, Facebook
- [ ] Account deletion
- [ ] Change password (while logged in)
- [ ] Login activity log
- [ ] Rate limiting on login attempts
- [ ] Account lockout after failed attempts
- [ ] Magic link authentication (passwordless)

---

## Support

For questions or issues:
- Check troubleshooting section above
- Review environment variable configuration
- Check console logs for errors
- Verify database schema is up to date

---

**Last Updated**: 2025-10-19
**Version**: 1.0.0
