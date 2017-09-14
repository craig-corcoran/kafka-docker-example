const kafka = require('kafka-node');
const Consumer = kafka.Consumer;

const { kafkaClient, topics } = require('../utils');

const namedConsumer = new Consumer(kafkaClient, [{ topic: topics.ready }], { autoCommit: true });

namedConsumer.on('error', (err) => {
  // handle error
  console.log(`ERR IN CONSUMER: ${err}`);
});

function listenNamedConsumer() {
  namedConsumer.on('message', (msg) => {
    console.log(msg);
  })
};

module.exports = {
  listenNamedConsumer
}