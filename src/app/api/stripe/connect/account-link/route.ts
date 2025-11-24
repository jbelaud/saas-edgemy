import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * POST /api/stripe/connect/account-link
 * Créer ou récupérer un Account Link pour connecter un compte Stripe Connect
 */
export async function POST(req: Request) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Profil coach non trouvé' },
        { status: 404 }
      );
    }

    await req.json().catch(() => ({ refresh: false }));

    // Mode développement : bypasser Stripe Connect si non activé
    const isStripeConnectEnabled = process.env.STRIPE_CONNECT_ENABLED === 'true';

    if (!isStripeConnectEnabled) {
      console.log('ℹ️ Stripe Connect désactivé - Mode développement');

      // Créer ou utiliser un compte mock
      let mockAccountId = coach.stripeAccountId;
      if (!mockAccountId || !mockAccountId.startsWith('acct_mock_')) {
        mockAccountId = `acct_mock_${Date.now()}`;

        await prisma.coach.update({
          where: { id: coach.id },
          data: { stripeAccountId: mockAccountId },
        });

        console.log(`✅ Compte Stripe mock créé: ${mockAccountId}`);
      }

      // Retourner une URL de redirection vers les settings
      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/fr/coach/settings?stripe_mock=true`,
        accountId: mockAccountId,
      });
    }

    let accountId = coach.stripeAccountId;
    let needsNewAccount = false;

    // Vérifier si le compte existe dans Stripe (gérer les comptes mock)
    if (accountId) {
      // Si c'est un compte mock, le considérer comme invalide
      if (accountId.startsWith('acct_mock_')) {
        console.log(`⚠️ Compte mock détecté: ${accountId}, création d'un nouveau compte réel`);
        needsNewAccount = true;
      } else {
        // Vérifier si le compte existe réellement dans Stripe
        try {
          await stripe.accounts.retrieve(accountId);
        } catch {
          console.log(`⚠️ Compte Stripe introuvable: ${accountId}, création d'un nouveau compte`);
          needsNewAccount = true;
        }
      }
    } else {
      needsNewAccount = true;
    }

    // Créer un compte Stripe Connect si nécessaire
    if (needsNewAccount) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'FR',
        email: coach.user.email!,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          coachId: coach.id,
          userId: session.user.id,
        },
      });

      accountId = account.id;

      // Mettre à jour le coach avec l'ID du compte Stripe Connect
      await prisma.coach.update({
        where: { id: coach.id },
        data: { stripeAccountId: accountId },
      });

      console.log(`✅ Compte Stripe Connect créé: ${accountId} pour coach ${coach.id}`);
    }

    // Vérifier que nous avons bien un accountId
    if (!accountId) {
      return NextResponse.json(
        { error: 'Impossible de créer ou récupérer le compte Stripe' },
        { status: 500 }
      );
    }

    // Vérifier que l'URL de base est configurée
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('❌ NEXT_PUBLIC_APP_URL n\'est pas définie');
      return NextResponse.json(
        { error: 'Configuration serveur manquante (NEXT_PUBLIC_APP_URL)' },
        { status: 500 }
      );
    }

    // Récupérer l'état du compte pour déterminer le type de lien approprié
    const account = await stripe.accounts.retrieve(accountId);
    const isOnboardingComplete = account.details_submitted === true;
    const isPayoutsEnabled = account.payouts_enabled === true;
    const isChargesEnabled = account.charges_enabled === true;

    // Déterminer le type de lien - Toujours utiliser 'account_onboarding'
    // car 'account_update' nécessite que payouts_enabled et charges_enabled soient true
    const linkType = 'account_onboarding';

    console.log(`ℹ️ Compte ${accountId}: details_submitted=${isOnboardingComplete}, payouts_enabled=${isPayoutsEnabled}, charges_enabled=${isChargesEnabled}, type de lien: ${linkType}`);

    // Créer l'Account Link pour l'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/fr/coach/settings?stripe_refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/fr/coach/settings?stripe_success=true`,
      type: linkType,
    });

    console.log(`✅ Account Link créé pour coach ${coach.id}`);

    return NextResponse.json({
      url: accountLink.url,
      accountId,
    });
  } catch (err) {
    console.error('❌ Erreur création Account Link:', err);
    return NextResponse.json(
      {
        error: 'Erreur lors de la connexion à Stripe',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
