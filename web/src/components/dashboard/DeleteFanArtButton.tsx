'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { dashboardRequest, getDashboardErrorMessage } from './dashboardApi';

interface DeleteFanArtButtonProps {
  id: number;
  guildId: string;
}

export function DeleteFanArtButton({ id, guildId }: DeleteFanArtButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus submission fan art ini? Aksi ini tidak bisa dibatalkan.')) {
      return;
    }

    setIsDeleting(true);

    try {
      await dashboardRequest(`/api/guilds/${guildId}/fanart?id=${id}`, {
        method: 'DELETE',
      });

      router.refresh();
    } catch (error) {
      console.error(error);
      alert(getDashboardErrorMessage(error, 'Gagal menghapus fan art. Coba lagi.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-foreground-muted hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors disabled:opacity-50"
      title="Hapus Submission"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
