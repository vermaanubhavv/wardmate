import FeedbackForm from "./feedback-form";

export const metadata = { title: "Share feedback · Wardmate" };

export default function FeedbackPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-1 px-4 py-10">
      <div className="w-full">
        <p className="text-[14px] font-medium text-accent">Wardmate</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Help us make Wardmate better</h1>
        <p className="mt-2 text-[15px] text-muted">A few quick answers—usually under 2 minutes.</p>
        <FeedbackForm />
      </div>
    </main>
  );
}
