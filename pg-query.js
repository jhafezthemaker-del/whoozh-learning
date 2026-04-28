const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Hannah@143@localhost:5432/learning' });

client.connect()
  .then(() => client.query("SELECT * FROM learning_resources WHERE type != 'video'"))
  .then(res => console.log(JSON.stringify(res.rows, null, 2)))
  .catch(console.error)
  .finally(() => client.end());
