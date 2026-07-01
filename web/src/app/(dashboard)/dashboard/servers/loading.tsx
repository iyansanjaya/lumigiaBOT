import { Server } from 'lucide-react';

export default function ServersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Server Anda</h1>
        <p className="mt-1 text-foreground-muted">
          Memuat server Anda...
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-6 flex flex-col items-center gap-4"
          >
            <div className="h-16 w-16 rounded-full bg-background-tertiary animate-pulse" />
            <div className="h-5 w-32 rounded bg-background-tertiary animate-pulse" />
            <div className="h-9 w-full rounded-lg bg-background-tertiary animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
