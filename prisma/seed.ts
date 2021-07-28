const db = require('../db');

module.exports = async function seed() {
  await db.animalCategory.createMany({
    data: [
    { name: 'chiens' },      
    { name: 'chats' },
    { name: 'chiots' },
    { name: 'chatons' },
    { name: 'chiens senior' },
    { name: 'chats senior' }
  ],
  })
  await db.foodType.createMany({
    data: [
    { name: 'aliments secs' },
    { name: 'aliments humides' },
    { name: 'friandises' },
  ],
  })
};

module
.exports()
.catch((e) => {
  console.error(e);
  process.exit(1);
})
.finally(async () => {
  await db.$disconnect();
});

// npx prisma migrate dev
// npx prisma db seed --preview-feature
// npx prisma migrate reset