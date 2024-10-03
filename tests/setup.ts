import prisma from '../src/config/config';

beforeAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "Make" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "VehicleType" RESTART IDENTITY CASCADE;`;
});

afterAll(async () => {
  await prisma.$disconnect();
});
