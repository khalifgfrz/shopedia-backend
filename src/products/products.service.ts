import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProductRequest } from './dto/update-product.request';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}
  async createProduct(data: CreateProductRequest) {
    const { categoryIds, ...rest } = data;
    try {
      const categories = await this.prismaService.category.findMany({
        where: { id: { in: categoryIds } },
      });
      if (categories.length !== categoryIds.length) {
        throw new NotFoundException('One or more categories not found.');
      }
      const product = await this.prismaService.product.create({
        data: {
          ...rest,
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
        },
        include: { categories: true },
      });
      return {
        ...product,
        categories: product.categories.map((category) => category.name),
      };
    } catch (err) {
      if (err.code === 'P2002') {
        throw new UnprocessableEntityException('Product already exists.');
      }

      throw err;
    }
  }

  // service
  async getProducts({
    page,
    categoryNames, // Accept an array of category names
    sort,
    search,
  }: {
    page: number;
    categoryNames?: string[]; // Update to accept an array of category names
    sort?: 'asc' | 'desc' | 'latest' | 'oldest';
    search?: string;
  }) {
    const take = 10;
    const skip = (page - 1) * take;

    const where: Prisma.ProductWhereInput = {
      is_deleted: false,
      ...(categoryNames &&
        categoryNames.length > 0 && {
          categories: { some: { name: { in: categoryNames } } }, // Use 'in' to filter by multiple category names
        }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = {};

    switch (sort) {
      case 'asc':
        orderBy = { name: 'asc' };
        break;
      case 'desc':
        orderBy = { name: 'desc' };
        break;
      case 'latest':
        orderBy = { created_at: 'desc' };
        break;
      case 'oldest':
        orderBy = { created_at: 'asc' };
        break;
      default:
        orderBy = { name: 'asc' };
    }

    const products = await this.prismaService.product.findMany({
      where,
      orderBy,
      take,
      skip,
      include: { categories: true },
    });

    const totalProducts = await this.prismaService.product.count({ where });
    const totalPages = Math.ceil(totalProducts / take);

    return {
      currentPage: page,
      totalPages,
      totalProducts,
      products: products.map((product) => ({
        ...product,
        categories: product.categories.map((category) => category.name),
      })),
    };
  }

  async getProduct(productId: string) {
    try {
      const product = await this.prismaService.product.findUniqueOrThrow({
        where: { id: productId, is_deleted: false },
        include: { categories: true },
      });

      return {
        ...product,
        categories: product.categories.map((category) => category.name),
      };
    } catch (err) {
      throw new NotFoundException('Product not found');
    }
  }

  async updateProduct(productId: string, data: UpdateProductRequest) {
    try {
      const existingProduct =
        await this.prismaService.product.findUniqueOrThrow({
          where: { id: productId, is_deleted: false },
          include: { categories: true },
        });

      const updatedData = {
        name: data.name ?? existingProduct.name,
        description: data.description ?? existingProduct.description,
        price: data.price ?? existingProduct.price,
        stock: data.stock ?? existingProduct.stock,
        image: data.image ?? existingProduct.image,
        categories: {
          connect:
            data.categoryIds?.map((categoryId) => ({ id: categoryId })) || [],
          disconnect: existingProduct.categories
            .filter((cat) => !data.categoryIds?.includes(cat.id))
            .map((cat) => ({ id: cat.id })),
        },
      };

      const updatedProduct = await this.prismaService.product.update({
        where: { id: productId },
        data: updatedData,
        include: { categories: true },
      });

      return updatedProduct;
    } catch (err) {
      throw new NotFoundException('Product not found');
    }
  }

  async deleteProduct(productId: string) {
    const product = await this.prismaService.product.update({
      where: { id: productId },
      data: { is_deleted: true },
    });

    return product;
  }
}
