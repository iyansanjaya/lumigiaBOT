import { BarChart3, MessageSquare, UserPlus, UserMinus, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getDailyAnalytics, getTopChannels } from '@/lib/database';

interface PageProps {
  params: Promise<{ guildId: string }>;
}

export default async function AnalyticsPage({ params }: PageProps) {
  const { guildId } = await params;

  let dailyStats: Awaited<ReturnType<typeof getDailyAnalytics>> = [];
  let topChannels: Awaited<ReturnType<typeof getTopChannels>> = [];

  try {
    [dailyStats, topChannels] = [
      getDailyAnalytics(guildId, 7),
      getTopChannels(guildId, 7, 10),
    ];
  } catch {
    // Gunakan nilai cadangan
  }

  // Aggregate last 7 days
  const totals = dailyStats.reduce(
    (acc, day) => ({
      messages: acc.messages + day.messages,
      joined: acc.joined + day.members_joined,
      left: acc.left + day.members_left,
      activeUsers: acc.activeUsers + day.active_users,
    }),
    { messages: 0, joined: 0, left: 0, activeUsers: 0 },
  );

  const statCards = [
    { label: 'Messages (7d)', value: totals.messages, icon: MessageSquare, color: 'bg-primary/20 text-primary' },
    { label: 'Members Joined (7d)', value: totals.joined, icon: UserPlus, color: 'bg-green-500/20 text-green-400' },
    { label: 'Members Left (7d)', value: totals.left, icon: UserMinus, color: 'bg-red-500/20 text-red-400' },
    { label: 'Active Users (7d)', value: totals.activeUsers, icon: BarChart3, color: 'bg-primary/20 text-primary' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-foreground-muted">
          Server activity overview for the last 7 days.
        </p>
      </div>

      {/* Summary Stats */}
      {dailyStats.length === 0 && topChannels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 className="h-12 w-12 text-foreground-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Data</h2>
          <p className="mt-2 text-foreground-muted">
            No analytics data has been collected yet.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="flex items-center gap-4">
                    <div className={`rounded-lg p-3 ${stat.color.split(' ')[0]}`}>
                      <Icon className={`h-6 w-6 ${stat.color.split(' ')[1]}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value.toLocaleString()}
                      </p>
                      <p className="text-sm text-foreground-muted">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Daily Breakdown */}
          {dailyStats.length > 0 && (
            <Card>
              <CardContent className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Daily Breakdown</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Messages</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Left</TableHead>
                        <TableHead>Active Users</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyStats.map((day) => (
                        <TableRow key={day.date}>
                          <TableCell className="whitespace-nowrap text-foreground-muted">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>{day.messages.toLocaleString()}</TableCell>
                          <TableCell className="text-green-400">+{day.members_joined}</TableCell>
                          <TableCell className="text-red-400">-{day.members_left}</TableCell>
                          <TableCell>{day.active_users}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Channels */}
          {topChannels.length > 0 && (
            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Top Channels</h2>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Channel ID</TableHead>
                        <TableHead>Messages</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topChannels.map((channel, index) => (
                        <TableRow key={channel.channel_id}>
                          <TableCell>
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-xs font-bold text-primary">
                              {index + 1}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{channel.channel_id}</TableCell>
                          <TableCell>{channel.total_messages.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
