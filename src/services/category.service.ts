import {
  createCategory,
  updateCategory as _updateCategory,
  getAllCategories,
  findCategoryById,
} from '@/repositories/category.repository';
import { createCategorySchema } from '@/validationSchemas/category';
import z from 'zod';
import { CategoryContract } from '@/contracts/category';
import AuthService from './auth.service';
import { NotFoundError } from '@/lib/errors';

class CategoryService {
  static async fetchAllCategories(): Promise<CategoryContract[]> {
    const categories = await getAllCategories();
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));
  }

  static async createNewCategory(
    payload: z.infer<typeof createCategorySchema>,
  ): Promise<CategoryContract> {
    await AuthService.authorizeUser(['ADMIN']);

    const { name } = payload;

    const category = await createCategory({ name });

    return {
      id: category.id,
      name: category.name,
    };
  }

  static async updateCategory(
    id: number,
    payload: z.infer<typeof createCategorySchema>,
  ): Promise<CategoryContract> {
    await AuthService.authorizeUser(['ADMIN']);

    const { name } = payload;
    const existingCategory = await findCategoryById(id);
    if (!existingCategory || existingCategory.deleted_at) {
      throw new NotFoundError('Category not found');
    }

    const category = await _updateCategory(id, { name });

    return {
      id: category.id,
      name: category.name,
    };
  }

  static async deleteCategory(id: number): Promise<void> {
    await AuthService.authorizeUser(['ADMIN']);

    await _updateCategory(id, {
      deleted_at: new Date(),
      name: `Deleted Category ${id}`,
    });

    return;
  }
}

export default CategoryService;
