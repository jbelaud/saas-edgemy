/**
 * Script pour exécuter tous les tests de vérification
 *
 * Usage: npx tsx scripts/run-all-tests.ts
 */

import { spawn } from 'child_process';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const tests = [
  {
    name: '1. Vérification schéma DB',
    command: 'npx',
    args: ['tsx', 'scripts/verify-db-schema.ts'],
  },
  {
    name: '2. Vérification variables env',
    command: 'npx',
    args: ['tsx', 'scripts/verify-env-config.ts'],
  },
  {
    name: '3. Tests calculs pricing',
    command: 'npx',
    args: ['tsx', 'scripts/test-pricing-calculation.ts'],
  },
];

async function runTest(test: typeof tests[0]): Promise<TestResult> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const proc = spawn(test.command, test.args, {
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      const duration = Date.now() - startTime;

      resolve({
        name: test.name,
        passed: code === 0,
        duration,
        error: code !== 0 ? `Exit code ${code}` : undefined,
      });
    });

    proc.on('error', (err) => {
      const duration = Date.now() - startTime;

      resolve({
        name: test.name,
        passed: false,
        duration,
        error: err.message,
      });
    });
  });
}

async function runAllTests() {
  console.log('🧪 EXÉCUTION DE TOUS LES TESTS\n');
  console.log('═'.repeat(80));

  const results: TestResult[] = [];

  for (const test of tests) {
    console.log(`\n🔄 ${test.name}...`);
    console.log('─'.repeat(80));

    const result = await runTest(test);
    results.push(result);

    if (result.passed) {
      console.log(`\n✅ ${test.name} - RÉUSSI (${result.duration}ms)`);
    } else {
      console.log(`\n❌ ${test.name} - ÉCHOUÉ (${result.duration}ms)`);
      if (result.error) {
        console.log(`   Erreur: ${result.error}`);
      }
    }
  }

  // Résumé final
  console.log('\n' + '═'.repeat(80));
  console.log('📊 RÉSUMÉ GLOBAL');
  console.log('═'.repeat(80));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\nTests réussis: ${passed}/${total}`);
  console.log(`Tests échoués: ${failed}/${total}`);

  if (failed === 0) {
    console.log('\n✅ TOUS LES TESTS SONT RÉUSSIS !');
    console.log('   Vous pouvez passer aux tests d\'intégration.');
    process.exit(0);
  } else {
    console.log('\n❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('   Corrigez les erreurs avant de continuer.');
    process.exit(1);
  }
}

runAllTests();
