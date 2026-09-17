import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * The public "Contact us" form on /home. No session is required: an anonymous visitor posts
 * the form and the row-security policy on `contact_messages` allows the insert for the anon
 * role. Middleware lets `/home` and `/api/contact` through without bouncing to /login — same
 * treatment as /waitlist and /api/waitlist.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and a message are required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.from("contact_messages").insert({
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    message: String(message).trim(),
  });

  if (error) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
