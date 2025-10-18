// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CoachWithRelations = any;

export interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalReservations: number;
  totalHours: number;
  pendingReservations: number;
  upcomingReservations: number;
  activeAnnouncements: number;
  monthlyRevenueData: Array<{ month: string; revenue: number }>;
}

export interface CoachDashboardData {
  coach: CoachWithRelations;
  stats: DashboardStats;
}
