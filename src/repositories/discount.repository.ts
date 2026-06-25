import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const include = {
  product: {
    include: {
      category: true,
    },
  },
  category: true,
};

export const getAllDiscounts = () =>
  prisma.discount.findMany({
    include,
  });

export const getDiscountById = (id: string) =>
  prisma.discount.findUnique({
    where: { id },
    include,
  });

export const createDiscount = (data: Prisma.DiscountCreateInput) =>
  prisma.discount.create({
    data,
    include,
  });

export const deleteDiscount = (id: string) =>
  prisma.discount.delete({
    where: { id },
  });