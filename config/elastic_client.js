const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://attendance_elasticsearch_server:9200'
});

module.exports = esClient;