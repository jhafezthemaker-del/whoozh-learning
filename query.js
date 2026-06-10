const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
async function main() {
  const resources = await prisma.learningResource.findMany({
    where: { type: 'video' }
  });
  console.log(JSON.stringify(resources, null, 2));
}
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
