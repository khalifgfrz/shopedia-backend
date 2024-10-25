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
      throw new NotFoundException(`Product not found`);
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

  async getCarts({ page, userId }: { page: number; userId: number }) {
    const take = 10;
    const skip = (page - 1) * take;

    const where = { userId: userId };

    try {
      const carts = await this.prismaService.cart.findMany({
        where,
        take,
        skip,
        include: {
          product: {
            select: {
              name: true,
              image: true,
              description: true,
            },
          },
        },
      });

      if (carts.length === 0) {
        throw new NotFoundException('No products found for this user');
      }

      const totalProducts = await this.prismaService.cart.count({ where });
      const totalPages = Math.ceil(totalProducts / take);

      return {
        currentPage: page,
        totalPages,
        totalProducts,
        carts: carts.map((cart) => ({
          id: cart.id,
          userId: cart.userId,
          productId: cart.productId,
          productName: cart.product?.name || 'N/A',
          productImage: cart.product?.image || 'N/A',
          productDescription: cart.product?.description || 'N/A',
          qty: cart.qty,
          price: cart.price,
        })),
      };
    } catch (err) {
      throw new NotFoundException('Product not found');
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

      const cart = await this.prismaService.cart.update({
        where: { id: cartId },
        data: {
          qty: data.qty,
        },
      });
      return cart;
    } catch (err) {
      if (err.code === 'P2025') {
        throw new NotFoundException('Product not found.');
      }
      throw err;
    }
  }

  async deleteCart(cartId: string) {
    try {
      const cart = await this.prismaService.cart.delete({
        where: { id: cartId },
      });
      return cart;
    } catch (err) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Product not found.`);
      }
      throw err;
    }
  }
}
