import { Role } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class UserRO {
  @ApiProperty({
    description: 'ID unik pengguna',
    example: 'clh123abc456def789'
  })
  id: string;

  @ApiProperty({
    description: 'Email pengguna',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'Role pengguna',
    enum: Role,
    example: Role.USER
  })
  role: Role;

  @ApiProperty({
    description: 'Tanggal pembuatan akun',
    example: '2025-08-18T10:30:00.000Z'
  })
  createdAt: Date;
  
  @ApiProperty({
    description: 'Tanggal terakhir diperbarui',
    example: '2025-08-18T10:30:00.000Z'
  })
  updatedAt: Date;
}