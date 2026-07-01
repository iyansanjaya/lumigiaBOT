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
import { FanArtSettingsForm } from '@/components/dashboard/FanArtSettingsForm';
import { DeleteFanArtButton } from '@/components/dashboard/DeleteFanArtButton';

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Fan Art</h1>
        <p className="mt-1 text-foreground-muted">
          Submission fan art dan galeri untuk server ini.
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
              <p className="text-sm text-foreground-muted">Disetujui</p>
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
              <p className="text-sm text-foreground-muted">Menunggu Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/20 p-3">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-3">
              <p className="text-lg font-semibold text-foreground">Sistem</p>
              {settings?.enabled === 1 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  Aktif
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                  Nonaktif
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Form */}
      <FanArtSettingsForm guildId={guildId} initialSettings={settings ?? null} />

      {/* Approved Gallery */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Submission Disetujui Terbaru</h2>
          {gallery.length === 0 ? (
            <p className="text-foreground-muted text-sm">Belum ada submission yang disetujui.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Vote</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gallery.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {submission.title ?? 'Tanpa judul'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{submission.user_id}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm">
                          {settings?.vote_emoji ?? '⭐'} {submission.votes}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground-muted whitespace-nowrap">
                        {new Date(submission.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteFanArtButton id={submission.id} guildId={guildId} />
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
