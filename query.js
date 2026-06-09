const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const resources = await prisma.learningResource.findMany();
  console.log(JSON.stringify(resources.filter(r => r.type === 'video'), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
