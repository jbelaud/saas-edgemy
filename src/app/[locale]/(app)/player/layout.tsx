import { PlayerLayout } from '@/components/player/layout/PlayerLayout';

export default function PlayerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlayerLayout>{children}</PlayerLayout>;
}
