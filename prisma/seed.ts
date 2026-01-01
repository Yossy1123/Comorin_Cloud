import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 当事者データ（匿名化ID）を作成
  const patients = [
    { anonymousId: '25-001' },
    { anonymousId: '25-002' },
    { anonymousId: '25-003' },
    { anonymousId: '25-004' },
    { anonymousId: '25-005' },
    { anonymousId: '25-101' },
    { anonymousId: '25-102' },
    { anonymousId: '25-103' },
    { anonymousId: '25-104' },
    { anonymousId: '25-105' },
    { anonymousId: '25-106' },
    { anonymousId: '25-107' },
    { anonymousId: '25-108' },
    { anonymousId: '25-109' },
    { anonymousId: '25-110' },
    { anonymousId: '25-111' },
    { anonymousId: '25-112' },
  ]

  for (const patient of patients) {
    const existing = await prisma.patient.findUnique({
      where: { anonymousId: patient.anonymousId },
    })

    if (existing) {
      console.log(`  ⏭️  Patient ${patient.anonymousId} already exists`)
    } else {
      await prisma.patient.create({
        data: {
          anonymousId: patient.anonymousId,
          registeredAt: new Date(),
        },
      })
      console.log(`  ✅ Created patient: ${patient.anonymousId}`)
    }
  }

  console.log('✨ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })






