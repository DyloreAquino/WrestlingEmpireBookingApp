import { prisma } from "@prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create a Show
  const show = await prisma.show.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: "Monday Night Raw",
      type: "TV",
      month: "JAN",
      week: 1,
    },
  });

  // 2. Create some Wrestlers
  const wrestler1 = await prisma.character.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "John Cena",
      role: "WRESTLER",
      gender: "MALE",
      alignment: "FACE",
      division: "TOP_CARD",
      finisherName: "Attitude Adjustment",
    },
  });

  const wrestler2 = await prisma.character.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Roman Reigns",
      role: "WRESTLER",
      gender: "MALE",
      alignment: "HEEL",
      division: "TOP_CARD",
      finisherName: "Spear",
    },
  });

  // 3. Create a Championship
  await prisma.championship.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "World Heavyweight Championship",
      division: "TOP_CARD",
      gender: "MALE",
    },
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });