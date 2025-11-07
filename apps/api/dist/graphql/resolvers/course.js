"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseResolvers = void 0;
const graphql_1 = require("graphql");
exports.courseResolvers = {
    Query: {
        async course(_, { id }, { db }) {
            const result = await db.query(`SELECT id, title, description, creator_id, created_at,
                (SELECT COUNT(*) FROM course_enrollments WHERE course_id = $1) as enrollment_count
         FROM courses WHERE id = $1`, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            return {
                ...result.rows[0],
                enrollmentCount: parseInt(result.rows[0].enrollment_count),
            };
        },
        async courses(_, { limit = 20, offset = 0 }, { db }) {
            const result = await db.query(`SELECT id, title, description, creator_id, created_at,
                (SELECT COUNT(*) FROM course_enrollments WHERE course_id = courses.id) as enrollment_count
         FROM courses
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows.map((row) => ({
                ...row,
                enrollmentCount: parseInt(row.enrollment_count),
            }));
        },
    },
    Mutation: {
        async createCourse(_, { title, description }, { user, db }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            // Check if user is a creator
            const creatorCheck = await db.query(`SELECT approval_status FROM creator_profiles WHERE user_id = $1`, [user.id]);
            if (creatorCheck.rows.length === 0 ||
                creatorCheck.rows[0].approval_status !== 'approved') {
                throw new graphql_1.GraphQLError('Not authorized as creator', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            const result = await db.query(`INSERT INTO courses (title, description, creator_id)
         VALUES ($1, $2, $3)
         RETURNING id, title, description, creator_id, created_at`, [title, description, user.id]);
            return {
                ...result.rows[0],
                enrollmentCount: 0,
            };
        },
        async addModuleToCourse(_, { courseId, title, videoIds }, { user, db }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            // Check ownership
            const courseCheck = await db.query('SELECT creator_id FROM courses WHERE id = $1', [courseId]);
            if (courseCheck.rows.length === 0) {
                throw new graphql_1.GraphQLError('Course not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }
            if (courseCheck.rows[0].creator_id !== user.id && user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            // Get next order
            const orderResult = await db.query('SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM course_modules WHERE course_id = $1', [courseId]);
            const nextOrder = orderResult.rows[0].next_order;
            const result = await db.query(`INSERT INTO course_modules (course_id, title, order_index)
         VALUES ($1, $2, $3)
         RETURNING id, course_id, title, order_index`, [courseId, title, nextOrder]);
            const module = result.rows[0];
            // Link videos
            for (const videoId of videoIds || []) {
                await db.query(`INSERT INTO module_videos (module_id, video_id)
           VALUES ($1, $2)`, [module.id, videoId]);
            }
            return {
                ...module,
                order: nextOrder,
            };
        },
        async enrollInCourse(_, { courseId }, { user, db }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            await db.query(`INSERT INTO course_enrollments (course_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (course_id, user_id) DO NOTHING`, [courseId, user.id]);
            return true;
        },
    },
};
//# sourceMappingURL=course.js.map