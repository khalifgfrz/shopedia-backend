import { IsNumber, IsOptional } from 'class-validator';

export class UpdateCartRequest {
  @IsOptional()
  @IsNumber()
  qty: number;
}
