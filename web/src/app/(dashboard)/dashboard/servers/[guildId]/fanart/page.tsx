import { Palette, ImagePlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getFanArtSettings, getFanArtGallery, getFanArtPending } from '@/lib/database';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function FanArtPage({ params }: PageProps) {
  const { guildId } = await params;

  let settings: Awaited<ReturnType<typeof getFanArtSettings>> = undefined;
  let gallery: Awaited<ReturnType<typeof getFanArtGallery>> = [];
  let pending: Awaited<ReturnType<typeof getFanArtPending>> = [];

  try {
    settings = getFanArtSettings(guildId);
    gallery = getFanArtGallery(guildId, 25);
    pending = getFanArtPending(guildId);
  } catch {
    // Gunakan nilai cadangan
  }

  if (!settings) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fan Art</h1>
          <p className="mt-1 text-foreground-muted">
            Fan art submissions and gallery for this server.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Palette className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Not Configured</h2>
          <p className="mt-2 text-foreground-muted">
            Fan art settings have not been configured for this server.
          </p>
        </div>
      </div>
    );
  }

  const isEnabled = settings.enabled === 1;
  const approvalRequired = settings.approval_required === 1;

  const settingItems = [
    { label: 'Status', value: isEnabled ? 'Enabled' : 'Disabled' },
    { label: 'Submit Channel', value: settings.submit_channel ?? 'Not set' },
    { label: 'Gallery Channel', value: settings.gallery_channel ?? 'Not set' },
    { label: 'Approval Required', value: approvalRequired ? 'Yes' : 'No' },
    { label: 'Vote Emoji', value: settings.vote_emoji },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Fan Art</h1>
        <p className="mt-1 text-foreground-muted">
          Fan art submissions and gallery for this server.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/20 p-3">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{gallery.length}</p>
              <p className="text-sm text-foreground-muted">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-yellow-500/20 p-3">
              <ImagePlus className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pending.length}</p>
              <p className="text-sm text-foreground-muted">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/20 p-3">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-3">
              <p className="text-lg font-semibold text-foreground">System</p>
              {isEnabled ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                  Disabled
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Configuration</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {settingItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg bg-background-tertiary/50 px-4 py-3"
              >
                <p className="text-xs text-foreground-muted uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground font-mono">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approved Gallery */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Approved Submissions</h2>
          {gallery.length === 0 ? (
            <p className="text-foreground-muted text-sm">No approved submissions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gallery.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {submission.title ?? 'Untitled'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{submission.user_id}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm">
                          {settings.vote_emoji} {submission.votes}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground-muted whitespace-nowrap">
                        {new Date(submission.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
