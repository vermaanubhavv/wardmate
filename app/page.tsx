import { redirect } from "next/navigation";

/**
 * The front door is the ward. There used to be a greeting screen here, read once and then
 * tapped through on every open; the greeting now sits on the ward's own unit card and the
 * profile lives on /unit. Anything that has this address bookmarked still lands on the list.
 */
export default function Home() {
  redirect("/ward");
}
