// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const Queue = require('bull');
const { v4: uuidv4 } = require('uuid');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],
});

let admin;
let producer;
(async function() {
    // KAFKA ADMIN CONFIGS
    admin = kafka.admin();
    await admin.connect();


    // KAFKA MESSAGE PRODUCER CONFIGS
    producer = kafka.producer();
    await producer.connect();
})();


// REDIS CONFIGS FOR BULL QUEUE PROCESSOR
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;
const queueName = 'routine_jobs';

const routineJobsQueue = new Queue(queueName, { redis: { port: redisPort, host: redisHost } });

routineJobsQueue.process(async function (job, done) {
  const {
      id,
      count
  } = job.data;

  // create topic in kafka queue with name of job id
  await admin.createTopics({
      validateOnly: false,
      topics: [
        { topic: id }
      ],
  });

  let sentEmails = [];
  for (let i = 0; i < count; i++) {
      // ######----------- email sending logic goes here --------------#####

      sentEmails.push(i + 1);

      if (sentEmails.length == 10) {
            const emailsToSend = sentEmails.map(n => {
                return ({
                    value: n + ''
                });
            })
            await producer.send({
                topic: id,
                messages: emailsToSend,
            });
            sentEmails = [];
      }
  }

  if (sentEmails.length > 0) {
    const emailsToSend = sentEmails.map(n => {
        return ({
            value: n + ''
        });
    });
    
    await producer.send({
        topic: id,
        messages: emailsToSend,
    });
  }

  done();
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(404).send({ message: 'Only POST requests allowed' })
        return;
    }

    const {
        count
    } = req.body;

    if (!count || count < 1) {
        res.status(400).send({ message: 'Number must be greater than 0' });
        return;
    }

    const jobId = uuidv4();

    const payload = {
        id: jobId,
        count
    };

    await routineJobsQueue.add(payload);
    
    res.json({
        jobId,
        status: 1
    });
}
