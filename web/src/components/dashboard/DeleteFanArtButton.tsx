'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteFanArtButtonProps {
  id: number;
  guildId: string;
}

export function DeleteFanArtButton({ id, guildId }: DeleteFanArtButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this fan art submission? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/guilds/${guildId}/fanart?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete fan art');
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to delete fan art. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-foreground-muted hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors disabled:opacity-50"
      title="Delete Submission"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
