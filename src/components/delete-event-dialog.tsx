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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2 } from 'lucide-react'
import { deleteEvent } from '@/app/actions/events'

type Event = {
  id: string
  title: string
  game_system: string
  start_time: string
  creator_id: string
}

export function DeleteEventDialog({ events, currentUserId }: { events: Event[], currentUserId: string | null }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  
  // Only allow deleting events created by this user
  const userEvents = events.filter(e => e.creator_id === currentUserId)
  const selectedEvent = userEvents.find(e => e.id === selectedId)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const eventId = formData.get('event_id') as string

    if (!eventId) {
      setLoading(false)
      return
    }

    try {
      await deleteEvent(eventId)
      setOpen(false)
    } catch (err) {
      alert('Failed to delete event. Make sure you have permission.')
    } finally {
      setLoading(false)
    }
  }

  if (!currentUserId || userEvents.length === 0) {
    return null // Only show the button if they have events to delete
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "destructive" })}>
        <Trash2 className="mr-2 h-4 w-4" /> Remove Event
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove an Event</DialogTitle>
          <DialogDescription>
            Select an event you created to permanently delete it. No notifications will be sent for cancellations yet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select name="event_id" value={selectedId} onValueChange={(val) => setSelectedId(val || '')} required>
              <SelectTrigger>
                <SelectValue placeholder="Select event to delete">
                  {selectedEvent ? `${new Date(selectedEvent.start_time).toLocaleDateString()} - ${selectedEvent.title}` : "Select event to delete"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {userEvents.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {new Date(event.start_time).toLocaleDateString()} - {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
