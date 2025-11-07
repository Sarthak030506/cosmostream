"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables FIRST before any other imports
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const schema_1 = require("./graphql/schema");
const resolvers_1 = require("./graphql/resolvers");
const context_1 = require("./context");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const db_1 = require("./db");
const youtube_1 = require("./services/youtube");
const youtube_sync_1 = require("./services/youtube-sync");
const youtube_filters_1 = require("./utils/youtube-filters");
const youtube_sync_cron_1 = require("./jobs/youtube-sync-cron");
const news_sync_1 = require("./services/news-sync");
const news_sync_cron_1 = require("./jobs/news-sync-cron");
const passport_1 = __importDefault(require("passport"));
const auth_1 = __importDefault(require("./routes/auth"));
const PORT = process.env.PORT || 4000;
// Log environment variables for debugging
logger_1.logger.info('Environment variables loaded:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET',
    REDIS_URL: process.env.REDIS_URL ? 'Set (hidden)' : 'NOT SET',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set (hidden)' : 'NOT SET',
});
async function startServer() {
    const app = (0, express_1.default)();
    // Security middleware
    app.use((0, helmet_1.default)({ contentSecurityPolicy: process.env.NODE_ENV === 'production' }));
    // Rate limiting
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/graphql', limiter);
    // CORS
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
        credentials: true,
    }));
    // Logging
    app.use((0, morgan_1.default)('combined', { stream: { write: (message) => logger_1.logger.info(message.trim()) } }));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    // Initialize Passport for OAuth
    app.use(passport_1.default.initialize());
    // Health check
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // Auth routes (OAuth)
    app.use('/auth', auth_1.default);
    // Apollo Server setup
    const server = new server_1.ApolloServer({
        typeDefs: schema_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        formatError: (error) => {
            logger_1.logger.error('GraphQL Error:', error);
            return error;
        },
        introspection: process.env.NODE_ENV !== 'production',
    });
    await server.start();
    app.use('/graphql', (0, express4_1.expressMiddleware)(server, {
        context: context_1.createContext,
    }));
    // Error handling
    app.use(errorHandler_1.errorHandler);
    // Initialize YouTube services (if API key is configured)
    if (process.env.YOUTUBE_API_KEY) {
        try {
            logger_1.logger.info('Initializing YouTube integration services...');
            // Initialize services
            (0, youtube_1.initYouTubeService)(db_1.pool, logger_1.logger);
            (0, youtube_filters_1.initYouTubeContentFilter)(logger_1.logger);
            (0, youtube_sync_1.initYouTubeSyncService)(db_1.pool, logger_1.logger);
            // Initialize and start cron job for automated syncing
            const cronJob = (0, youtube_sync_cron_1.initYouTubeSyncCronJob)(db_1.pool, logger_1.logger);
            cronJob.start();
            logger_1.logger.info('✅ YouTube integration services initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize YouTube services:', error);
            logger_1.logger.warn('YouTube integration will be disabled');
        }
    }
    else {
        logger_1.logger.warn('YOUTUBE_API_KEY not set - YouTube integration disabled');
    }
    // Initialize News Sync Services (always enabled)
    try {
        logger_1.logger.info('Initializing news sync services...');
        // Initialize news sync service
        (0, news_sync_1.initNewsSyncService)(db_1.pool, logger_1.logger);
        // Initialize and start cron job for automated news fetching
        const newsCronJob = (0, news_sync_cron_1.initNewsSyncCronJob)(db_1.pool, logger_1.logger);
        newsCronJob.start();
        logger_1.logger.info('✅ News sync services initialized successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize news sync services:', error);
        logger_1.logger.warn('News sync will be disabled');
    }
    app.listen(PORT, () => {
        logger_1.logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    });
}
startServer().catch((error) => {
    logger_1.logger.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map