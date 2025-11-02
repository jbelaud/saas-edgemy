import { prisma } from '../src/lib/prisma';

async function main() {
  const adminUser = await prisma.user.findUnique({
    where: { email: 'e2e-admin@edgemy.test' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log('🔍 Admin user:', adminUser);

  await prisma.$disconnect();
}

main().catch(console.error);
