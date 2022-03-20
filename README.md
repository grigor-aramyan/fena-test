
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
