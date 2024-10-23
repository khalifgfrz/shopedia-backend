import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderRequest {
  @IsOptional()
  @IsString()
  status?: string;
}
