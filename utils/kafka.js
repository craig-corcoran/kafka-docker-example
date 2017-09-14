const kafka = require('kafka-node');
const Client = kafka.Client;
const client = new Client('zookeeper:2181', 'kafka-exmpl', {
  retries: 5,
  spinDelay: 1000
});

module.exports = client;
