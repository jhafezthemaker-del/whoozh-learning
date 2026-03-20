import { auth } from "@/auth"
import { ProfileForm } from "@/components/profile-form"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Shield } from "lucide-react"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const user = session.user
  const memberSince = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with gradient background */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
        
        {/* Profile Avatar - positioned to overlap hero */}
        <div className="container max-w-4xl mx-auto px-4">
          <div className="relative -mt-20 flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-8">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-4 ring-primary/10">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-4xl font-semibold bg-primary/10 text-primary">
                  {user.name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-success rounded-full border-4 border-background flex items-center justify-center">
                <Shield className="h-4 w-4 text-background" />
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-3xl font-bold text-foreground">
                  {user.name || 'User'}
                </h1>
                <Badge variant="secondary" className="w-fit mx-auto sm:mx-0">
                  Active Learner
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container max-w-4xl mx-auto px-4 pb-16">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Type</p>
              <p className="font-semibold text-foreground">Standard</p>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-semibold text-foreground">{memberSince}</p>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Status</p>
              <p className="font-semibold text-success">Verified</p>
            </div>
          </div>
        </div>

        {/* Profile Form Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <h2 className="text-xl font-semibold text-foreground">Account Settings</h2>
          </div>
          <ProfileForm user={user} />
        </div>
      </main>
    </div>
  )
}
