// app/api/getorder/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req) {
  try {
    // Get URL parameters for date filtering
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "0");

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);

    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const snapshot = await db
      .collection("inquiries")
      .where("createdAt", ">=", startTimestamp)
      .where("createdAt", "<", endTimestamp)
      .get();

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        phone: data.phone || "",
        productId: data.productId || "",
        productName: data.productName || "",
        status: data.status || "inquiry",
        createdAt: data.createdAt ? { seconds: data.createdAt.seconds } : null,
      };
    });

    // Sort by date (newest first)
    orders.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
