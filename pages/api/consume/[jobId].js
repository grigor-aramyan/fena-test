// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],
});

let consumer;
(async function() {
    // KAFKA MESSAGES CONSUMER CONFIGS
    consumer = kafka.consumer({ groupId: 'test-group' });
    await consumer.connect();
})();

export default async function handler(req, res) {
    const {
        jobId
    } = req.query;

    if (!jobId) {
        res.status(400).send({ message: 'Job ID must be present!' });
        return;
    }
    
    try {
        await consumer.subscribe({ topic: jobId });
    } catch {
        // already subscribed, run on
    }
    
    run()
        .then(async (response) => {
            return res.json({ status: response });
        })
        .catch(async (err) => {
            console.log('rejected with error', err);
            return res.status(400).send({ message: 'Error fetching job status' });
        });
}

async function run() {
    let status;
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            status = message.value.toString();
        },
    });
    return new Promise(resolve => setTimeout(async () => {
        await consumer.disconnect();
        resolve(status);
    }, 500));
}
