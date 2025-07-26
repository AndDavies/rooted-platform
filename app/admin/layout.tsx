'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const nav = [
    { href: '/admin/overview', label: 'Dashboard' },
    { href: '/admin/events', label: 'Events' },
    { href: '/admin/communities', label: 'Communities' },
  ]
  return (
    <div className="grid min-h-screen grid-cols-[200px_1fr]">
      <aside className="border-r border-sidebar-border bg-sidebar p-6">
        <h2 className="mb-6 text-xl font-bold">Admin</h2>
        <nav className="space-y-2">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                pathname === n.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  )
} 