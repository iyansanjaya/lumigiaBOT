export interface Warning {
  id: number;
  guild_id: string;
  user_id: string;
  moderator_id: string;
  reason: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  guild_id: string;
  action: string;
  moderator_id: string;
  target_id: string | null;
  reason: string | null;
  details: string | null;
  created_at: string;
}

export interface AutoModFilter {
  guild_id: string;
  filter_name: string;
  enabled: number;
  action: string;
  config: string;
}

export interface AutoModWhitelistEntry {
  id: number;
  guild_id: string;
  type: string;
  target_id: string;
}
