'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createEvent } from '@/app/actions/events'
import { Plus } from 'lucide-react'

export function EventDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createEvent(formData)
      setOpen(false)
    } catch (err) {
      alert('Failed to create event. Make sure you are logged in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "default" })}>
        <Plus className="mr-2 h-4 w-4" /> Add Event
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Schedule a new TTRPG adventure. Email notifications will be sent automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
          
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="e.g. Goblin Ambush" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="game_system">System</Label>
            <Select name="game_system" defaultValue="D&D" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="D&D">D&D 5e</SelectItem>
                <SelectItem value="Dračí hlídka">Dračí hlídka</SelectItem>
                <SelectItem value="Shadowrun">Shadowrun</SelectItem>
                <SelectItem value="Příběhy Impéria (PI)">Příběhy Impéria (PI)</SelectItem>
                <SelectItem value="Kult">Kult</SelectItem>
                <SelectItem value="Pathfinder">Pathfinder</SelectItem>
                <SelectItem value="Beyond the fold (BTF)">Beyond the fold (BTF)</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input id="start_time" name="start_time" type="datetime-local" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input id="end_time" name="end_time" type="datetime-local" required />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location / Link</Label>
            <Input id="location" name="location" placeholder="Address or Discord Link" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="guests">Guests (comma separated)</Label>
            <Input id="guests" name="guests" placeholder="John, Gandalf" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes / Desc</Label>
            <Textarea id="notes" name="notes" placeholder="Session details..." />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="url">Resources URL (Maps, Docs)</Label>
            <Input id="url" name="url" type="url" placeholder="https://..." />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Save Session'}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
