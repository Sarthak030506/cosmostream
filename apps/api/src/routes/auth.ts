import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { generateToken, generateRefreshToken } from '../utils/auth';
import { sendWelcomeEmail } from '../utils/email';
import { pool as db } from '../db';

const router = express.Router();

// Check if Google OAuth is configured
const isGoogleOAuthConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (isGoogleOAuthConfigured) {
  // Configure Google OAuth Strategy only if credentials are set
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL || 'http://localhost:4000'}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || 'User';

          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          // Check if user exists
          const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);

          let user;

          if (existingUser.rows.length > 0) {
            // User exists - update OAuth provider if not already added
            user = existingUser.rows[0];

            const oauthProviders = user.oauth_providers || [];
            if (!oauthProviders.includes('google')) {
              oauthProviders.push('google');
              await db.query('UPDATE users SET oauth_providers = $1 WHERE id = $2', [
                JSON.stringify(oauthProviders),
                user.id,
              ]);
            }
          } else {
            // Create new user
            const result = await db.query(
              `INSERT INTO users (email, password_hash, name, role, oauth_providers)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING *`,
              [
                email,
                '', // Empty password hash for OAuth users
                name,
                'viewer',
                JSON.stringify(['google']),
              ]
            );

            user = result.rows[0];

            // Send welcome email (don't await)
            sendWelcomeEmail(email, name).catch((error) => {
              console.error('Failed to send welcome email:', error);
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize/deserialize user (required by passport)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, result.rows[0]);
    } catch (error) {
      done(error);
    }
  });

  // Google OAuth routes

  // Initiate Google OAuth login
  router.get(
    '/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })
  );

  // Google OAuth callback
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth_failed' }),
    (req, res) => {
      try {
        const user = req.user as any;

        // Generate JWT tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // Redirect to frontend with tokens in URL
        // In production, consider using httpOnly cookies instead
        const webUrl = process.env.WEB_URL || 'http://localhost:3000';
        const redirectUrl = `${webUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}`;

        res.redirect(redirectUrl);
      } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.WEB_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      }
    }
  );

  console.log('✅ Google OAuth configured and enabled');
} else {
  // Google OAuth not configured - provide placeholder routes
  router.get('/google', (req, res) => {
    res.status(503).send('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.');
  });

  router.get('/google/callback', (req, res) => {
    res.redirect(`${process.env.WEB_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  });

  console.log('⚠️  Google OAuth not configured - email/password authentication still available');
}

export default router;
