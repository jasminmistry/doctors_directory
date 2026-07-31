import { prisma } from '@/lib/db'

async function main() {
  const found = await prisma.city.findFirst({ where: { name: '4QR' } })
  console.log('Found row:', found)
  await prisma.$disconnect()
}

main()
