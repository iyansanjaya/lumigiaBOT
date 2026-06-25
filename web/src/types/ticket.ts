export interface Ticket {
  id: number;
  guild_id: string;
  channel_id: string | null;
  user_id: string;
  claimed_by: string | null;
  category: string;
  reason: string | null;
  status: 'open' | 'claimed' | 'closed';
  created_at: string;
  closed_at: string | null;
  closed_by: string | null;
}

export interface TicketStats {
  total: number;
  open: number;
  claimed: number;
  closed: number;
}
