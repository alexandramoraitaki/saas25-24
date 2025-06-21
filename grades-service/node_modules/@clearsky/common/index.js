// common/index.js
const amqp = require('amqplib');

let channel = null;

async function connectWithRetry(retries = 5, delayMs = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
    } catch (err) {
      console.warn(
        `RabbitMQ connection failed (${i+1}/${retries}), retrying in ${delayMs}ms…`
      );
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('Unable to connect to RabbitMQ after retries');
}

async function getChannel() {
  if (channel) return channel;
  const conn = await connectWithRetry();
  channel = await conn.createChannel();
  await channel.assertExchange('clearSKY.events', 'topic', { durable: true });
  return channel;
}

module.exports = { getChannel };
