import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async onSuccess(user: any, account: any, profile: any, request: any) {
        // Vérifier si l'utilisateur veut devenir coach
        const url = new URL(request.url);
        const callbackURL = url.searchParams.get('callbackURL') || '';
        
        if (callbackURL.includes('setupCoach=true')) {
          console.log('🎓 Création automatique du profil coach pour:', user.id);
          
          try {
            // Mettre à jour le rôle à COACH (qui va créer le profil automatiquement)
            await prisma.user.update({
              where: { id: user.id },
              data: { role: 'COACH' },
            });
            
            // Vérifier si le profil coach existe déjà
            const existingCoach = await prisma.coach.findUnique({
              where: { userId: user.id },
            });
            
            if (!existingCoach) {
              // Créer le profil coach
              const userName = user.name || '';
              const nameParts = userName.split(' ');
              const firstName = nameParts[0] || 'Coach';
              const lastName = nameParts.slice(1).join(' ') || 'Edgemy';
              
              // Générer un slug unique
              const baseSlug = `${firstName}-${lastName}`
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              
              let slug = baseSlug;
              let counter = 1;
              let slugExists = await prisma.coach.findUnique({ where: { slug } });
              
              while (slugExists) {
                slug = `${baseSlug}-${counter}`;
                slugExists = await prisma.coach.findUnique({ where: { slug } });
                counter++;
              }
              
              await prisma.coach.create({
                data: {
                  userId: user.id,
                  slug,
                  firstName,
                  lastName,
                  bio: '',
                  formats: [],
                  languages: ['fr'],
                  badges: [],
                  status: 'INACTIVE',
                },
              });
              
              console.log('✅ Profil coach créé avec succès:', slug);
            }
          } catch (error) {
            console.error('❌ Erreur lors de la création du profil coach:', error);
          }
        }
        
        return { user, account };
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // 1 jour
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
    },
  },

  advanced: {
    cookiePrefix: "edgemy",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NODE_ENV === "production" ? ".edgemy.fr" : undefined,
    },
  },

  // Forcer l'utilisation d'un fetch custom pour éviter les problèmes IPv6
  trustedOrigins: [
    "http://localhost:3000",
    "https://app.edgemy.fr",
    "https://edgemy.fr",
  ],
});

export type Session = typeof auth.$Infer.Session;
