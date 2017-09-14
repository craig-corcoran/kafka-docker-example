const { kafkaClient, topics } = require('./utils');

const { namedProducerSend } = require('./producers');
const { listenNamedConsumer } = require('./consumers');

const client = kafkaClient;

client.on('error', (err) => console.log(err));
client.on('ready', () => {
  console.log('CLIENT READY');
  kafkaClient.refreshMetadata([topics.ready], (err) => {
    if (err) {
      console.log(`ERRR REFRESHING METADATA: ${err}`);
    } else { 
      namedProducerSend('CLIENT READY');
      listenNamedConsumer();
    }
  });
});
