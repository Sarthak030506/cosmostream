"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminResolvers = void 0;
const graphql_1 = require("graphql");
// Helper function to check if user is admin
function requireAdmin(user) {
    if (!user) {
        throw new graphql_1.GraphQLError('Not authenticated', {
            extensions: { code: 'UNAUTHENTICATED' },
        });
    }
    if (user.role !== 'admin') {
        throw new graphql_1.GraphQLError('Admin access required', {
            extensions: { code: 'FORBIDDEN' },
        });
    }
}
exports.adminResolvers = {
    Query: {
        async users(_, { search, limit = 50, offset = 0 }, { user, db }) {
            requireAdmin(user);
            let query = 'SELECT id, email, name, role, created_at FROM users';
            const values = [];
            const conditions = [];
            // Add search condition if provided
            if (search) {
                conditions.push('(name ILIKE $1 OR email ILIKE $1)');
                values.push(`%${search}%`);
            }
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            // Add ordering and pagination
            query += ' ORDER BY created_at DESC';
            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM users${conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''}`;
            const countResult = await db.query(countQuery, values);
            const totalCount = parseInt(countResult.rows[0].total);
            // Add limit and offset
            const limitValue = Math.min(limit, 100); // Cap at 100
            query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
            values.push(limitValue, offset);
            const result = await db.query(query, values);
            const users = result.rows.map((row) => ({
                id: row.id,
                email: row.email,
                name: row.name,
                role: row.role.toUpperCase(),
                createdAt: row.created_at,
            }));
            return {
                items: users,
                hasMore: offset + users.length < totalCount,
                totalCount,
            };
        },
    },
    Mutation: {
        async updateUserRole(_, { userId, role }, { user, db }) {
            requireAdmin(user);
            // Validate role
            const validRoles = ['VIEWER', 'CREATOR', 'ADMIN'];
            if (!validRoles.includes(role)) {
                throw new graphql_1.GraphQLError('Invalid role', {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }
            // Check if user exists
            const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
            if (userCheck.rows.length === 0) {
                throw new graphql_1.GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }
            // Prevent admin from changing their own role
            if (userId === user?.id) {
                throw new graphql_1.GraphQLError('Cannot change your own role', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            // Update user role
            await db.query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2', [
                role.toLowerCase(),
                userId,
            ]);
            // Return updated user
            const result = await db.query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [userId]);
            const userData = result.rows[0];
            return {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role.toUpperCase(),
                createdAt: userData.created_at,
            };
        },
        async deleteUser(_, { userId }, { user, db }) {
            requireAdmin(user);
            // Check if user exists
            const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
            if (userCheck.rows.length === 0) {
                throw new graphql_1.GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }
            // Prevent admin from deleting themselves
            if (userId === user?.id) {
                throw new graphql_1.GraphQLError('Cannot delete your own account', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            try {
                // Delete user (cascading deletes should handle related records)
                await db.query('DELETE FROM users WHERE id = $1', [userId]);
                return true;
            }
            catch (error) {
                console.error('Error deleting user:', error);
                throw new graphql_1.GraphQLError('Failed to delete user', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }
        },
    },
};
//# sourceMappingURL=admin.js.map