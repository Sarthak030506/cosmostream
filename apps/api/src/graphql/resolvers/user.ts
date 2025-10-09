import { Context } from '../../context';
import { GraphQLError } from 'graphql';

export const userResolvers = {
  Query: {
    async me(_: any, __: any, { user, db }: Context) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const result = await db.query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [user.id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const userData = result.rows[0];
      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role.toUpperCase(),
        createdAt: userData.created_at,
      };
    },

    async user(_: any, { id }: any, { db }: Context) {
      const result = await db.query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toUpperCase(),
        createdAt: user.created_at,
      };
    },
  },

  Mutation: {
    async updateProfile(_: any, { name, bio, avatar }: any, { user, db }: Context) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Update user profile
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (name) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }

      if (updates.length > 0) {
        values.push(user.id);
        await db.query(
          `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`,
          values
        );
      }

      // Update profile fields
      if (bio !== undefined || avatar !== undefined) {
        await db.query(
          `INSERT INTO user_profiles (user_id, bio, avatar)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id)
           DO UPDATE SET bio = COALESCE($2, user_profiles.bio),
                         avatar = COALESCE($3, user_profiles.avatar)`,
          [user.id, bio, avatar]
        );
      }

      const result = await db.query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [user.id]
      );

      const userData = result.rows[0];
      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role.toUpperCase(),
        createdAt: userData.created_at,
      };
    },

    async applyForCreator(_: any, { credentials }: any, { user, db }: Context) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Create or update creator profile
      await db.query(
        `INSERT INTO creator_profiles (user_id, credentials, approval_status, verified)
         VALUES ($1, $2, 'pending', false)
         ON CONFLICT (user_id)
         DO UPDATE SET credentials = $2, approval_status = 'pending'`,
        [user.id, credentials]
      );

      return {
        verified: false,
        approvalStatus: 'PENDING',
        credentials,
        subscriberCount: 0,
        totalViews: 0,
      };
    },
  },

  User: {
    async profile(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        'SELECT avatar, bio, location, website FROM user_profiles WHERE user_id = $1',
        [parent.id]
      );

      return result.rows[0] || null;
    },

    async creatorProfile(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        `SELECT verified, approval_status, credentials,
                (SELECT COUNT(*) FROM subscriptions WHERE creator_id = $1) as subscriber_count,
                (SELECT COALESCE(SUM(views), 0) FROM videos WHERE creator_id = $1) as total_views
         FROM creator_profiles WHERE user_id = $1`,
        [parent.id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const profile = result.rows[0];
      return {
        verified: profile.verified,
        approvalStatus: profile.approval_status.toUpperCase(),
        credentials: profile.credentials,
        subscriberCount: parseInt(profile.subscriber_count),
        totalViews: parseInt(profile.total_views),
      };
    },
  },
};
