'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfileAction } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { User } from 'next-auth'
import { Camera, User as UserIcon, Mail, Loader2, Check } from 'lucide-react'

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(user.image || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await updateProfileAction(formData)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Update your profile details and photo
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-muted/30 rounded-xl border border-border/50">
            <div className="relative group">
              <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                <AvatarImage src={imagePreview || undefined} />
                <AvatarFallback className="text-3xl font-semibold bg-primary/10 text-primary">
                  {user.name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-foreground/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                disabled={loading}
              >
                <Camera className="h-8 w-8 text-background" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-center sm:text-left">
              <div>
                <h3 className="font-medium text-foreground">Profile Picture</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the image to upload a new photo
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Upload Photo
                </Button>
                {imagePreview && imagePreview !== user.image && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImagePreview(user.image || null)}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max 2MB recommended.
              </p>
              <Input
                ref={fileInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                className="hidden"
              />
            </div>
          </div>
          
          {/* Form Fields */}
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                Display Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name || ''}
                placeholder="Enter your name"
                required
                disabled={loading}
                className="h-11 bg-background border-border/50 focus:border-primary transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                This is how others will see you on the platform
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  value={user.email || ''}
                  disabled
                  className="h-11 bg-muted/50 border-border/50 pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="h-4 w-4 text-success" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your email is verified and cannot be changed
              </p>
            </div>
          </div>
        </CardContent>
        
        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/20 border-t border-border/50 rounded-b-xl">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="min-w-[120px] gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
