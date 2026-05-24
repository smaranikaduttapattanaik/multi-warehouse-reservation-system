import "dotenv/config";
import { prisma } from "./lib/prisma";

async function main() {
  const products = await prisma.product.findMany();

  console.log(products);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });