const { kafkaClient } = require('./utils');

const { namedProducerSend } = require('./producers');
const { listenNamedConsumer } = require('./consumers');

const client = kafkaClient;

client.on('error', (err) => console.log(err));
client.on('ready', () => {
  console.log('CLIENT READY');
  let i = 1;
  namedProducerSend('CLIENT READY');
  listenNamedConsumer();
  setInterval(() => {
    namedProducerSend(`INTERVAL! ${i}`);
    i++;
  }, 1000)
});
