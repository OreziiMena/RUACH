import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createAuthMethodMock: vi.fn(),
  createUserMock: vi.fn(),
  findUserByEmailMock: vi.fn(),
  createUserSchemaParseMock: vi.fn(),
  loginUserSchemaParseMock: vi.fn(),
  hashMock: vi.fn(),
  compareMock: vi.fn(),
  signInMock: vi.fn(),
  authMock: vi.fn(),
  userMapperMock: vi.fn(),
}));

vi.mock('@/repositories/user.repository', () => ({
  createAuthMethod: mocks.createAuthMethodMock,
  createUser: mocks.createUserMock,
  findUserByEmail: mocks.findUserByEmailMock,
}));

vi.mock('@/validationSchemas/auth', () => ({
  createUserSchema: {
    parse: mocks.createUserSchemaParseMock,
  },
  loginUserSchema: {
    parse: mocks.loginUserSchemaParseMock,
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: mocks.hashMock,
    compare: mocks.compareMock,
  },
}));

vi.mock('@/auth', () => ({
  auth: mocks.authMock,
  signIn: mocks.signInMock,
}));

vi.mock('@/mapper/user', () => ({
  userMapper: mocks.userMapperMock,
}));

vi.mock('next-auth', () => ({
  CredentialsSignin: class CredentialsSignin extends Error {},
}));

import AuthService from '@/services/auth.service';
import { AuthProvider } from '@prisma/client';
import { CredentialsSignin } from 'next-auth';
import { ForbiddenError, UnAuthorizedError } from '@/lib/errors';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a local auth method with the local provider', async () => {
    await AuthService.createLocalAuthMethod('user-1', 'hash-123');

    expect(mocks.createAuthMethodMock).toHaveBeenCalledWith({
      userId: 'user-1',
      provider: AuthProvider.LOCAL,
      passwordHash: 'hash-123',
    });
  });

  it('signs up a new local user and returns the mapped user', async () => {
    mocks.createUserSchemaParseMock.mockReturnValue({
      email: 'new@example.com',
      name: 'New User',
      password: 'secret123',
    });
    mocks.findUserByEmailMock.mockResolvedValue(null);
    mocks.hashMock.mockResolvedValue('hashed-password');
    mocks.createUserMock.mockResolvedValue({ id: 'user-1', email: 'new@example.com', name: 'New User' });
    mocks.userMapperMock.mockReturnValue({ id: 'user-1', email: 'new@example.com' });

    const result = await AuthService.localSignup({
      email: 'new@example.com',
      name: 'New User',
      password: 'secret123',
    } as never);

    expect(result).toEqual({ id: 'user-1', email: 'new@example.com' });
    expect(mocks.hashMock).toHaveBeenCalledWith('secret123', 10);
    expect(mocks.createUserMock).toHaveBeenCalledWith({ email: 'new@example.com', name: 'New User' });
    expect(mocks.createAuthMethodMock).toHaveBeenCalledWith({
      userId: 'user-1',
      provider: AuthProvider.LOCAL,
      passwordHash: 'hashed-password',
    });
    expect(mocks.signInMock).toHaveBeenCalledWith('credentials', {
      email: 'new@example.com',
      name: 'New User',
      password: 'secret123',
      redirect: false,
    });
  });

  it('rejects signup when the email already exists', async () => {
    mocks.createUserSchemaParseMock.mockReturnValue({
      email: 'existing@example.com',
      name: 'Existing User',
      password: 'secret123',
    });
    mocks.findUserByEmailMock.mockResolvedValue({ id: 'user-1' });

    await expect(
      AuthService.localSignup({
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'secret123',
      } as never),
    ).rejects.toMatchObject({
      error: 'UserAlreadyExists',
      status: 400,
    });
  });

  it('logs in a local user when the password matches', async () => {
    mocks.loginUserSchemaParseMock.mockReturnValue({
      email: 'login@example.com',
      password: 'secret123',
    });
    mocks.findUserByEmailMock.mockResolvedValue({
      id: 'user-1',
      authMethods: [
        {
          provider: AuthProvider.LOCAL,
          passwordHash: 'hashed-password',
        },
      ],
    });
    mocks.compareMock.mockResolvedValue(true);
    mocks.userMapperMock.mockReturnValue({ id: 'user-1', email: 'login@example.com' });

    const result = await AuthService.localLogin({
      email: 'login@example.com',
      password: 'secret123',
    } as never);

    expect(result).toEqual({ id: 'user-1', email: 'login@example.com' });
    expect(mocks.compareMock).toHaveBeenCalledWith('secret123', 'hashed-password');
  });

  it('rejects login when the password is invalid', async () => {
    mocks.loginUserSchemaParseMock.mockReturnValue({
      email: 'login@example.com',
      password: 'wrong-password',
    });
    mocks.findUserByEmailMock.mockResolvedValue({
      authMethods: [
        {
          provider: AuthProvider.LOCAL,
          passwordHash: 'hashed-password',
        },
      ],
    });
    mocks.compareMock.mockResolvedValue(false);

    await expect(
      AuthService.localLogin({
        email: 'login@example.com',
        password: 'wrong-password',
      } as never),
    ).rejects.toBeInstanceOf(CredentialsSignin);
  });

  it('authorizes an authenticated user and enforces roles', async () => {
    mocks.authMock.mockResolvedValue({
      user: { id: 'user-1', role: 'ADMIN' },
    });

    await expect(AuthService.authorizeUser(['ADMIN'])).resolves.toEqual({
      id: 'user-1',
      role: 'ADMIN',
    });
  });

  it('throws unauthorized when there is no session', async () => {
    mocks.authMock.mockResolvedValue(null);

    await expect(AuthService.authorizeUser()).rejects.toBeInstanceOf(UnAuthorizedError);
  });

  it('throws forbidden when the role is not allowed', async () => {
    mocks.authMock.mockResolvedValue({
      user: { id: 'user-1', role: 'USER' },
    });

    await expect(AuthService.authorizeUser(['ADMIN'])).rejects.toBeInstanceOf(ForbiddenError);
  });
});
