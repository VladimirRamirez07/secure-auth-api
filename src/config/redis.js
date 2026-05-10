const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

const connectRedis = async () => {
  try {
    await client.connect();
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.error('❌ Redis connection error:', error.message);
    process.exit(1);
  }
};

client.on('error', (err) => console.error('Redis error:', err));

module.exports = { client, connectRedis };