const kafka = require('kafka-node');
const Promise = require('bluebird');

const client = new kafka.Client('zookeeper:2181');
client.on('error', (err) => console.log(err));

const producer = new kafka.Producer(client);
producer.on('error', err => console.log('PRODUCER ERROR:', err));
producer.on('ready', () => console.log('producer ready event fired'));  // not seeing this event fire, so using producer.ready below

Promise.promisifyAll(client);
Promise.promisifyAll(producer);


client.on('ready', async () => {
  console.log('client ready');

  // need to call this with test topic to make sure broker is ready -- weird kafka-node client hack
  await client.refreshMetadataAsync(['test'])
    .catch(err => console.log(`ERROR REFRESHING METADATA: ${err}`));

  if (producer.ready) {
    console.log('producer ready');
    await initTopics();
    initConsumers();
    await sendMessages();
  }
});


const listTopics = async () => {
  const results = await client.loadMetadataForTopicsAsync([]);
  return Object.keys(results[1].metadata);
};


const initTopics = async () => {
  const topics = await listTopics()
    .catch(err => console.log('ERROR LISTING TOPICS', err));

  console.log('current topics: ', topics);

  if (!['pizza_topic', 'icecream_topic'].every(topic => topics.includes(topic))) {
    console.log('creating new topics');
    const data = await producer.createTopicsAsync(['pizza_topic', 'icecream_topic'], true)
      .catch(err => console.log('ERROR CREATING TOPICS:', err));
    console.log('topics created: ', data);
  } else console.log('desired topics already present');

};


const initConsumers = () => {

  const consumerClientOne = new kafka.Client('zookeeper:2181');
  const consumerOne = new kafka.Consumer(consumerClientOne, [{ topic: 'pizza_topic' }]);

  consumerOne.on('message', (msg) => {
    console.log('consumer 1 received message from topic', msg.topic + ':', '\n  ', msg.value);
  });

  consumerOne.on('error', (err) => {
    console.log('ERR IN CONSUMER 1:', err);
  });

  // its recommended to have one client per consumer
  const consumerClientTwo = new kafka.Client('zookeeper:2181');
  const consumerTwo = new kafka.Consumer(
    consumerClientTwo,
    [{ topic: 'pizza_topic' }, { topic: 'icecream_topic' }]  // fetch requests (payloads) -- this consumer subscribes to both topics
  );

  consumerTwo.on('message', (msg) => {
    console.log('consumer 2 received message from topic', msg.topic + ':', '\n  ', msg.value);
  });

  consumerTwo.on('error', (err) => {
    console.log('ERR IN CONSUMER 2:', err);
  });

  console.log('consumers created');
};


const sendMessages = async () => {
  console.log('producer sending messages');
  const payloads = [
    {
      topic: 'pizza_topic',
      messages: 'message about pizza',
      attributes: 1  // compression using gzip, 2 uses snappy
    },
    {
      topic: 'icecream_topic',
      messages: ['message about icecream', 'another icecream message'],  // batch multiple messages for same topic together in an array
      attributes: 0  // no compression
    }
  ];

  const info = await producer.sendAsync(payloads)
    .catch(err => console.log(`ERR SENDING PRODUCER MESSAGE: ${err}`));

  console.log('producer sent messages, returned info:', info);
}
