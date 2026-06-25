import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authorizeUserMock: vi.fn(),
  createCategoryMock: vi.fn(),
  updateCategoryMock: vi.fn(),
  getAllCategoriesMock: vi.fn(),
  findCategoryByIdMock: vi.fn(),
  createCategorySchemaParseMock: vi.fn(),
}));

vi.mock('@/services/auth.service', () => ({
  default: {
    authorizeUser: mocks.authorizeUserMock,
  },
}));

vi.mock('@/repositories/category.repository', () => ({
  createCategory: mocks.createCategoryMock,
  updateCategory: mocks.updateCategoryMock,
  getAllCategories: mocks.getAllCategoriesMock,
  findCategoryById: mocks.findCategoryByIdMock,
}));

vi.mock('@/validationSchemas/category', () => ({
  createCategorySchema: {
    parse: mocks.createCategorySchemaParseMock,
  },
}));

import CategoryService from '@/services/category.service';
import { NotFoundError } from '@/lib/errors';

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and maps all categories', async () => {
    mocks.getAllCategoriesMock.mockResolvedValue([
      { id: 1, name: 'Shoes' },
      { id: 2, name: 'Bags' },
    ]);

    await expect(CategoryService.fetchAllCategories()).resolves.toEqual([
      { id: 1, name: 'Shoes' },
      { id: 2, name: 'Bags' },
    ]);
  });

  it('creates a new category for admins', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.createCategoryMock.mockResolvedValue({ id: 3, name: 'Accessories' });
    mocks.createCategorySchemaParseMock.mockReturnValue({ name: 'Accessories' });

    await expect(
      CategoryService.createNewCategory({ name: 'Accessories' } as never),
    ).resolves.toEqual({ id: 3, name: 'Accessories' });

    expect(mocks.createCategoryMock).toHaveBeenCalledWith({ name: 'Accessories' });
  });

  it('updates an existing category', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.findCategoryByIdMock.mockResolvedValue({ id: 1, name: 'Old Name', deleted_at: null });
    mocks.updateCategoryMock.mockResolvedValue({ id: 1, name: 'New Name' });

    await expect(
      CategoryService.updateCategory(1, { name: 'New Name' } as never),
    ).resolves.toEqual({ id: 1, name: 'New Name' });

    expect(mocks.updateCategoryMock).toHaveBeenCalledWith(1, { name: 'New Name' });
  });

  it('throws when updating a missing category', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.findCategoryByIdMock.mockResolvedValue(null);

    await expect(
      CategoryService.updateCategory(1, { name: 'New Name' } as never),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('soft deletes a category by renaming and timestamping it', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });

    await CategoryService.deleteCategory(7);

    expect(mocks.updateCategoryMock).toHaveBeenCalledWith(7, {
      deleted_at: expect.any(Date),
      name: 'Deleted Category 7',
    });
  });
});
