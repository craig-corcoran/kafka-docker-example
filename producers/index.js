const kafka = require('kafka-node');
const Producer = kafka.Producer;

const { kafkaClient, topics } = require('../utils');

const namedProducer = new Producer(kafkaClient);

const readyQueue = [];
let ready = false;
namedProducer.on('ready', () => {
  ready = true;
});

namedProducer.on('error', (err) => {
  // handle
  console.log(`NAMED PRODUCER ERR: ${err}`);
})

function sendReadyMessage(message) {
  if (!ready) {
    readyQueue.push(message);
  } else {
    const payload = [{
      topic: topics.ready, // Your topic string here
      messages: message,
      attributes: 1 // idk what this is
    }];
    namedProducer.send(payload, (err, data) => {
      // Handle it?
    })
  }
}

module.exports = {
  namedProducerSend: sendReadyMessage
};