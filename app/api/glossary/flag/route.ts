import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES = ["drug", "procedure", "ward_shorthand", "anatomy"];

/**
 * A resident telling the app it misheard something.
 *
 * The whole growth mechanism for the unit's glossary. It has to cost one tap at a bedside or
 * it will never be used, so this asks for as little as possible: the word as heard, the word as
 * meant, and optionally what kind of word it is.
 *
 * The upsert, the count and the promotion to 'confirmed' all happen inside flag_glossary_term
 * in the database — see supabase/patches/0022_glossary_terms.sql. Doing it there rather than
 * here is what makes it atomic: two residents flagging the same word in the same minute would
 * otherwise read the same count and write back the same number, losing one of the two.
 *
 * This route deliberately holds no logic of its own beyond checking the shape of what came in.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { wrongTerm?: unknown; correctTerm?: unknown; category?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const wrongTerm = typeof body.wrongTerm === "string" ? body.wrongTerm.trim() : "";
  const correctTerm = typeof body.correctTerm === "string" ? body.correctTerm.trim() : "";
  const category =
    typeof body.category === "string" && CATEGORIES.includes(body.category)
      ? body.category
      : null;

  if (!wrongTerm || !correctTerm) {
    return NextResponse.json(
      { error: "Both the word as heard and the word as meant are needed." },
      { status: 400 }
    );
  }

  // A guard on length rather than on content: this ends up in a prompt, and a pasted paragraph
  // would dilute every correction beside it. Words and short phrases only.
  if (wrongTerm.length > 80 || correctTerm.length > 80) {
    return NextResponse.json(
      { error: "That is too long for a glossary term — a word or short phrase." },
      { status: 400 }
    );
  }

  const { error } = await supabase.rpc("flag_glossary_term", {
    wrong: wrongTerm,
    correct: correctTerm,
    term_category: category,
  });

  if (error) {
    // Named plainly, because the likeliest cause by far is the patch not having been run.
    const missing = /function .*flag_glossary_term.* does not exist/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "The glossary is not set up on this database yet — run patch 0022."
          : error.message,
      },
      { status: missing ? 501 : 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
