import { ApiProperty } from "@nestjs/swagger";
import { UserRO } from "../../../common/dto/user.dto";
import { Type } from "class-transformer";

export interface AuthSessionRO {
  user: UserRO;

  accessToken: string;

  refreshToken: string;
}