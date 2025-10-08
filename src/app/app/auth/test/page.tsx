'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signUp, signIn, useSession } from '@/lib/auth-client';

export default function AuthTestPage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const testSignUp = async () => {
    setLoading(true);
    try {
      // Utilisons un email unique avec timestamp
      const timestamp = Date.now();
      const result = await signUp.email({
        email: `test${timestamp}@edgemy.fr`,
        password: 'password123',
        name: 'Test User',
      });
      setResult(result);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    try {
      const result = await signIn.email({
        email: 'test@edgemy.fr',
        password: 'password123',
      });
      setResult(result);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
    } finally {
      setLoading(false);
    }
  };

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/test');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Better Auth</CardTitle>
          <CardDescription>
            Page de test pour vérifier la configuration Better Auth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session actuelle */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Session actuelle :</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          {/* Boutons de test */}
          <div className="flex gap-4 flex-wrap">
            <Button onClick={testAPI} disabled={loading}>
              Test API Configuration
            </Button>
            <Button onClick={testSignUp} disabled={loading}>
              Test Inscription
            </Button>
            <Button onClick={testSignIn} disabled={loading}>
              Test Connexion
            </Button>
          </div>

          {/* Résultats */}
          {result && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Résultat :</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
