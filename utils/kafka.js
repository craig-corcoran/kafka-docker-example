const kafka = require('kafka-node');
const Client = kafka.Client;
const client = new Client('zookeeper:2181', 'kafka-exmpl');

module.exports = client;
