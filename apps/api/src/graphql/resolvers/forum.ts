import { Context } from '../../context';
import { GraphQLError } from 'graphql';

export const forumResolvers = {
  Query: {
    async thread(_: any, { id }: any, { db }: Context) {
      const result = await db.query(
        `SELECT id, title, creator_id, category, tags, created_at, updated_at,
                (SELECT COUNT(*) FROM posts WHERE thread_id = $1) as post_count
         FROM threads WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return {
        ...result.rows[0],
        postCount: parseInt(result.rows[0].post_count),
      };
    },

    async threads(
      _: any,
      { category, limit = 20, offset = 0 }: any,
      { db }: Context
    ) {
      let query = `
        SELECT id, title, creator_id, category, tags, created_at, updated_at,
               (SELECT COUNT(*) FROM posts WHERE thread_id = threads.id) as post_count
        FROM threads
      `;
      const params: any[] = [];
      let paramCount = 1;

      if (category) {
        query += ` WHERE category = $${paramCount++}`;
        params.push(category);
      }

      query += ` ORDER BY updated_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows.map((row) => ({
        ...row,
        postCount: parseInt(row.post_count),
      }));
    },
  },

  Mutation: {
    async createThread(
      _: any,
      { title, category, tags, content }: any,
      { user, db }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Create thread
      const threadResult = await db.query(
        `INSERT INTO threads (title, creator_id, category, tags)
         VALUES ($1, $2, $3, $4)
         RETURNING id, title, creator_id, category, tags, created_at, updated_at`,
        [title, user.id, category, tags || []]
      );

      const thread = threadResult.rows[0];

      // Create first post
      await db.query(
        `INSERT INTO posts (thread_id, author_id, content)
         VALUES ($1, $2, $3)`,
        [thread.id, user.id, content]
      );

      return {
        ...thread,
        postCount: 1,
      };
    },

    async createPost(
      _: any,
      { threadId, content }: any,
      { user, db }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check if thread exists
      const threadCheck = await db.query(
        'SELECT id FROM threads WHERE id = $1',
        [threadId]
      );

      if (threadCheck.rows.length === 0) {
        throw new GraphQLError('Thread not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const result = await db.query(
        `INSERT INTO posts (thread_id, author_id, content, votes)
         VALUES ($1, $2, $3, 0)
         RETURNING id, thread_id, author_id, content, votes, is_expert_answer, created_at, updated_at`,
        [threadId, user.id, content]
      );

      // Update thread updated_at
      await db.query('UPDATE threads SET updated_at = NOW() WHERE id = $1', [
        threadId,
      ]);

      return result.rows[0];
    },

    async votePost(
      _: any,
      { postId, value }: any,
      { user, db }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Record vote
      await db.query(
        `INSERT INTO post_votes (post_id, user_id, value)
         VALUES ($1, $2, $3)
         ON CONFLICT (post_id, user_id)
         DO UPDATE SET value = $3`,
        [postId, user.id, value]
      );

      // Update post votes count
      await db.query(
        `UPDATE posts
         SET votes = (SELECT COALESCE(SUM(value), 0) FROM post_votes WHERE post_id = $1)
         WHERE id = $1`,
        [postId]
      );

      const result = await db.query(
        `SELECT id, thread_id, author_id, content, votes, is_expert_answer, created_at, updated_at
         FROM posts WHERE id = $1`,
        [postId]
      );

      return result.rows[0];
    },
  },

  Thread: {
    createdAt(parent: any) {
      // Map snake_case to camelCase
      return parent.created_at;
    },

    updatedAt(parent: any) {
      // Map snake_case to camelCase
      return parent.updated_at;
    },

    async creator(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [parent.creator_id]
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

    async posts(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        `SELECT id, thread_id, author_id, content, votes, is_expert_answer, created_at, updated_at
         FROM posts WHERE thread_id = $1
         ORDER BY votes DESC, created_at ASC`,
        [parent.id]
      );

      return result.rows;
    },
  },

  Post: {
    createdAt(parent: any) {
      // Map snake_case to camelCase
      return parent.created_at;
    },

    updatedAt(parent: any) {
      // Map snake_case to camelCase
      return parent.updated_at;
    },

    isExpertAnswer(parent: any) {
      // Map snake_case to camelCase
      return parent.is_expert_answer;
    },

    async thread(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        `SELECT id, title, creator_id, category, tags, created_at, updated_at
         FROM threads WHERE id = $1`,
        [parent.thread_id]
      );

      return result.rows[0];
    },

    async author(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [parent.author_id]
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
};
