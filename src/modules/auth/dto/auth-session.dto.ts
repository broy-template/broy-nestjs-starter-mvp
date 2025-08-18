import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "../../../common/dto/user.dto";
import { Type } from "class-transformer";

export class AuthSessionDto {
  @ApiProperty({ type: () => UserDto, description: 'User data' })
  @Type(() => UserDto)
  user: UserDto;

  @ApiProperty({ type: String, description: 'Access token' })
  accessToken: string;

  @ApiProperty({ type: String, description: 'Refresh token' })
  refreshToken: string;
}