import {
  findUserByEmail,
  findUserById,
  updateLocalAuthMethod,
  updateUser,
} from '@/repositories/user.repository';
import AuthService from './auth.service';
import { BadRequestError, NotFoundError } from '@/lib/errors';
import { UserContract } from '@/contracts/user';
import z from 'zod';
import bcrypt from 'bcrypt';
import {
  updatePasswordSchema,
  updateUserSchema,
} from '@/validationSchemas/user';
import { userMapper } from '@/mapper/user';
import { AuthProvider } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from './resend/password';

class UserService {
  static async getProfile() {
    const { id } = await AuthService.authorizeUser();
    const user = await findUserById(id);

    if (!user) {
      throw new NotFoundError('Profile not found');
    }

    return userMapper(user);
  }

  static async updateProfile(
    payload: z.infer<typeof updateUserSchema>,
  ): Promise<UserContract> {
    const user = await AuthService.authorizeUser();

    const data = updateUserSchema.parse(payload);

    const updatedUser = await updateUser(user.id, data);

    return userMapper(updatedUser);
  }

  static async updatePassword(
    payload: z.infer<typeof updatePasswordSchema>,
  ): Promise<{ message: string }> {
    const user = await AuthService.authorizeUser();

    const data = updatePasswordSchema.parse(payload);
    const existingUser = await findUserByEmail(user.email);

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    const localAuthMethod = existingUser.authMethods.find(
      (method) => method.provider === AuthProvider.LOCAL,
    );

    const newPasswordHash = await bcrypt.hash(data.newPassword, 10);

    if (!localAuthMethod) {
      await AuthService.createLocalAuthMethod(existingUser.id, newPasswordHash);
      return { message: 'Password set successfully' };
    }

    const isPasswordValid = await bcrypt.compare(
      data.oldPassword,
      localAuthMethod.passwordHash!,
    );
    if (!isPasswordValid) {
      throw new BadRequestError('Old password is incorrect');
    }

    await updateLocalAuthMethod(localAuthMethod.id, newPasswordHash);

    return { message: 'Password updated successfully' };
  }

  static async getUserProfile(id: string): Promise<UserContract> {
    await AuthService.authorizeUser(['ADMIN']);

    const user = await findUserById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return userMapper(user);
  }

  static async forgotPassword(data: { email: string}) {
    const email = z.email('Invalid Email format').parse(data.email);

    const user = await findUserByEmail(email);
    if (!user) {
      return { message: 'If a user with that email exists, a password reset email has been sent' };
    }

    const resetToken = uuidv4();

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      }
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      }
    })

    await sendPasswordResetEmail(email, resetToken);

    return { message: 'If a user with that email exists, a password reset email has been sent' };
  }

  static async resetPassword(data: { token: string, newPassword: string }) {
    const { token, newPassword } = z.object({
      token: z.string(),
      newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    }).parse(data);

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { include: { authMethods: true } } },
    });

    if (!resetTokenRecord || resetTokenRecord.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const localAuthMethod = resetTokenRecord.user.authMethods.find(
      (method) => method.provider === AuthProvider.LOCAL,
    );

    if (!localAuthMethod) {
      await AuthService.createLocalAuthMethod(resetTokenRecord.user.id, newPasswordHash);
    } else {
      await updateLocalAuthMethod(localAuthMethod.id, newPasswordHash);
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetTokenRecord.userId,
      }
    });

    return { message: 'Password reset successfully' };
  }
}

export default UserService;
