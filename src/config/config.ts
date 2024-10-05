
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "postgres://default:lbx7wrmQ8HYd@ep-dark-cake-a4igc6ta-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require&pgbouncer=true&connection_limit=1000"
      }
    },
    log: ['error']
  });

export default prisma;
