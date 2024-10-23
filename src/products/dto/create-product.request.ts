import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateProductRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  stock: number;

  image?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Type(() => Number)
  categoryIds: number[];
}
