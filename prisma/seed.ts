import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password untuk admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Buat user admin default
  const admin = await prisma.user.upsert({
    where: { email: 'admin@starter.com' },
    update: {},
    create: {
      email: 'admin@starter.com',
      name: 'System Administrator',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', { id: admin.id, email: admin.email });

  // Buat beberapa user biasa untuk testing
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'user1@starter.com' },
      update: {},
      create: {
        email: 'user1@starter.com',
        name: 'John Doe',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user2@starter.com' },
      update: {},
      create: {
        email: 'user2@starter.com',
        name: 'Jane Smith',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
    }),
  ]);

  console.log('✅ Test users created:', users.length);
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
