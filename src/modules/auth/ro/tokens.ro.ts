import { ApiProperty } from "@nestjs/swagger";

export class TokensRO {
  @ApiProperty({
    description: 'Token akses untuk autentikasi',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token untuk memperbarui access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;
}
