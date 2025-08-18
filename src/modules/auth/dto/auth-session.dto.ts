import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "./user.dto";
import { IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class AuthSessionDto {
  @ApiProperty({ type: String, description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ type: () => UserDto, description: 'User data' })
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @ApiProperty({ type: String, description: 'Access token' })
  @IsString()
  accessToken: string;
}