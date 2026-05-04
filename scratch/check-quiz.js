const { prisma } = require('./lib/prisma');

async function check() {
  try {
    console.log('Prisma keys:', Object.keys(prisma));
    if (prisma.quiz) {
      console.log('prisma.quiz exists');
    } else {
      console.log('prisma.quiz is UNDEFINED');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

check();
