import { ApiProperty } from "@nestjs/swagger";

export class TokensDto {
  @ApiProperty({ description: 'Token akses untuk autentikasi' })
  accessToken: string;

  @ApiProperty({ description: 'Token refresh untuk memperbarui token akses' })
  refreshToken: string;
}
