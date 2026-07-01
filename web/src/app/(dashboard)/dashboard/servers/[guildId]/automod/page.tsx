import { getAutoModFilters } from '@/lib/database';
import { AutoModCard } from '@/components/dashboard/AutoModCard';
import { AUTOMOD_DEFAULT_ACTION, AUTOMOD_FILTERS } from '@/lib/contracts';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

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
        {AUTOMOD_FILTERS.map((filter) => {
          const configured = filterMap.get(filter.key);
          const enabled = configured?.enabled ?? false;
          const action = configured?.action ?? AUTOMOD_DEFAULT_ACTION;
          const configString = configured?.config ?? '{}';

          let parsedConfig = {};
          try {
            parsedConfig = JSON.parse(configString);
          } catch {
            // ignore
          }

          return (
            <AutoModCard
              key={filter.key}
              guildId={guildId}
              filterKey={filter.key}
              name={filter.dashboardName}
              description={filter.description}
              initialEnabled={!!enabled}
              initialAction={action}
              initialConfig={parsedConfig}
            />
          );
        })}
      </div>
    </div>
  );
}
