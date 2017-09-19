// const { kafkaClient, topics } = require('./utils');

// const { namedProducerSend } = require('./producers');
// const { listenNamedConsumer } = require('./consumers');

const kafka = require('kafka-node');

const client = new kafka.Client('zookeeper:2181');
client.on('error', (err) => console.log(err));
client.on('ready', () => {

  // topic needs to be here to make sure broker is ready -- weird node client hack
  client.refreshMetadata(['test'], (err) => {
    if (err) {
      console.log(`ERROR REFRESHING METADATA: ${err}`);
    } else {
      const producer = initTopics();
      initConsumers();
      produce(producer);
    }
  });
});


const initTopics = () => {
  console.log('creating topics');
  const producer = new kafka.Producer(client);
  producer.createTopics(['pizza_topic', 'icecream_topic'], true, (err, data) => {
    if (err) {
      return console.log('ERROR CREATING TOPICS:', err);
    }
    return console.log('topics created: ', data);
  });

  client.loadMetadataForTopics([], function (err, results) {
    if (err) {
      return console.log('ERROR LISTING TOPICS:', err);
    }
    const topics = Object.keys(results[1].metadata);
    console.log('topics: ', topics);
  });

  return producer;
};


const produce = (producer) => {
  // const client = new kafka.Client('zookeeper:2181');
  // const producer = new kafka.Producer(client);

  producer.on('error', (err) => {
    console.log(`PRODUCER ERROR: ${err}`);
  })

  producer.on('ready', () => {
    const payloads = [
      {
        topic: 'pizza_topic',
        messages: 'message about pizza',
        attributes: 1  // compression using gzip
      },
      {
        topic: 'icecream_topic',
        messages: ['message about icecream', 'another icecream message'],  // batch multiple messages for same topic together
        attributes: 0  // no compression
      }
    ];

    producer.send(payloads, (err, data) => {
      if (err) {
        console.log(`ERR SENDING PRODUCER MESSAGE: ${err}`)
      } else {
        console.log(`SENT PRODUCER MESSAGE: ${data}`)
      }
    })
  });


  return;
};

const initConsumers = () => {
  console.log('creating consumer');
  const consumer = new kafka.Consumer(client, [{ topic: 'pizza_topic' }]);
  console.log('consumer created');

  consumer.on('error', (err) => {
    console.log(`ERR IN CONSUMER: ${err}`);
  });

  consumer.on('message', function (msg) {
    console.log('consumer message:', msg);
  });
  return consumer;


  // // const consumerClientOne = new kafka.Client('zookeeper:2181');
  // const consumerClientOne = client;
  // const consumerOne = new kafka.Consumer(consumerClientOne, [{ topic: 'pizza_topic' }]);

  // consumerOne.on('message', function (msg) {
  //   console.log('consumer 1 message:', msg);
  // });

  // consumerOne.on('error', (err) => {
  //   console.log(`ERR IN CONSUMER 1: ${err}`);
  // });


  // // its recommended to have one client per consumer
  // // const consumerClientTwo = new kafka.Client('zookeeper:2181');
  // const consumerClientTwo = client;
  // const consumerTwo = new kafka.Consumer(
  //   consumerClientTwo,  // client 
  //   [{ topic: 'pizza_topic' }, { topic: 'icecream_topic' }],  // fetch requests (payloads)
  //   { autoCommit: false }  // options
  // );

  // consumerTwo.on('message', (msg) => {
  //   console.log('consumer 2 message:', msg);
  // });

  // consumerTwo.on('error', (err) => {
  //   console.log(`ERR IN CONSUMER 2: ${err}`);
  // });
};
