import { prisma } from "@/lib/prisma";
import { AuthProvider, Prisma, User } from "@prisma/client";

interface CreateAuthMethodPayload {
  userId: User["id"];
  provider: AuthProvider;
  providerId?: string;
  passwordHash?: string;
}

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      authMethods: true,
    },
  });
};

export const findUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};

export const createUser = async (data: {
  email: string;
  name: string;
}) => {
  const { email, name } = data;

  return await prisma.user.create({
    data: {
      email,
      name,
    },
  });
};

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
}

export const createAuthMethod = async (data: CreateAuthMethodPayload) => {
  return await prisma.authMethod.create({
    data: {
      userId: data.userId,
      provider: data.provider,
      providerId: data.providerId,
      passwordHash: data.passwordHash,
    },
  });
};

export const updateLocalAuthMethod = async (id: string, passwordHash: string) => {
  return await prisma.authMethod.updateMany({
    where: {
      id,
      provider: AuthProvider.LOCAL,
    },
    data: {
      passwordHash,
    },
  });
};
