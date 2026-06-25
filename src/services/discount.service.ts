import { discountMapper } from '@/mapper/discount';
import AuthService from './auth.service';
import { DiscountContract } from '@/contracts/discounts';
import { NotFoundError } from '@/lib/errors';
import z from 'zod';
import { createDiscountSchema } from '@/validationSchemas/discount';
import {
  createDiscount,
  deleteDiscount,
  getAllDiscounts,
  getDiscountById,
} from '@/repositories/discount.repository';

class DiscountService {
  static async fetchAllDiscounts(): Promise<DiscountContract[]> {
    const discounts = await getAllDiscounts();
    return discounts.map(discountMapper);
  }

  static async fetchDiscountById(id: string): Promise<DiscountContract> {
    const discount = await getDiscountById(id);
    if (!discount) throw new NotFoundError('Discount not found');
    return discountMapper(discount);
  }

  static async createNewDiscount(
    payload: z.infer<typeof createDiscountSchema>,
  ): Promise<DiscountContract> {
    await AuthService.authorizeUser(['ADMIN']);

    const validatedData = createDiscountSchema.parse(payload);

    const { title, description, percentage, productId, categoryId, productIds, expiresAt, imageKey } = validatedData;

    const discount = await createDiscount({
      title,
      description,
      percentage,
      expiresAt,
      imageKey,
      productIds: productIds || [],
      ...(productId ? { product: { connect: { id: productId } } } : {}),
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
    });

    return discountMapper(discount);
  }

  static async deleteDiscount(id: string): Promise<void> {
    await AuthService.authorizeUser(['ADMIN']);

    await deleteDiscount(id);

    return;
  }
}

export default DiscountService;
