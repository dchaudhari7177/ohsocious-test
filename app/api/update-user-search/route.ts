import { db } from "@/lib/firebase"
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const usersRef = collection(db, "users")
    const snapshot = await getDocs(usersRef)

    const updates = snapshot.docs.map(async (userDoc) => {
      const data = userDoc.data()
      
      // Create lowercase versions of searchable fields
      const updates = {
        firstNameLower: (data.firstName || "").toLowerCase(),
        lastNameLower: (data.lastName || "").toLowerCase(),
        usernameLower: (data.username || "").toLowerCase(),
      }

      // Update the document
      await updateDoc(doc(db, "users", userDoc.id), updates)
    })

    await Promise.all(updates)

    return NextResponse.json({ success: true, message: "Users updated successfully" })
  } catch (error) {
    console.error("Error updating users:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update users" },
      { status: 500 }
    )
  }
} 