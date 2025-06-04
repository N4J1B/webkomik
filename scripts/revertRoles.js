import prisma from "../lib/prisma.js";
import cron from "node-cron";

// Schedule the task to run daily at midnight
cron.schedule("3 16 * * *", async () => {
  console.log("Running scheduled task to revert expired paid roles...");

  try {
    const now = new Date();

    const expiredUsers = await prisma.user.findMany({
      where: {
        role: "paid",
        roleExpiredAt: {
          lte: now,
        },
      },
    });

    for (const user of expiredUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "paidEnd",
        },
      });
      console.log(`Reverted user ${user.name} to free role.`);
    }
  } catch (error) {
    console.error("Error reverting expired paid roles:", error);
  }
});
