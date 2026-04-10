'use client'

import { useState } from 'react'
import { changePasswordAction } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { KeyRound, Lock, ShieldCheck, Loader2, Check } from 'lucide-react'

export function PasswordForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      setLoading(false)
      return
    }

    try {
      const result = await changePasswordAction(formData)
      if (result.success) {
        toast.success(result.message)
        form.reset()
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
          <KeyRound className="h-5 w-5 text-primary" />
          Security
        </CardTitle>
        <CardDescription>
          Change your account password
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Current Password
              </Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                required
                disabled={loading}
                className="h-11 bg-background border-border/50 focus:border-primary transition-colors"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="At least 6 characters"
                  required
                  disabled={loading}
                  className="h-11 bg-background border-border/50 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat new password"
                  required
                  disabled={loading}
                  className="h-11 bg-background border-border/50 focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </CardContent>
        
        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/20 border-t border-border/50 rounded-b-xl">
          <Button 
            type="submit" 
            disabled={loading}
            className="min-w-[150px] gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Update Password
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
