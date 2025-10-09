import type { User as PrismaUser } from "@prisma/client";

declare module "better-auth" {
  interface User extends Omit<PrismaUser, "createdAt" | "updatedAt"> {
    createdAt: Date;
    updatedAt: Date;
  }

  interface Session {
    user: User;
  }
}

declare module "better-auth/react" {
  interface User extends Omit<PrismaUser, "createdAt" | "updatedAt"> {
    createdAt: Date;
    updatedAt: Date;
  }

  interface Session {
    user: User;
  }
}
