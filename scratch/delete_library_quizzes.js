require('dotenv').config();
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Hannah@143@localhost:5432/learning';

async function main() {
  console.log('Connecting to database...');
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected successfully.');

  try {
    // Check counts before deletion
    const roadmapCountRes = await client.query('SELECT COUNT(*)::int as count FROM roadmaps');
    const quizAttemptCountRes = await client.query('SELECT COUNT(*)::int as count FROM quiz_attempts');
    const quizCountRes = await client.query('SELECT COUNT(*)::int as count FROM quizzes');

    console.log('Before deletion:');
    console.log(`- Roadmaps (library): ${roadmapCountRes.rows[0].count}`);
    console.log(`- Quiz attempts: ${quizAttemptCountRes.rows[0].count}`);
    console.log(`- Quizzes: ${quizCountRes.rows[0].count}`);

    // Delete quiz attempts
    console.log('\nDeleting quiz attempts...');
    const delQuizAttempts = await client.query('DELETE FROM quiz_attempts');
    console.log(`Deleted ${delQuizAttempts.rowCount} quiz attempts.`);

    // Delete quizzes
    console.log('Deleting quizzes...');
    const delQuizzes = await client.query('DELETE FROM quizzes');
    console.log(`Deleted ${delQuizzes.rowCount} quizzes.`);

    // Delete roadmaps
    console.log('Deleting roadmaps (library)...');
    const delRoadmaps = await client.query('DELETE FROM roadmaps');
    console.log(`Deleted ${delRoadmaps.rowCount} roadmaps.`);

    // Check counts after deletion
    const roadmapCountResAfter = await client.query('SELECT COUNT(*)::int as count FROM roadmaps');
    const quizAttemptCountResAfter = await client.query('SELECT COUNT(*)::int as count FROM quiz_attempts');
    const quizCountResAfter = await client.query('SELECT COUNT(*)::int as count FROM quizzes');

    console.log('\nAfter deletion:');
    console.log(`- Roadmaps (library): ${roadmapCountResAfter.rows[0].count}`);
    console.log(`- Quiz attempts: ${quizAttemptCountResAfter.rows[0].count}`);
    console.log(`- Quizzes: ${quizCountResAfter.rows[0].count}`);

    console.log('Done!');
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
