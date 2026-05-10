const { PrismaClient } = require('../generated/prisma')

const prisma = new PrismaClient()

async function main() {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { created_at: 'desc' },
    take: 10
  })
  
  console.log('Recent Quizzes:')
  quizzes.forEach(q => {
    console.log(`- Title: ${q.title}, ID: ${q.id}, Created: ${q.created_at}`)
    const questions = q.questions
    if (Array.isArray(questions)) {
      console.log(`  First Question has explanation: ${!!questions[0]?.explanation}`)
    } else {
      console.log(`  Questions field is not an array (type: ${typeof questions})`)
    }
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
