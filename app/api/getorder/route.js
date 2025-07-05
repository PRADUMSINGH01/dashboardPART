import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET(req) {
  try {
    // Get URL parameters for date filtering
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam) : -1; // Default to all orders

    // Fetch all orders first
    const snapshot = await db.collection("inquiries").get();

    let orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        phone: data.phone || "",
        productId: data.productId || "",
        productName: data.productName || "",
        status: data.status || "inquiry",
        createdAt: data.createdAt
          ? {
              seconds: data.createdAt.seconds,
              toDate: () => new Date(data.createdAt.seconds * 1000),
            }
          : null,
      };
    });

    // Apply date filtering if needed (days >= 0)
    if (days >= 0) {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);

      orders = orders.filter((order) => {
        if (!order.createdAt) return false;
        const orderDate = order.createdAt.toDate();
        return orderDate >= startDate && orderDate < endDate;
      });
    }

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
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
