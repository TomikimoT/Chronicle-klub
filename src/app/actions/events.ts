'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

// Email integration removed in favor of Discord Webhook

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to create an event.')
  }

  // Parse guests array (comma separated)
  const guestsRaw = formData.get('guests') as string
  const guests = guestsRaw ? guestsRaw.split(',').map(g => g.trim()) : []

  const newEvent = {
    title: formData.get('title') as string,
    game_system: formData.get('game_system') as string,
    start_time: formData.get('start_time') as string,
    end_time: formData.get('end_time') as string,
    location: formData.get('location') as string,
    notes: formData.get('notes') as string,
    url: formData.get('url') as string,
    creator_id: user.id,
    guests: guests
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert([newEvent])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Fetch creator profile for Discord display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Trigger Discord Notification in the background
  notifyDiscord(newEvent, profile).catch(console.error)

  revalidatePath('/calendar')
}

export async function notifyDiscord(eventData: any, profile: any) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.log('No DISCORD_WEBHOOK_URL provided. Skipping notification.')
    return
  }

  // Determine an embed color based on system
  let color = 16766720 // Default Yellow
  if (eventData.game_system === 'D&D') color = 15158332 // Red
  if (eventData.game_system === 'Dračí hlídka') color = 3447003 // Blue
  if (eventData.game_system === 'Shadowrun') color = 3066993 // Teal/Cyberpunk
  if (eventData.game_system === 'Příběhy Impéria (PI)') color = 10181046 // Purple
  if (eventData.game_system === 'Kult') color = 2303786 // Dark Grey/Blackish
  if (eventData.game_system === 'Pathfinder') color = 2895667 // Green
  if (eventData.game_system === 'Beyond the fold (BTF)') color = 11393254 // Orange/Brown
  
  const formattedStart = new Date(eventData.start_time).toLocaleString('cs-CZ', { dateStyle: 'long', timeStyle: 'short' })
  const formattedEnd = new Date(eventData.end_time).toLocaleTimeString('cs-CZ', { timeStyle: 'short' })

  const embed = {
    title: `🎭 Nová Session: ${eventData.title}`,
    description: `Hráč **${profile?.display_name || 'Neznámý'}** vypsal novou hru na portálu **Chronicle**!`,
    color: color,
    fields: [
      {
        name: "🎲 Systém",
        value: eventData.game_system,
        inline: true
      },
      {
        name: "📅 Kdy",
        value: `${formattedStart} - ${formattedEnd}`,
        inline: true
      },
      {
        name: "📍 Kde / Odkaz",
        value: eventData.location || "Neurčeno",
        inline: false
      }
    ],
    footer: {
      text: "TTRPG Klub Chronicle",
    },
    timestamp: new Date().toISOString()
  }

  if (eventData.guests && eventData.guests.length > 0) {
    embed.fields.push({
      name: "👥 Očekávaní Hosté",
      value: eventData.guests.join(', '),
      inline: false
    })
  }

  if (eventData.notes) {
    embed.fields.push({
      name: "📝 Poznámky",
      value: eventData.notes,
      inline: false
    })
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: "Chronicle Herald",
        avatar_url: "https://rphcweibhhqomgntxojx.supabase.co/storage/v1/object/public/avatars/bot-icon.png", // Generic bot icon placeholder
        embeds: [embed],
        allowed_mentions: { parse: [] } // This completely disables all @ pings globally for this message
      })
    })
    
    if (!response.ok) {
        throw new Error(`Discord API responded with ${response.status}`)
    }
    
    console.log('Discord notification sent.')
  } catch (error) {
    console.error('Failed to send Discord webhook:', error)
  }
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to delete an event.')
  }

  // Ensure user owns the event and get event details for Discord notification
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (!event || event.creator_id !== user.id) {
    throw new Error('You do not have permission to delete this event.')
  }

  // Fetch creator profile for Discord display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) {
    throw new Error(error.message)
  }

  // Trigger Discord Notification for cancellation in the background
  notifyDiscordDelete(event, profile).catch(console.error)

  revalidatePath('/calendar')
}

export async function notifyDiscordDelete(eventData: any, profile: any) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  
  if (!webhookUrl) {
    return
  }

  const formattedStart = new Date(eventData.start_time).toLocaleString('cs-CZ', { dateStyle: 'long', timeStyle: 'short' })

  const embed = {
    title: `❌ Zrušená Session: ${eventData.title}`,
    description: `Hráč **${profile?.display_name || 'Neznámý'}** zrušil dříve vypsanou hru.`,
    color: 16711680, // Pure Red
    fields: [
      {
        name: "🎲 Systém",
        value: eventData.game_system,
        inline: true
      },
      {
        name: "📅 Kdy se mělo hrát",
        value: formattedStart,
        inline: true
      }
    ],
    footer: {
      text: "TTRPG Klub Chronicle",
    },
    timestamp: new Date().toISOString()
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: "Chronicle Herald",
        avatar_url: "https://rphcweibhhqomgntxojx.supabase.co/storage/v1/object/public/avatars/bot-icon.png", 
        embeds: [embed],
        allowed_mentions: { parse: [] }
      })
    })
    
    if (!response.ok) {
        throw new Error(`Discord API responded with ${response.status}`)
    }
  } catch (error) {
    console.error('Failed to send Discord webhook for deletion:', error)
  }
}
