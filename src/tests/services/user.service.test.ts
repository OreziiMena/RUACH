import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authorizeUserMock: vi.fn(),
  findUserByEmailMock: vi.fn(),
  findUserByIdMock: vi.fn(),
  updateLocalAuthMethodMock: vi.fn(),
  updateUserMock: vi.fn(),
  createLocalAuthMethodMock: vi.fn(),
  updateUserSchemaParseMock: vi.fn(),
  updatePasswordSchemaParseMock: vi.fn(),
  hashMock: vi.fn(),
  compareMock: vi.fn(),
  userMapperMock: vi.fn(),
}));

vi.mock('@/services/auth.service', () => ({
  default: {
    authorizeUser: mocks.authorizeUserMock,
    createLocalAuthMethod: mocks.createLocalAuthMethodMock,
  },
}));

vi.mock('@/repositories/user.repository', () => ({
  findUserByEmail: mocks.findUserByEmailMock,
  findUserById: mocks.findUserByIdMock,
  updateLocalAuthMethod: mocks.updateLocalAuthMethodMock,
  updateUser: mocks.updateUserMock,
}));

vi.mock('@/validationSchemas/user', () => ({
  updateUserSchema: {
    parse: mocks.updateUserSchemaParseMock,
  },
  updatePasswordSchema: {
    parse: mocks.updatePasswordSchemaParseMock,
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: mocks.hashMock,
    compare: mocks.compareMock,
  },
}));

vi.mock('@/mapper/user', () => ({
  userMapper: mocks.userMapperMock,
}));

import UserService from '@/services/user.service';
import { AuthProvider } from '@prisma/client';
import { BadRequestError, NotFoundError } from '@/lib/errors';

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the authorized profile', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.findUserByIdMock.mockResolvedValue({ id: 'user-1' });
    mocks.userMapperMock.mockReturnValue({ id: 'user-1' });

    await expect(UserService.getProfile()).resolves.toEqual({ id: 'user-1' });
  });

  it('updates the current profile', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.updateUserSchemaParseMock.mockReturnValue({
      email: 'updated@example.com',
      name: 'Updated Name',
      address: '123 Street',
      phone: null,
    });
    mocks.updateUserMock.mockResolvedValue({ id: 'user-1', email: 'updated@example.com' });
    mocks.userMapperMock.mockReturnValue({ id: 'user-1', email: 'updated@example.com' });

    await expect(
      UserService.updateProfile({
        email: 'updated@example.com',
        name: 'Updated Name',
        address: '123 Street',
        phone: null,
      } as never),
    ).resolves.toEqual({ id: 'user-1', email: 'updated@example.com' });

    expect(mocks.updateUserMock).toHaveBeenCalledWith('user-1', {
      email: 'updated@example.com',
      name: 'Updated Name',
      address: '123 Street',
      phone: null,
    });
  });

  it('sets a password when the user has no local auth method', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1', email: 'user@example.com' });
    mocks.updatePasswordSchemaParseMock.mockReturnValue({
      oldPassword: 'oldsecret',
      newPassword: 'newsecret',
    });
    mocks.findUserByEmailMock.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      authMethods: [],
    });
    mocks.hashMock.mockResolvedValue('new-hash');

    await expect(
      UserService.updatePassword({
        oldPassword: 'oldsecret',
        newPassword: 'newsecret',
      } as never),
    ).resolves.toEqual({ message: 'Password set successfully' });

    expect(mocks.createLocalAuthMethodMock).toHaveBeenCalledWith('user-1', 'new-hash');
  });

  it('updates a password when the old password matches', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1', email: 'user@example.com' });
    mocks.updatePasswordSchemaParseMock.mockReturnValue({
      oldPassword: 'oldsecret',
      newPassword: 'newsecret',
    });
    mocks.findUserByEmailMock.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      authMethods: [
        {
          id: 'auth-1',
          provider: AuthProvider.LOCAL,
          passwordHash: 'old-hash',
        },
      ],
    });
    mocks.hashMock.mockResolvedValue('new-hash');
    mocks.compareMock.mockResolvedValue(true);

    await expect(
      UserService.updatePassword({
        oldPassword: 'oldsecret',
        newPassword: 'newsecret',
      } as never),
    ).resolves.toEqual({ message: 'Password updated successfully' });

    expect(mocks.updateLocalAuthMethodMock).toHaveBeenCalledWith('auth-1', 'new-hash');
  });

  it('rejects password updates when the old password is wrong', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1', email: 'user@example.com' });
    mocks.updatePasswordSchemaParseMock.mockReturnValue({
      oldPassword: 'wrong-old',
      newPassword: 'newsecret',
    });
    mocks.findUserByEmailMock.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      authMethods: [
        {
          id: 'auth-1',
          provider: AuthProvider.LOCAL,
          passwordHash: 'old-hash',
        },
      ],
    });
    mocks.hashMock.mockResolvedValue('new-hash');
    mocks.compareMock.mockResolvedValue(false);

    await expect(
      UserService.updatePassword({
        oldPassword: 'wrong-old',
        newPassword: 'newsecret',
      } as never),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('returns an admin-only user profile', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.findUserByIdMock.mockResolvedValue({ id: 'user-1' });
    mocks.userMapperMock.mockReturnValue({ id: 'user-1' });

    await expect(UserService.getUserProfile('user-1')).resolves.toEqual({ id: 'user-1' });
  });

  it('throws when the requested user profile is missing', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.findUserByIdMock.mockResolvedValue(null);

    await expect(UserService.getUserProfile('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});
