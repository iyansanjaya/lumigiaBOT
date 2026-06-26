import { Zap, MessageSquare, Link2, Type, SmilePlus, AtSign, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAutoModFilters } from '@/lib/database';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

const defaultFilters = [
  {
    key: 'spam',
    name: 'Spam Detection',
    description: 'Automatically detect and remove spam messages.',
    icon: MessageSquare,
  },
  {
    key: 'link',
    name: 'Link Filter',
    description: 'Block or restrict links from being posted.',
    icon: Link2,
  },
  {
    key: 'word',
    name: 'Word Filter',
    description: 'Filter messages containing banned words or phrases.',
    icon: Type,
  },
  {
    key: 'caps',
    name: 'Caps Lock Filter',
    description: 'Prevent excessive use of capital letters.',
    icon: ShieldAlert,
  },
  {
    key: 'emoji',
    name: 'Emoji Spam Filter',
    description: 'Limit excessive emoji usage in messages.',
    icon: SmilePlus,
  },
  {
    key: 'mention',
    name: 'Mention Spam Filter',
    description: 'Prevent mass mention abuse.',
    icon: AtSign,
  },
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
          Configure automated moderation filters for this server.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {defaultFilters.map((filter) => {
          const Icon = filter.icon;
          const configured = filterMap.get(filter.key);
          const enabled = configured?.enabled ?? false;
          const action = configured?.action ?? 'none';

          return (
            <Card key={filter.key}>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/20 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{filter.name}</h3>
                  </div>
                </div>

                <p className="text-sm text-foreground-muted">{filter.description}</p>

                <div className="flex items-center gap-2">
                  <Badge variant={enabled ? 'success' : 'default'}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  {enabled && (
                    <Badge variant="default">
                      Action: {action}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
