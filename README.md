
## Technologies Used

- [Redis](https://redis.io/)
- [Bull](https://github.com/OptimalBits/bull), Node js background workers (based on Redis)
- [Kafka](https://kafka.apache.org/)
- [KafkaJS](https://kafka.js.org/), Node js wrapper for Apache Kafka
- [SocketIO](https://socket.io/)

## How To Install
Setted it up on Win 10 using following tutorials, so leaving the links here in case won't have much time for making Docker container

- [Redis On Win10](https://hackthedeveloper.com/how-to-install-redis-on-windows-10/)
- [Kafka on Win10](https://habr.com/ru/post/496182/), it's on Russian, so if you'll have some problems with it, just let me know. I'll translate the main instructions
- After Redis and Kafka are installed, checked and started up from terminals, install the dependencies of project,
```bash
npm i
```
it will install bull, kafka js and all other packages required for running the app.

## How To Run

Just type:

```bash
npm run dev
# or
yarn dev
```
and server will start up on http://localhost:3000

## Flow
- On submitting number from input field api handler picks it up, generates id for background job, passes data to workers queue (bull) and immediately returs with job id as a response payload
- Background worker creates new Kafka topic with supplied job id
- Background worker then loops within the range of submitted number producing new log in that topic and emitting socket event with every iteration
- React page are listening to this events and with every message it updates the status of job on the page
- Some values are stored within localStorage in case browser will be closed before job completion or some other unexpected factor
- When background worker finishes it's job and the last status is emitted to client side localStorage is cleared
- If browser closes before it on next visit to page app checkes whether ther're appropriate values within the localStorage and upon finding them client side fetches the last log message from kafka topic with traditional http request and cleares stored values from localStorage

## Possible Problems With Scaling
- There are some issues with state and localStorage values while processing large number and fast messages from socket. Documented in code. Need further investigation
- On back end deliver.js and socket.js seems scalable, though consume/jobId.js handler can be a bottleneck or reason for unexpected behaviours or errors. Possible solutions can be delegation of kafka topic consumption to background workers as well or appropriate settings of web server so that concurrent requests can utilize separate kafka consumers
- For production environment, long running separate server (other than next) can be set up so it can listen/consume kafka logs w/o interruption, insert them into traditional/cloud db, so the unfinished job client can query the db directly and not the kafka client itself (they are designed as long runners, so picking up last message and disconnecting them with every request is not the best idea)
- Not the problem of scaling but would be awesome to find a way to create kafka consumer directly in React and consume logs from them w/o the need for intermediary socket
