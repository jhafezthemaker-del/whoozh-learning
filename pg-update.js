const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Hannah@143@localhost:5432/learning' });

client.connect()
  .then(() => client.query("UPDATE learning_resources SET url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' WHERE type != 'video'"))
  .then(res => console.log(`Updated ${res.rowCount} rows.`))
  .catch(console.error)
  .finally(() => client.end());
