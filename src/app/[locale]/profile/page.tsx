'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dices, UploadCloud, Check } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Local state for instant image preview before saving
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        
      if (data) setProfile(data)
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      // Create instant local preview
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const display_name = formData.get('display_name') as string
    const bio = formData.get('bio') as string
    const receive_emails = formData.get('receive_emails') === 'on'
    const custom_color = formData.get('custom_theme_color') as string

    let avatar_url = profile?.avatar_url

    // Upload new avatar if selected
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop()
      const filePath = `${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, { upsert: true })

      if (!uploadError) {
         const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
         avatar_url = publicUrlData.publicUrl
      } else {
         console.error("Avatar Upload Error: ", uploadError)
      }
    }

    await supabase
      .from('profiles')
      .update({
        display_name,
        bio,
        receive_emails,
        custom_theme_color: custom_color,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    setProfile({ ...profile, avatar_url, display_name, bio, receive_emails, custom_theme_color: custom_color })
    setSaving(false)
    setSaved(true)
    
    // Hide checkmark after 3 seconds
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  if (loading) return null

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            
            {/* Clickable Avatar UI */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-32 w-32 border-4 border-primary transition-opacity group-hover:opacity-80">
                <AvatarImage src={previewUrl || profile?.avatar_url || ''} className="object-cover" />
                <AvatarFallback className="bg-muted text-muted-foreground flex flex-col justify-center items-center">
                  <Dices className="h-12 w-12 mb-1 opacity-50" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <UploadCloud className="h-8 w-8" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>

            <div>
              <CardTitle className="text-3xl">Profile Settings</CardTitle>
              <CardDescription>Manage your TTRPG identity and preferences.</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="space-y-3">
              <Label htmlFor="display_name" className="font-bold text-lg">Display Name</Label>
              <Input id="display_name" name="display_name" defaultValue={profile?.display_name || ''} placeholder="Your public adventurer name" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="bio" className="font-bold text-lg">Bio / TTRPG History</Label>
              <Textarea 
                id="bio" 
                name="bio" 
                className="min-h-[120px]" 
                defaultValue={profile?.bio || ''} 
                placeholder="Tell us about your campaigns and characters..."
              />
            </div>

            <div className="bg-muted/30 p-5 rounded-lg border space-y-4">
              <Label htmlFor="custom_theme_color" className="text-lg font-bold">Personal Soul Theme</Label>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you activate the <strong>"Personal Soul"</strong> theme in the top navigation menu, the entire application will adapt to your chosen color.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Input id="custom_theme_color" name="custom_theme_color" type="color" className="w-16 h-12 p-1 cursor-pointer" defaultValue={profile?.custom_theme_color || '#d4af37'} />
                <span className="text-sm font-medium">Pick your primary color</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-5 border-border">
              <div className="space-y-1">
                <Label htmlFor="receive_emails" className="text-lg font-bold">Email Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive an email when you are invited to a new session.
                </div>
              </div>
              <Switch id="receive_emails" name="receive_emails" defaultChecked={profile?.receive_emails !== false} />
            </div>
          </CardContent>

          <CardFooter className="pt-8 pb-8">
            <Button type="submit" size="lg" className="w-full relative transition-all font-bold text-lg disabled:opacity-100 disabled:bg-primary/80" disabled={saving}>
              {saving ? '⏳ Saving...' : 'Save Changes'}
              {saved && (
                <div className="absolute right-4 animate-in fade-in zoom-in text-green-400">
                  <Check className="h-6 w-6 font-bold" />
                </div>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
