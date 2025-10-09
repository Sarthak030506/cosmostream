import { Context } from '../../context';
import { hashPassword, comparePassword, generateToken, generateRefreshToken } from '../../utils/auth';
import { GraphQLError } from 'graphql';

export const authResolvers = {
  Mutation: {
    async signup(_: any, { email, password, name }: any, { db }: Context) {
      // Check if user exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new GraphQLError('User already exists', {
          extensions: { code: 'USER_EXISTS' },
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const result = await db.query(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, role, created_at`,
        [email, passwordHash, name, 'viewer']
      );

      const user = result.rows[0];

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

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

    async login(_: any, { email, password }: any, { db }: Context) {
      // Find user
      const result = await db.query(
        'SELECT id, email, name, role, password_hash, created_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'INVALID_CREDENTIALS' },
        });
      }

      const user = result.rows[0];

      // Verify password
      const valid = await comparePassword(password, user.password_hash);
      if (!valid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'INVALID_CREDENTIALS' },
        });
      }

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

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

    async refreshToken(_: any, { refreshToken }: any, { db }: Context) {
      // Verify refresh token (simplified - should check against stored tokens)
      const decoded: any = generateToken({ id: '', email: '', role: '' }); // Placeholder

      const result = await db.query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('Invalid token', {
          extensions: { code: 'INVALID_TOKEN' },
        });
      }

      const user = result.rows[0];
      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

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
  },
};
