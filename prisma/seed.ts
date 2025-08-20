import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Sample data for seeding
const sampleUsers = [
  {
    email: 'admin@starter.com',
    password: 'admin123',
    role: 'ADMIN',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      bio: 'System Administrator',
    },
  },
  {
    email: 'john.doe@starter.com',
    password: 'password123',
    role: 'USER',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Software Developer',
      phoneNumber: '+1234567890',
    },
  },
  {
    email: 'jane.smith@starter.com',
    password: 'password123',
    role: 'USER',
    profile: {
      firstName: 'Jane',
      lastName: 'Smith',
      bio: 'Product Manager',
      phoneNumber: '+1234567891',
    },
  },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional, use with caution)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create users with profiles
  for (const userData of sampleUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role as any,
        profile: {
          create: userData.profile,
        },
      },
      include: {
        profile: true,
      },
    });

    console.log(`✅ User created: ${user.email} (${user.role})`);
  }

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
