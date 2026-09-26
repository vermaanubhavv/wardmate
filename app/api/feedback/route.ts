import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const fields = ["discovered", "usage", "experience", "improvement", "return", "talk"] as const;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || fields.some((field) => typeof body[field] !== "string" || !body[field])) return NextResponse.json({ error: "Please answer every question." }, { status: 400 });
  const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
  const contact = text(body.contact, 160);
  if (body.talk === "Yes, contact me" && !contact) return NextResponse.json({ error: "Please add a way to contact you." }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from("feedback_responses").insert({ discovered: text(body.discovered, 80), usage: text(body.usage, 100), experience: text(body.experience, 40), improvement: text(body.improvement, 100), would_return: text(body.return, 40), talk: text(body.talk, 40), open_feedback: text(body.open_feedback, 2000) || null, contact: contact || null });
  return error ? NextResponse.json({ error: "Could not save feedback." }, { status: 500 }) : NextResponse.json({ ok: true });
}
