'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTheme } from 'next-themes'

// Helper to convert HEX to HSL format used by Tailwind variables (H S% L%)
function hexToHSL(hex: string): string {
  // Remove #
  hex = hex.replace(/^#/, '')
  
  // Parse HEX
  let r = parseInt(hex.substring(0, 2), 16) / 255
  let g = parseInt(hex.substring(2, 4), 16) / 255
  let b = parseInt(hex.substring(4, 6), 16) / 255
  
  let max = Math.max(r, g, b)
  let min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  
  if (max !== min) {
    let d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch(max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function PersonalSoulProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [customColor, setCustomColor] = useState<string | null>(null)
  
  useEffect(() => {
    // Only fetch if they actually have the custom theme active
    if (theme === 'theme-personal-soul') {
      const fetchColor = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from('profiles').select('custom_theme_color').eq('id', user.id).single()
          if (data?.custom_theme_color) {
            setCustomColor(data.custom_theme_color)
          }
        }
      }
      fetchColor()
    }
  }, [theme])

  // Inject CSS variables directly into a wrapper if the custom theme is active
  if (theme === 'theme-personal-soul' && customColor) {
    const hslColor = hexToHSL(customColor)
    return (
      <div style={{ '--primary': hslColor } as React.CSSProperties} className="contents theme-personal-soul">
        {children}
      </div>
    )
  }

  return <>{children}</>
}
