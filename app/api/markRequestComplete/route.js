// ✅ Corrected version for firebase-admin Firestore usage
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // make sure you export your initialized Firebase Admin app from here

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Missing orderId" },
        { status: 400 }
      );
    }

    const orderRef = db.collection("inquiries").doc(orderId); // ✅ CORRECT for Admin SDK

    await orderRef.update({ requestComplete: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark order complete:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
