import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserRequest } from './dto/create-user.request';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import {
  UpdateAdminUserRequest,
  UpdateUserRequest,
} from './dto/update-user.request';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: CreateUserRequest): Promise<Partial<User>> {
    try {
      const randomUsername = `user${Math.floor(Math.random() * 1000000000)}`;

      console.log({ data });

      const user = await this.prismaService.user.create({
        data: {
          ...data,
          password: await bcrypt.hash(data.password, 10),
          username: data.username || randomUsername,
          role: data.role || 'user',
        },
        select: {
          email: true,
          username: true,
          image: true,
          role: true,
          created_at: true,
        },
      });

      console.log(user);
      return user;
    } catch (err) {
      console.error(err);
      if (err.code === 'P2002') {
        throw new UnprocessableEntityException('Email already exists.');
      }
      throw err;
    }
  }

  async getUsers() {
    return this.prismaService.user.findMany();
  }

  async getUser(filter: Prisma.UserWhereUniqueInput) {
    return this.prismaService.user.findUniqueOrThrow({
      where: filter,
    });
  }

  async getUserById(userId: number) {
    try {
      return {
        ...(await this.prismaService.user.findUniqueOrThrow({
          where: { id: userId },
        })),
      };
    } catch (err) {
      throw new NotFoundException('User not found');
    }
  }

  async updateUser(
    userId: number,
    data: UpdateUserRequest,
    currentUserRole: string,
  ): Promise<Partial<User>> {
    try {
      if (data.role && currentUserRole !== 'admin') {
        throw new ForbiddenException('Only admin users can update the role.');
      }
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      const user = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...data,
        },
      });
      return user;
    } catch (err) {
      console.error(err);
      if (err.code === 'P2025') {
        throw new NotFoundException('User not found.');
      }
      throw err;
    }
  }

  async adminUpdateUser(userId: number, data: UpdateAdminUserRequest) {
    try {
      const validKeys = ['role'];
      const incomingKeys = Object.keys(data);

      if (incomingKeys.length > 1 || !validKeys.includes(incomingKeys[0])) {
        throw new BadRequestException(
          'Invalid update. You can only update the role field.',
        );
      }
      const user = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          role: data.role,
        },
      });

      return user;
    } catch (err) {
      console.error(err);
      if (err.code === 'P2025') {
        throw new NotFoundException('User not found.');
      }
      throw err;
    }
  }
}
