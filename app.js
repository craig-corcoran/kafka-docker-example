const kafka = require('kafka-node');

const client = new kafka.Client('zookeeper:2181');
const producer = new kafka.Producer(client);

client.on('ready', () => {
  console.log('client ready');
  // topic needs test topic to be here to make sure broker is ready -- weird node client hack
  client.refreshMetadata(['test'], (err) => {
    if (err) {
      console.log(`ERROR REFRESHING METADATA: ${err}`);
    } else {
      producer.on('error', err => console.log('PRODUCER ERROR:', err));
      producer.on('ready', () => console.log('producer ready event fired'));  // not seeing this event fire, so using conditional below
      if (producer.ready) {
        console.log('producer ready');
        start();
      }
    }
  });
});

client.on('error', (err) => console.log(err));


const start = () => {
  printTopics();
  console.log('creating topics');
  producer.createTopics(['pizza_topic', 'icecream_topic'], true, (err, data) => {
    if (err) {
      return console.log('ERROR CREATING TOPICS:', err);
    }
    console.log('topics created: ', data);
    initConsumers();
    sendMessages();
  });
};


const initConsumers = () => {
  console.log('creating consumers');

  const consumerClientOne = new kafka.Client('zookeeper:2181');
  const consumerOne = new kafka.Consumer(consumerClientOne, [{ topic: 'pizza_topic' }]);

  consumerOne.on('message', (msg) => {
    console.log('consumer 1 message:', msg);
  });

  consumerOne.on('error', (err) => {
    console.log('ERR IN CONSUMER 1:', err);
  });

  // its recommended to have one client per consumer
  const consumerClientTwo = new kafka.Client('zookeeper:2181');
  const consumerTwo = new kafka.Consumer(
    consumerClientTwo,  // client 
    [{ topic: 'pizza_topic' }, { topic: 'icecream_topic' }]  // fetch requests (payloads) -- this consumer subscribes to both topics
  );

  consumerTwo.on('message', (msg) => {
    console.log('consumer 2 message', msg);
  });

  consumerTwo.on('error', (err) => {
    console.log('ERR IN CONSUMER 2:', err);
  });

};


const sendMessages = () => {
  console.log('producer sending messages');
  const payloads = [
    {
      topic: 'pizza_topic',
      messages: 'message about pizza',
      attributes: 1  // compression using gzip
    },
    {
      topic: 'icecream_topic',
      messages: ['message about icecream', 'another icecream message'],  // batch multiple messages for same topic together in an array
      attributes: 0  // no compression
    }
  ];

  producer.send(payloads, (err, data) => {
    if (err) {
      console.log(`ERR SENDING PRODUCER MESSAGE: ${err}`)
    } else {
      console.log('sent producer message. Info:', data);
    }
  });
};


const printTopics = () => {
  client.loadMetadataForTopics([], function (err, results) {
    if (err) {
      return console.log('ERROR LISTING TOPICS:', err);
    }
    const topics = Object.keys(results[1].metadata);
    console.log('topics:', topics);
  });
};
