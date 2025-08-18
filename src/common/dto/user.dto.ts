import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsEmail, IsEnum, IsUUID } from "class-validator";


export class UserDto {
  @ApiProperty({ description: "ID unik untuk pengguna", format: "uuid" })
  @IsUUID()
  id: string;

  @ApiProperty({ description: "Alamat email pengguna", example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: Role, description: "Peran pengguna dalam sistem", example: Role.USER })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ description: "Tanggal saat pengguna dibuat", type: String, format: "date-time", example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date;
  
  @ApiProperty({ description: "Tanggal saat pengguna terakhir diperbarui", type: String, format: "date-time", example: "2024-01-02T00:00:00.000Z" })
  updatedAt: Date;
}