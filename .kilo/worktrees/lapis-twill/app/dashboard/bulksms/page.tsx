

  import React from 'react'
  import Link from 'next/link'
  import { Info } from 'lucide-react'

  export default function Bulk() {
    return (
      <main className="p-6 flex items-center justify-center min-h-[80vh]">
        <div className="bg-card p-6 rounded-lg text-center max-w-md w-full">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Info className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Not available</h1>
          <p className="text-sm text-muted-foreground mb-4">This feature is not available at the moment.</p>
          <div>
            <Link href="/dashboard" className="inline-block px-4 py-2 rounded bg-primary text-white">Back to dashboard</Link>
          </div>
        </div>
      </main>
    )
  }