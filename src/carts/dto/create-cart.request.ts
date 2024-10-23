import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCartRequest {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  qty: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
