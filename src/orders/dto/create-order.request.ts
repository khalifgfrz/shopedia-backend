import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

class CreateOrderItemRequest {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  qty: number;
}

export class CreateOrderRequest {
  @IsNotEmpty()
  @IsNumber()
  paymentId: number;

  @IsNotEmpty()
  @IsNumber()
  deliveryId: number;

  @IsOptional()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsNumber()
  subtotal: number;

  @IsNotEmpty()
  @IsNumber()
  tax: number;

  @IsNotEmpty()
  @IsNumber()
  shippingCost: number;

  @IsNotEmpty()
  @IsNumber()
  grandTotal: number;

  @IsArray()
  @IsNotEmpty({ each: true })
  products: CreateOrderItemRequest[];
}
