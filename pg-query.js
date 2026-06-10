const { Client } = require('pg');
const client = new Client({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/learning'
});

client.connect()
  .then(() => client.query("SELECT * FROM learning_resources WHERE type = 'video'"))
  .then(res => console.log(JSON.stringify(res.rows, null, 2)))
  .catch(console.error)
  .finally(() => client.end());
