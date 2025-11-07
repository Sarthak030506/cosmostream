"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResolvers = void 0;
const auth_1 = require("../../utils/auth");
const email_1 = require("../../utils/email");
const graphql_1 = require("graphql");
const crypto_1 = __importDefault(require("crypto"));
exports.authResolvers = {
    Mutation: {
        async signup(_, { email, password, name }, { db }) {
            // Check if user exists
            const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                throw new graphql_1.GraphQLError('User already exists', {
                    extensions: { code: 'USER_EXISTS' },
                });
            }
            // Hash password
            const passwordHash = await (0, auth_1.hashPassword)(password);
            // Create user
            const result = await db.query(`INSERT INTO users (email, password_hash, name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, role, created_at`, [email, passwordHash, name, 'creator']);
            const user = result.rows[0];
            // Send welcome email (async, don't await to avoid delaying response)
            (0, email_1.sendWelcomeEmail)(email, name).catch((error) => {
                console.error('Failed to send welcome email:', error);
            });
            // Generate tokens
            const token = (0, auth_1.generateToken)(user);
            const refreshToken = (0, auth_1.generateRefreshToken)(user);
            return {
                token,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role.toUpperCase(),
                    createdAt: user.created_at,
                },
            };
        },
        async login(_, { email, password }, { db }) {
            // Find user
            const result = await db.query('SELECT id, email, name, role, password_hash, created_at FROM users WHERE email = $1', [email]);
            if (result.rows.length === 0) {
                throw new graphql_1.GraphQLError('Invalid credentials', {
                    extensions: { code: 'INVALID_CREDENTIALS' },
                });
            }
            const user = result.rows[0];
            // Verify password
            const valid = await (0, auth_1.comparePassword)(password, user.password_hash);
            if (!valid) {
                throw new graphql_1.GraphQLError('Invalid credentials', {
                    extensions: { code: 'INVALID_CREDENTIALS' },
                });
            }
            // Generate tokens
            const token = (0, auth_1.generateToken)(user);
            const refreshToken = (0, auth_1.generateRefreshToken)(user);
            return {
                token,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role.toUpperCase(),
                    createdAt: user.created_at,
                },
            };
        },
        async refreshToken(_, { refreshToken }, { db }) {
            // Verify refresh token (simplified - should check against stored tokens)
            const decoded = (0, auth_1.generateToken)({ id: '', email: '', role: '' }); // Placeholder
            const result = await db.query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [decoded.userId]);
            if (result.rows.length === 0) {
                throw new graphql_1.GraphQLError('Invalid token', {
                    extensions: { code: 'INVALID_TOKEN' },
                });
            }
            const user = result.rows[0];
            const newToken = (0, auth_1.generateToken)(user);
            const newRefreshToken = (0, auth_1.generateRefreshToken)(user);
            return {
                token: newToken,
                refreshToken: newRefreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role.toUpperCase(),
                    createdAt: user.created_at,
                },
            };
        },
        async requestPasswordReset(_, { email }, { db }) {
            // Find user by email
            const result = await db.query('SELECT id, name FROM users WHERE email = $1', [email]);
            // Always return success even if user doesn't exist (security best practice)
            // This prevents email enumeration attacks
            if (result.rows.length === 0) {
                return {
                    success: true,
                    message: 'If an account with that email exists, we sent a password reset link.',
                };
            }
            const user = result.rows[0];
            // Generate secure random token
            const resetToken = crypto_1.default.randomBytes(32).toString('hex');
            // Set expiry to 1 hour from now
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);
            // Store token in database
            await db.query(`INSERT INTO password_reset_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)`, [user.id, resetToken, expiresAt]);
            // Send password reset email
            try {
                await (0, email_1.sendPasswordResetEmail)(email, resetToken, user.name);
            }
            catch (error) {
                // Log error but don't expose it to user
                console.error('Failed to send password reset email:', error);
                throw new graphql_1.GraphQLError('Failed to send password reset email. Please try again later.', {
                    extensions: { code: 'EMAIL_SEND_FAILED' },
                });
            }
            return {
                success: true,
                message: 'If an account with that email exists, we sent a password reset link.',
            };
        },
        async resetPassword(_, { token, newPassword }, { db }) {
            // Validate password length
            if (newPassword.length < 8) {
                throw new graphql_1.GraphQLError('Password must be at least 8 characters long', {
                    extensions: { code: 'INVALID_PASSWORD' },
                });
            }
            // Find valid, unused token that hasn't expired
            const tokenResult = await db.query(`SELECT prt.id, prt.user_id, u.email, u.name
         FROM password_reset_tokens prt
         JOIN users u ON prt.user_id = u.id
         WHERE prt.token = $1
         AND prt.used = FALSE
         AND prt.expires_at > NOW()`, [token]);
            if (tokenResult.rows.length === 0) {
                throw new graphql_1.GraphQLError('Invalid or expired reset token', {
                    extensions: { code: 'INVALID_TOKEN' },
                });
            }
            const resetRecord = tokenResult.rows[0];
            // Hash new password
            const passwordHash = await (0, auth_1.hashPassword)(newPassword);
            // Update user's password
            await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, resetRecord.user_id]);
            // Mark token as used
            await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [resetRecord.id]);
            return {
                success: true,
                message: 'Your password has been successfully reset. You can now log in with your new password.',
            };
        },
    },
};
//# sourceMappingURL=auth.js.map