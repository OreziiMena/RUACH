import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const createCategory = async (payload: Prisma.CategoryCreateInput) => {
  return await prisma.category.create({
    data: payload,
  });
};

export const updateCategory = async (
  id: number,
  payload: Prisma.CategoryUpdateInput,
) => {
  return await prisma.category.update({
    where: { id },
    data: payload,
  });
};

export const findCategoryById = async (id: number) => {
  return await prisma.category.findUnique({
    where: {
      id,
    },
  });
};

export const getAllCategories = async () => {
  return await prisma.category.findMany({
    where: {
      deleted_at: null,
    },
    orderBy: {
      name: 'asc',
    },
  });
};
