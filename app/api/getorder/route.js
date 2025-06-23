// ✅ CORRECT FIRESTORE ADMIN SDK QUERY EXAMPLE
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // Make sure this is using firebase-admin

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Use admin.firestore syntax correctly
    const snapshot = await db
      .collection("inquiries")
      .where("createdAt", ">=", today)
      .where("createdAt", "<", tomorrow)
      .get();

    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching today's orders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
