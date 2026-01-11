const { Pool } = require('pg');
const Redis = require('ioredis');

// --- PostgreSQL ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://chess_user:chess_password_secure@localhost:5433/chess_platform',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test PostgreSQL connection
const connectPostgres = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✅ Connected to PostgreSQL at:', result.rows[0].now);
        client.release();
    } catch (err) {
        console.error('❌ PostgreSQL connection error:', err.message);
        console.error('HINT: Make sure PostgreSQL is running. Use: docker-compose up -d postgres');
        process.exit(1);
    }
};

// Helper for query execution
const query = async (text, params) => {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 100) {
        console.log(`[DB] Slow query (${duration}ms):`, text.substring(0, 100));
    }
    return result;
};

// Helper for transactions
const getClient = async () => {
    const client = await pool.connect();
    const originalQuery = client.query.bind(client);
    const originalRelease = client.release.bind(client);

    // Timeout to auto-release stuck clients
    const timeout = setTimeout(() => {
        console.error('Client checkout timeout - releasing');
        client.release();
    }, 30000);

    client.query = (...args) => {
        return originalQuery(...args);
    };

    client.release = () => {
        clearTimeout(timeout);
        return originalRelease();
    };

    return client;
};

// --- Redis ---
const redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, { family: 4 })
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
        family: 4,
    });

redis.on('connect', () => console.log('✅ Connected to Redis (unified backend)'));
redis.on('error', (err) => console.error('Redis error', err));

module.exports = { 
    connectPostgres, 
    pool, 
    query, 
    getClient,
    redis 
};
