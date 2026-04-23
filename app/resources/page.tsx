import { prisma } from '@/lib/prisma'
import ResourcesClientPage from './client-page'
import Header from '@/components/header'

export const dynamic = 'force-dynamic'

export default async function ResourcesPage() {
  const resources = await prisma.learningResource.findMany({
    orderBy: {
      created_at: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ResourcesClientPage initialResources={resources} />
      </main>
    </div>
  )
}
