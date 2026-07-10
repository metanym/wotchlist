require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const due = await prisma.reminder.findMany({
    where: { remindAt: { lte: new Date() }, firedAt: null },
    include: { listItem: true },
  });

  if (due.length === 0) {
    console.log("no reminders due");
    await prisma.$disconnect();
    return;
  }

  for (const reminder of due) {
    await prisma.notification.create({
      data: {
        userId: reminder.userId,
        type: "REMINDER",
        listId: reminder.listItem.listId,
        listItemId: reminder.listItemId,
        message: reminder.note,
      },
    });
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { firedAt: new Date() },
    });
    console.log(`fired reminder ${reminder.id} for user ${reminder.userId}`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
