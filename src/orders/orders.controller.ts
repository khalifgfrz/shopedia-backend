import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderRequest } from './dto/create-order.request';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateOrderRequest } from './dto/update-order.request';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @CurrentUser() user: TokenPayload,
    @Body() request: CreateOrderRequest,
  ) {
    const createOrder = await this.ordersService.createOrder(
      user.userId,
      request,
    );
    return { message: 'Create Data Success', data: createOrder };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getOrders(@Query('page') page: number = 1) {
    const getOrders = await this.ordersService.getOrders({
      page,
    });
    return { message: 'Get Data Success', data: getOrders };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@CurrentUser() user: TokenPayload) {
    const getHistory = await this.ordersService.getHistoryOrder(user.userId);
    return { message: 'Get Data Success', data: getHistory };
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  async getOrder(@Param('orderId') orderId: string) {
    const getOrder = await this.ordersService.getOrder(orderId);
    return { message: 'Get Data Success', data: getOrder };
  }

  @Patch(':orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateOrder(
    @Param('orderId') orderId: string,
    @Body() request: UpdateOrderRequest,
  ) {
    const updatedOrder = await this.ordersService.updateOrder(orderId, request);
    return { message: 'Update Success', data: updatedOrder };
  }
}
