import { useState, useEffect } from 'react';

interface Stats {
  subscriberCount: number;
  success: boolean;
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({ subscriberCount: 1000, success: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Garde la valeur par défaut en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}
