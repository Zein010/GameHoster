import { PrismaClient, Role } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config'; 
const dbUrl = process.env.DATABASE_URL;

const adapter = new PrismaMariaDb({
  host:process.env.DATABASE_HOST,
  user:process.env.DATABASE_USER,
  database:process.env.DATABASE_NAME,
  password:process.env.DATABASE_PASSWORD,
  port:process.env.DATABASE_PORT,
  // Use connectionLimit from ENV or default to 5
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5, 
});

const prisma = new PrismaClient({ adapter });

export { Role,prisma };