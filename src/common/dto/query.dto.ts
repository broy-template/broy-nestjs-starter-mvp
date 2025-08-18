import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumberString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({
    description: 'Halaman (untuk paginasi)',
    example: '1',
    required: false,
    default: '1'
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Halaman harus berupa angka' })
  @Transform(({ value }) => value || '1')
  page?: string = '1';

  @ApiProperty({
    description: 'Jumlah item per halaman',
    example: '10',
    required: false,
    default: '10'
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Limit harus berupa angka' })
  @Transform(({ value }) => value || '10')
  limit?: string = '10';
}

export class SearchDto {
  @ApiProperty({
    description: 'Kata kunci pencarian',
    example: 'search keyword',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Search harus berupa string' })
  search?: string;
}

export class BaseQueryDto extends PaginationDto {
  @ApiProperty({
    description: 'Kata kunci pencarian',
    example: 'search keyword',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Search harus berupa string' })
  search?: string;
}
