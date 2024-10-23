import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderRequest } from './dto/create-order.request';
import { UpdateOrderRequest } from './dto/update-order.request';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}
  async createOrder(userId: number, data: CreateOrderRequest) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { products, ...orderData } = data;

    const order = await this.prismaService.order.create({
      data: {
        ...orderData,
        status: data.status || 'processing',
        userId,
        items: {
          create: products.map((item) => ({
            productId: item.productId,
            qty: item.qty,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      ...order,
      items: order.items.map((item) => ({
        name: item.product.name,
        qty: item.qty,
      })),
    };
  }

  async getOrders({
    page,
  }: {
    page: number;
    sort?: 'latest' | 'oldest';
    search?: string;
  }) {
    const take = 10;
    const skip = (page - 1) * take;

    const orders = await this.prismaService.order.findMany({
      take,
      skip,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        name: item.product.name,
        qty: item.qty,
      })),
    }));
  }

  async getOrder(orderId: string) {
    try {
      const order = await this.prismaService.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        ...order,
        items: order.items.map((item) => ({
          name: item.product.name,
          qty: item.qty,
        })),
      };
    } catch (err) {
      throw new NotFoundException('Order not found');
    }
  }

  async getHistoryOrder(userId: number) {
    try {
      const orders = await this.prismaService.order.findMany({
        where: { userId: userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (orders.length === 0) {
        throw new NotFoundException('No orders found for this user');
      }

      return orders.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          name: item.product.name,
          qty: item.qty,
        })),
      }));
    } catch (err) {
      throw new NotFoundException('Order not found');
    }
  }

  async updateOrder(orderId: string, data: UpdateOrderRequest) {
    try {
      const validKeys = ['status'];
      const incomingKeys = Object.keys(data);

      if (incomingKeys.length > 1 || !validKeys.includes(incomingKeys[0])) {
        throw new BadRequestException(
          'Invalid update. You can only update the status field.',
        );
      }

      const order = await this.prismaService.order.update({
        where: { id: orderId },
        data: {
          status: data.status,
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return order;
    } catch (err) {
      console.error(err);
      if (err.code === 'P2025') {
        throw new NotFoundException('Order not found.');
      }
      throw err;
    }
  }
}
