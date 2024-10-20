const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const seed = async () => {
  try {
    await prisma.user.upsert({
      where: { id: 1 },
      create: { id: 1, username: "Zyxn010", password: "123123aA@" },
      update: { username: "Zyxn010", password: "123123aA@" },
    });
  } catch (error) {
    console.log(error);
  }
};
seed();
