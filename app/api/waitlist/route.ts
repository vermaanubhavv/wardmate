import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * The public waitlist sign-up. No session is required: an anonymous visitor posts the form
 * and the row-security policy on `waitlist` allows the insert for the anon role. Middleware
 * lets `/api/waitlist` through without bouncing to /login.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name, college, department, year_of_residency } = body;

  if (!email || !college || !department || !year_of_residency) {
    return NextResponse.json(
      { error: "Email, college, department, and year of residency are required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.from("waitlist").insert({
    email: String(email).trim().toLowerCase(),
    name: name ? String(name).trim() : null,
    college: String(college).trim(),
    department: String(department).trim(),
    year_of_residency: String(year_of_residency).trim(),
  });

  if (error) {
    // Unique-violation on email: they are already on the list. Treat it as success.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadyJoined: true });
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
