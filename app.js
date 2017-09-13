const kafka = require('kafka-node');
const HighLevelProducer = kafka.HighLevelProducer;
const HighLevelConsumer = kafka.HighLevelConsumer;
const KeyedMessage = kafka.KeyedMessage;
const Client = kafka.Client;

const client = new Client('zookeeper:2181', 'kafka-exmpl', {
  sessionTimeout: 500,
  spinDelay: 100,
  retries: 2
});

client.on('error', (err) => console.log(err));

const topics = {
  ready: 'kafka-exampl_ready'
};

const producer = new HighLevelProducer(client);

producer.on('ready', () => {
  const message = 'Hello World';
  const payload = [{
    topic: topics.ready,
    messages: message,
    attributes: 1
  }];

  producer.send(payload, (err, res) => {
    if (err) {
      console.log(`ERRRR: ${err}`);
    } else {
      console.log(`Ready Success: ${res}`);
    }
  })
});

producer.on('error', (err) => {
  console.log(`ON ERROR: ${err}`);
});

const consumerTopics = [{ topic: topics.ready }];
const consumerOptions = {
  autoCommit: true
};
const consumer = new HighLevelConsumer(client, consumerTopics, consumerOptions);

consumer.on('message', (msg) => {
  console.log(msg);
});

consumer.on('error', (err) => {
  console.log(err)
});
