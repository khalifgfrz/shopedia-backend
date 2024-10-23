import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCartRequest } from './dto/create-cart.request';
import { UpdateCartRequest } from './dto/update-cart.request';

@Injectable()
export class CartsService {
  constructor(private readonly prismaService: PrismaService) {}
  async createCart(userId: number, data: CreateCartRequest) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const product = await this.prismaService.product.findUnique({
      where: { id: data.productId },
      select: { price: true },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${data.productId} not found`,
      );
    }

    const cartItem = await this.prismaService.cart.create({
      data: {
        ...data,
        userId,
      },
    });

    return {
      ...cartItem,
    };
  }

  async getCarts(userId: number) {
    try {
      const carts = await this.prismaService.cart.findMany({
        where: { userId: userId },
      });
      if (carts.length === 0) {
        throw new NotFoundException('No carts found for this user');
      }

      return carts.map((cart) => ({
        ...cart,
      }));
    } catch (err) {
      throw new NotFoundException('Cart not found');
    }
  }

  async updateCart(cartId: string, data: UpdateCartRequest) {
    try {
      const validKeys = ['qty'];
      const incomingKeys = Object.keys(data);

      if (incomingKeys.length > 1 || !validKeys.includes(incomingKeys[0])) {
        throw new BadRequestException(
          'Invalid update. You can only update the qty field.',
        );
      }

      const order = await this.prismaService.cart.update({
        where: { id: cartId },
        data: {
          qty: data.qty,
        },
      });
      return order;
    } catch (err) {
      if (err.code === 'P2025') {
        throw new NotFoundException('User not found.');
      }
      throw err;
    }
  }
}
