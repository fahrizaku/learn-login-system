// Run with: node src/scripts/make-admin.js <phone>

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function makeAdmin() {
  const phone = process.argv[2];

  if (!phone) {
    console.error("Please provide a phone number: node make-admin.js <phone>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      console.error("User not found");
      process.exit(1);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    });

    console.log(`User ${phone} is now an admin`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
