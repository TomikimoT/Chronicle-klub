"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // We will handle 'Parchment', 'Void', and 'Personal Soul' via next-themes.
  // Next-themes automatically injects `data-theme="..."` or class="..."
  // into the HTML tag. We will use CSS variables in globals.css to handle colors.
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
