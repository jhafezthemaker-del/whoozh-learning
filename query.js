const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const resources = await prisma.learningResource.findMany();
  console.log(resources.filter(r => r.type !== 'video'));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
