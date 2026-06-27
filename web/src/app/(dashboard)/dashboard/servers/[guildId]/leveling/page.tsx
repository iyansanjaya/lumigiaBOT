import { Trophy, Star, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getLevelingSettings, getLeaderboard, getLevelRewards } from '@/lib/database';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function LevelingPage({ params }: PageProps) {
  const { guildId } = await params;

  let settings: Awaited<ReturnType<typeof getLevelingSettings>> = undefined;
  let leaderboard: Awaited<ReturnType<typeof getLeaderboard>> = [];
  let rewards: Awaited<ReturnType<typeof getLevelRewards>> = [];

  try {
    settings = getLevelingSettings(guildId);
    leaderboard = getLeaderboard(guildId, 10);
    rewards = getLevelRewards(guildId);
  } catch {
    // Gunakan nilai cadangan
  }

  if (!settings) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leveling</h1>
          <p className="mt-1 text-foreground-muted">
            XP and leveling system for this server.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trophy className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Not Configured</h2>
          <p className="mt-2 text-foreground-muted">
            The leveling system has not been configured for this server.
          </p>
        </div>
      </div>
    );
  }

  const isEnabled = settings.enabled === 1;

  const settingItems = [
    { label: 'Status', value: isEnabled ? 'Enabled' : 'Disabled' },
    { label: 'XP per Message', value: `${settings.xp_per_message} XP` },
    { label: 'Cooldown', value: `${settings.xp_cooldown}s` },
    { label: 'Multiplier', value: `${settings.multiplier}x` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Leveling</h1>
        <p className="mt-1 text-foreground-muted">
          XP and leveling system for this server.
        </p>
      </div>

      {/* Settings */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/20 p-3">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Settings</h2>
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
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {settingItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg bg-background-tertiary/50 px-4 py-3"
              >
                <p className="text-xs text-foreground-muted uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Top 10 Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <p className="text-foreground-muted text-sm">No leveling data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Messages</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((user, index) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{user.user_id}</TableCell>
                      <TableCell className="font-semibold">{user.level}</TableCell>
                      <TableCell>{user.xp.toLocaleString()}</TableCell>
                      <TableCell>{user.messages.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Rewards */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Role Rewards</h2>
          </div>
          {rewards.length === 0 ? (
            <p className="text-foreground-muted text-sm">No role rewards configured.</p>
          ) : (
            <div className="space-y-2">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between rounded-lg bg-background-tertiary/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-xs font-bold text-primary">
                      Lv.{reward.level}
                    </span>
                    <span className="text-sm text-foreground">Level {reward.level}</span>
                  </div>
                  <span className="font-mono text-xs text-foreground-muted">
                    Role: {reward.role_id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
