require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { Resend } = require("resend");

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function reminderEmailHtml({ titleName, note, url }) {
  const safeTitleName = escapeHtml(titleName);
  const noteBlock = note
    ? `
    <div style="background:#09090b;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px;margin:0 0 24px;">
      <p style="color:#e4e4e7;font-size:14px;line-height:1.5;margin:0;white-space:pre-wrap;">${escapeHtml(note)}</p>
    </div>`
    : "";

  return `
<div style="background:#09090b;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:420px;margin:0 auto;background:#18181b;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:32px;">
    <h1 style="color:#fafafa;font-size:20px;margin:0 0 16px;">Wotchlist</h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.5;margin:0 0 24px;">
      Your reminder for <strong style="color:#fafafa;">${safeTitleName}</strong> is due.
    </p>
    ${noteBlock}
    <a href="${url}" style="display:inline-block;background:#fafafa;color:#18181b;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:8px;">
      View in Wotchlist
    </a>
  </div>
</div>`.trim();
}

function reminderEmailText({ titleName, note, url }) {
  return `Your reminder for "${titleName}" is due.${note ? `\n\n${note}` : ""}\n\n${url}`;
}

async function main() {
  const due = await prisma.reminder.findMany({
    where: { remindAt: { lte: new Date() }, firedAt: null },
    include: { listItem: { include: { title: true } }, user: true },
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

    const titleName = reminder.listItem.title.title;
    const url = `${process.env.NEXTAUTH_URL}/lists/${reminder.listItem.listId}`;
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: reminder.user.email,
      subject: `Reminder: ${titleName}`,
      html: reminderEmailHtml({ titleName, note: reminder.note, url }),
      text: reminderEmailText({ titleName, note: reminder.note, url }),
    });
    if (error) {
      console.error(`failed to email reminder ${reminder.id}:`, error);
    }

    console.log(`fired reminder ${reminder.id} for user ${reminder.userId}`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
