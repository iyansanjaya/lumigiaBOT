import { Card, CardContent } from '@/components/ui/card';

export default function GuildPageLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-56 rounded-lg bg-background-tertiary animate-pulse" />
        <div className="h-4 w-80 rounded bg-background-tertiary/60 animate-pulse mt-2" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5 space-y-3">
              <div className="h-4 w-24 rounded bg-background-tertiary animate-pulse" />
              <div className="h-7 w-16 rounded bg-background-tertiary animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <Card>
        <CardContent className="p-0">
          {/* Table header */}
          <div className="flex items-center gap-4 px-6 py-3 border-b border-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-24 rounded bg-background-tertiary animate-pulse" />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 w-20 rounded bg-background-tertiary/60 animate-pulse" />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
