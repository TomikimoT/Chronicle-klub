'use client'

import { useState } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek
} from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

type Event = {
  id: string
  title: string
  game_system: string
  start_time: string
  end_time: string
  creator_id: string
}

const getSystemColor = (system: string) => {
  switch (system.toLowerCase()) {
    case 'd&d':
      return 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400'
    case 'dračí hlídka':
      return 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
    case 'shadowrun':
      return 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400'
    default:
      return 'border-gray-500 bg-gray-500/10 text-gray-700 dark:text-gray-400'
  }
}

import { EventDialog } from '@/components/event-dialog'
import { DeleteEventDialog } from '@/components/delete-event-dialog'

export function CalendarGrid({ events = [], currentUserId }: { events: Event[], currentUserId: string | null }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  })

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Calendar Header */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DeleteEventDialog events={events} currentUserId={currentUserId} />
          <EventDialog />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 border rounded-lg overflow-hidden flex flex-col bg-card">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="py-2 text-center text-sm font-semibold">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5/6">
          {days.map((day, idx) => {
            const dayEvents = events.filter(
              e => format(new Date(e.start_time), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            )

            return (
              <div
                key={day.toString()}
                className={`min-h-[100px] border-r border-b p-2 flex flex-col gap-1 transition-colors hover:bg-muted/30
                  ${!isSameMonth(day, monthStart) ? 'bg-muted/10 text-muted-foreground' : ''}
                  ${idx % 7 === 6 ? 'border-r-0' : ''}
                `}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full
                    ${isToday(day) ? 'bg-primary text-primary-foreground' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id}
                      className={`text-xs p-1 px-2 rounded-md border text-left truncate cursor-pointer hover:opacity-80 transition-opacity
                        ${getSystemColor(event.game_system)}
                      `}
                      title={event.title}
                    >
                      <span className="font-semibold">{format(new Date(event.start_time), 'HH:mm')}</span> {event.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
