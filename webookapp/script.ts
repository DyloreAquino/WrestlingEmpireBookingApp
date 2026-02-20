import { prisma } from "./lib/prisma";
import { Gender, Role, Alignment, Division } from "./generated/prisma/enums";

async function main() {
  // Create a new character with a post
  const wrestler = await prisma.character.create({
    data: {
      name: "John Cena",
      role: "WRESTLER", // all wrestlers
      gender: Gender.MALE,
      alignment: Alignment.FACE,
      finisherName: "Attitude Adjustment",
      injured: false,
      division: Division.TOP_CARD
    },
  });
  console.log("Created character:", wrestler);

  // Fetch all users with their posts
  const allCharacters = await prisma.character.findMany();
  console.log("All users:", JSON.stringify(allCharacters, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });