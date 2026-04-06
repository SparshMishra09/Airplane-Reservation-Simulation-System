import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@skyvoyage.com' },
    update: {},
    create: { email: 'admin@skyvoyage.com', password: adminPassword, name: 'Admin', role: 'ADMIN' },
  });

  const passenger = await prisma.user.upsert({
    where: { email: 'passenger@example.com' },
    update: {},
    create: { email: 'passenger@example.com', password: userPassword, name: 'John Doe', role: 'PASSENGER' },
  });

  console.log(`  ✅ Users: admin=${admin.id}, passenger=${passenger.id}`);

  // 2. Create aircraft (reference data for the system)
  const aircraft = await Promise.all([
    prisma.aircraft.create({ data: { model: 'Boeing 787', capacity: 180 } }),
    prisma.aircraft.create({ data: { model: 'Airbus A380', capacity: 240 } }),
    prisma.aircraft.create({ data: { model: 'Boeing 777', capacity: 200 } }),
    prisma.aircraft.create({ data: { model: 'Airbus A350', capacity: 220 } }),
    prisma.aircraft.create({ data: { model: 'Airbus A320', capacity: 150 } }),
  ]);

  console.log(`  ✅ Aircraft: ${aircraft.length} created`);

  // 3. Meal Categories & Items (₹ INR pricing)
  const standardCat = await prisma.mealCategory.upsert({
    where: { name: 'Standard' },
    update: {},
    create: { name: 'Standard' },
  });
  const premiumCat = await prisma.mealCategory.upsert({
    where: { name: 'Premium' },
    update: {},
    create: { name: 'Premium' },
  });
  const specialCat = await prisma.mealCategory.upsert({
    where: { name: 'Special' },
    update: {},
    create: { name: 'Special' },
  });

  const mealItems = [
    { name: 'Standard Veg Meal', price: 0, categoryId: standardCat.id },
    { name: 'Standard Non-Veg Meal', price: 0, categoryId: standardCat.id },
    { name: 'Sandwich & Juice', price: 0, categoryId: standardCat.id },
    { name: 'Premium Vegetarian', price: 450, categoryId: premiumCat.id },
    { name: 'Premium Non-Veg', price: 550, categoryId: premiumCat.id },
    { name: 'Continental Platter', price: 650, categoryId: premiumCat.id },
    { name: 'Gourmet Indian Thali', price: 750, categoryId: premiumCat.id },
    { name: 'Halal Meal', price: 500, categoryId: specialCat.id },
    { name: 'Kosher Meal', price: 600, categoryId: specialCat.id },
    { name: 'Vegan Meal', price: 400, categoryId: specialCat.id },
    { name: 'Gluten-Free Meal', price: 450, categoryId: specialCat.id },
    { name: 'Diabetic Meal', price: 500, categoryId: specialCat.id },
    { name: 'Jain Meal', price: 400, categoryId: specialCat.id },
  ];

  for (const item of mealItems) {
    await prisma.mealItem.upsert({
      where: { id: `seed-${item.name.replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: item,
    });
  }

  console.log(`  ✅ Meal Categories: 3 created, Meal Items: ${mealItems.length} created`);

  // 4. Baggage Policies (₹ INR pricing)
  const baggagePolicies = [
    { name: 'Domestic Economy', freeWeightKg: 15, maxWeightKg: 32, extraCostPerKg: 300 },
    { name: 'Domestic Business', freeWeightKg: 25, maxWeightKg: 40, extraCostPerKg: 250 },
    { name: 'Domestic First Class', freeWeightKg: 35, maxWeightKg: 50, extraCostPerKg: 200 },
    { name: 'International Economy', freeWeightKg: 23, maxWeightKg: 40, extraCostPerKg: 500 },
    { name: 'International Business', freeWeightKg: 30, maxWeightKg: 50, extraCostPerKg: 400 },
    { name: 'International First Class', freeWeightKg: 40, maxWeightKg: 60, extraCostPerKg: 350 },
  ];

  for (const policy of baggagePolicies) {
    await prisma.baggagePolicy.upsert({
      where: { name: policy.name },
      update: {},
      create: policy,
    });
  }

  console.log(`  ✅ Baggage Policies: ${baggagePolicies.length} created`);

  console.log('🎉 Seeding complete! (Users + Aircraft + Meals + Baggage Policies)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
