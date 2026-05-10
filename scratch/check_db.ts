import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const id = '7bf9daa7-9ede-4159-8005-008d6543fb99'
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id },
  })
  console.log('Attempt:', JSON.stringify(attempt, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
