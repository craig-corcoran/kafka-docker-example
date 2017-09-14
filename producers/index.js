const kafka = require('kafka-node');
const Producer = kafka.Producer;

const { kafkaClient, topics } = require('../utils');

const namedProducer = new Producer(kafkaClient, {
  requireAcks: 1,
  ackTimeoutMs: 500,
});

const retryQueue = [];
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
    retryQueue.push(message);
  } else {
    const payload = [{
      topic: topics.ready, // Your topic string here
      messages: message,
      attributes: 1
    }];
    namedProducer.send(payload, (err, data) => {
      if (err) {
        console.log(`ERR SENDING PRODUCER MESSAGE: ${err}`)
      } else {
        console.log(`SENT PRODUCER MESSAGE: ${data}`)
      }
    })
  }
}

module.exports = {
  namedProducerSend: sendReadyMessage
};