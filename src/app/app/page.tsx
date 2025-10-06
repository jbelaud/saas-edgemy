import { redirect } from 'next/navigation';

export default function AppPage() {
  // Pour l'instant, redirection vers dashboard
  redirect('/app/dashboard');
}
