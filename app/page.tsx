import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * The front door is the ward. There used to be a greeting screen here, read once and then
 * tapped through on every open; the greeting now sits on the ward's own unit card and the
 * profile lives on /unit. Anything that has this address bookmarked still lands on the list.
 */
export default async function Home() {
  // An invite tapped while signed out left its code in a cookie (app/join/route.ts); now that
  // sign-in has brought them here, the join happens before anything else.
  if ((await cookies()).get("wm-join-code")) redirect("/join");
  redirect("/ward");
}
