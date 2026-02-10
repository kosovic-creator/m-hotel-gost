import "dotenv/config";
import { PrismaClient } from "./app/generated/prisma/index.js";

const prisma = new PrismaClient();

async function checkDB() {
  try {
    const result = await prisma.$queryRaw`SELECT * FROM "Rezervacija" LIMIT 1`;
    console.log("Rezervacija table:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB();
