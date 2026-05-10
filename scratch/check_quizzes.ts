import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { created_at: 'desc' },
    take: 5
  })
  
  console.log('Recent Quizzes:')
  quizzes.forEach(q => {
    console.log(`- Title: ${q.title}, ID: ${q.id}`)
    const questions = q.questions as any[]
    console.log(`  First Question has explanation: ${!!questions[0]?.explanation}`)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
