const redis = require('redis');

const redisClient = redis.createClient({
    socket: {
        host: 'attendance_redis_server',
        port: 6379
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

(async() => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
})();

module.exports = redisClient;