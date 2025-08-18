import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class UserEntity {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  name: string | null;

  @ApiProperty()
  @Expose()
  role: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string | null;

  constructor(partial: Partial<UserEntity> | any) {
    if (partial.name === null) {
      partial.name = undefined;
    }
    if (partial.refreshToken === null) {
      partial.refreshToken = undefined;
    }
    Object.assign(this, partial);
  }
}
