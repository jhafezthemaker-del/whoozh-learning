import { auth } from "@/auth"
import { ProfileForm } from "@/components/profile-form"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="container max-w-2xl py-10 px-4 mx-auto">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and profile picture.
          </p>
        </div>
        <ProfileForm user={session.user} />
      </div>
    </div>
  )
}
