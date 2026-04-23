import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const resources = await prisma.learningResource.findMany({
    where: { type: 'pdf' },
    select: { title: true, url: true }
  })
  console.log(JSON.stringify(resources, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
