import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductRequest } from './dto/create-product.request';
import { ProductsService } from './products.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProductRequest } from './dto/update-product.request';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createProduct(
    @Body() body: CreateProductRequest,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const uploadResult = await this.cloudinaryService.uploadImage(image);
    const createProduct = await this.productsService.createProduct({
      ...body,
      image: uploadResult.secure_url,
    });
    return { message: 'Create Data Success', data: createProduct };
  }

  @Get()
  async getProducts(
    @Query('page') page: number = 1,
    @Query('categoryName') categoryNames?: string[], // Accepts an array of category names
    @Query('sort') sort?: 'asc' | 'desc' | 'latest' | 'oldest',
    @Query('search') search?: string,
  ) {
    const { currentPage, totalPages, totalProducts, products } =
      await this.productsService.getProducts({
        page,
        categoryNames: categoryNames
          ? Array.isArray(categoryNames)
            ? categoryNames
            : [categoryNames]
          : [], // Ensure it's an array
        sort,
        search,
      });
    return {
      message: 'Get Data Success',
      pagination: {
        currentPage,
        totalPages,
        totalProducts,
      },
      data: products,
    };
  }

  @Get(':productId')
  async getProduct(@Param('productId') productId: string) {
    const getProduct = await this.productsService.getProduct(productId);
    return { message: 'Get Data Success', data: getProduct };
  }

  @Patch(':productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateProduct(
    @Param('productId') productId: string,
    @Body() request: UpdateProductRequest,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    if (image) {
      const uploadResult = await this.cloudinaryService.uploadImage(image);
      request.image = uploadResult.secure_url;
    }

    const updatedProduct = await this.productsService.updateProduct(productId, {
      ...request,
      image: request.image,
    });
    return { message: 'Update Succes', data: updatedProduct };
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteProduct(@Param('productId') productId: string) {
    const deletedProduct = await this.productsService.deleteProduct(productId);
    return { message: 'Product Deleted', data: deletedProduct };
  }
}
