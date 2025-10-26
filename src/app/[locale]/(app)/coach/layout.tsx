import { CoachLayout } from '@/components/coach/layout/CoachLayout';

export default function CoachLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CoachLayout>{children}</CoachLayout>;
}
