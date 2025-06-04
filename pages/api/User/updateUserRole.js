import prisma from "../../../lib/prisma"; // Adjust the path to your Prisma instance
import getSubscription from "./getSubscription";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Fetch the subscription data from Trakteer API
      const subscriptionData = await getSubscription();

      // Check if the subscription data is empty
      if (subscriptionData.length === 0) {
        return res.status(404).json({ error: "No subscription data found" });
      }

      // Find the subscription with the matching transaction ID
      const subscription = subscriptionData.find(
        (sub) => sub.order_id === req.body.transaction_id
      );

      // Convert updated_at to a Date object
      const updatedAt = new Date(subscription.updated_at);

      // Calculate the paidUntil date (30 days from updated_at)
      const paidUntil = new Date(updatedAt);
      paidUntil.setDate(updatedAt.getDate() + 30);

      // Update the user role in the database using Prisma
      await prisma.user.update({
        where: { email: subscription.supporter_email },
        data: {
          role: "paid",
          roleExpiredAt: paidUntil,
        },
      });

      return res
        .status(200)
        .json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      return res.status(500).json({ error: "Failed to update user role" });
    }
  } else {
    // Handle unsupported methods
    return res.status(405).json({ error: "Method not allowed" });
  }
}
