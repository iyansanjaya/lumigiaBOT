import { getAutoModFilters } from '@/lib/database';
import { AutoModCard } from '@/components/dashboard/AutoModCard';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

const defaultFilters = [
  { key: 'spam', name: 'Spam Detection', description: 'Automatically detect and remove spam messages.' },
  { key: 'link', name: 'Link Filter', description: 'Block or restrict links from being posted.' },
  { key: 'word', name: 'Word Filter', description: 'Filter messages containing banned words or phrases.' },
  { key: 'caps', name: 'Caps Lock Filter', description: 'Prevent excessive use of capital letters.' },
  { key: 'emoji', name: 'Emoji Spam Filter', description: 'Limit excessive emoji usage in messages.' },
  { key: 'mention', name: 'Mention Spam Filter', description: 'Prevent mass mention abuse.' },
];

export default async function AutoModPage({ params }: PageProps) {
  const { guildId } = await params;

  let filters: Awaited<ReturnType<typeof getAutoModFilters>> = [];

  try {
    filters = await getAutoModFilters(guildId);
  } catch {
    // Gunakan nilai cadangan
  }

  const filterMap = new Map(filters.map((f) => [f.filter_name, f]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Auto-Moderation</h1>
        <p className="mt-1 text-foreground-muted">
          Configure automated moderation filters for this server. Changes are saved instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {defaultFilters.map((filter) => {
          const configured = filterMap.get(filter.key);
          const enabled = configured?.enabled ?? false;
          const action = configured?.action ?? 'delete';

          return (
            <AutoModCard
              key={filter.key}
              guildId={guildId}
              filterKey={filter.key}
              name={filter.name}
              description={filter.description}
              initialEnabled={!!enabled}
              initialAction={action}
            />
          );
        })}
      </div>
    </div>
  );
}
