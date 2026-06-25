import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const include = {
  category: true,
};

export const findProducts = async (
  where: Prisma.ProductWhereInput,
  skip: number,
  limit: number,
  orderBy: Prisma.ProductOrderByWithRelationInput
) => {
  return await prisma.product.findMany({
    where,
    skip,
    take: limit,
    include,
    orderBy,
  });
};

export const findProductById = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
    include,
  });
};

export const findProductBySlug = async (slug: string) => {
  return await prisma.product.findUnique({
    where: { slug },
    include,
  });
};

export const countProducts = async (where: Prisma.ProductWhereInput) => {
  return await prisma.product.count({ where });
}

export const createProduct = async (payload: Prisma.ProductCreateInput) => {
  return await prisma.product.create({ data: payload, include });
}

export const updateProduct = async (slug: string, payload: Prisma.ProductUpdateInput) => {
  return await prisma.product.update({
    where: { slug },
    data: payload,
    include,
  });
}
