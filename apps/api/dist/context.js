"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = createContext;
const db_1 = require("./db");
const redis_1 = require("./db/redis");
const auth_1 = require("./utils/auth");
const logger_1 = require("./utils/logger");
async function createContext({ req, res }) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    let user = null;
    if (token) {
        try {
            const decoded = (0, auth_1.verifyToken)(token);
            user = {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            };
        }
        catch (error) {
            logger_1.logger.warn('Invalid token:', error);
        }
    }
    return {
        req,
        res,
        user,
        db: db_1.db,
        redis: redis_1.redis,
        logger: logger_1.logger,
    };
}
//# sourceMappingURL=context.js.map