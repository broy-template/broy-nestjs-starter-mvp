import { ApiProperty } from "@nestjs/swagger";
import { UserRO } from "../../../common/dto/user.dto";
import { Type } from "class-transformer";

export class AuthSessionRO {
  @ApiProperty({
    description: 'Logged in user data',
    type: UserRO
  })
  @Type(() => UserRO)
  user: UserRO;

  @ApiProperty({
    description: 'Access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token to refresh access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;
}