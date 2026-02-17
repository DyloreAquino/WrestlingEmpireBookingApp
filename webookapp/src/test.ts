// src/test.ts
import { prisma } from "./lib/prisma";
import { Role, Gender, Alignment, Division } from "./generated/enums";

async function main() {
  try {
    // Fetch all characters
    const characters = await prisma.character.findMany();
    console.log("Characters in DB:", characters);

    // Optional: create a test character
        const testCharacter = await prisma.character.create({
    data: {
        name: "John Cena",
        role: Role.WRESTLER,
        gender: Gender.MALE,
        alignment: Alignment.FACE,
        division: Division.TOP_CARD,
    },
    });

    console.log("Created character:", testCharacter);

  } catch (err) {
    console.error("Prisma test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
