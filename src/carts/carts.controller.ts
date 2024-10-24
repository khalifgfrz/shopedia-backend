import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CreateCartRequest } from './dto/create-cart.request';
import { UpdateCartRequest } from './dto/update-cart.request';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCart(
    @CurrentUser() user: TokenPayload,
    @Body() request: CreateCartRequest,
  ) {
    const createCart = await this.cartsService.createCart(user.userId, request);
    return { message: 'Create Data Success', data: createCart };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCarts(@CurrentUser() user: TokenPayload) {
    const getCart = await this.cartsService.getCarts(user.userId);
    return { message: 'Get Data Success', data: getCart };
  }

  @Patch(':cartId')
  @UseGuards(JwtAuthGuard)
  async updateCart(
    @Param('cartId') cartId: string,
    @Body() request: UpdateCartRequest,
  ) {
    const updatedCart = await this.cartsService.updateCart(cartId, request);
    return { message: 'Update Success', data: updatedCart };
  }

  @Delete(':cartId')
  @UseGuards(JwtAuthGuard)
  async deleteCart(@Param('cartId') cartId: string) {
    const deletedCart = await this.cartsService.deleteCart(cartId);
    return { message: 'Delete Success', data: deletedCart };
  }
}
