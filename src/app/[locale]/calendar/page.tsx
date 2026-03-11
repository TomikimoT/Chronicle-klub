import { createClient } from '@/utils/supabase/server'
import { CalendarGrid } from '@/components/calendar-grid'

export default async function CalendarPage() {
  const supabase = await createClient()

  // Fetch events from the database
  // We'll fetch all future and recent events to populate the calendar
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  // In case of error (e.g. Supabase not connected yet), pass empty array
  const safeEvents = error ? [] : events

  return (
    <div className="container mx-auto p-4">
      <CalendarGrid events={safeEvents} currentUserId={userId || null} />
    </div>
  )
}
