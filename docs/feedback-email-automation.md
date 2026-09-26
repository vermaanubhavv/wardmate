# Feedback email automation

The app sends one feedback email to each non-admin Wardmate user after they have been signed up
for at least 24 hours. Existing users are included once the automation is switched on. The job
runs daily, so delivery will occur roughly 24–48 hours after sign-up.

## One-time setup

1. The feedback form is hosted at `https://wardmate.in/feedback`; no Google Form is required.
   Responses appear under **Admin console → Feedback**.
2. In Resend, verify `wardmate.in` and add the required DNS records. Create an API key with send
   permission, then set `RESEND_API_KEY` in Vercel.
3. In Vercel Production environment variables, set:
   - `NEXT_PUBLIC_SITE_URL` to the production Wardmate URL.
   - `FEEDBACK_CONTACT_PHONE` to the number to display (for example, `+91 98765 43210`).
   - `FEEDBACK_EMAIL_FROM` to `Anubhav <anubhav@wardmate.in>`.
   - `SUPABASE_SERVICE_ROLE_KEY` from Supabase Project Settings → API. This is server-only.
   - `RESEND_API_KEY` from Resend.
   - `CRON_SECRET` and `FEEDBACK_UNSUBSCRIBE_SECRET`, each a separate random value of at least
     32 characters.
4. Run `npm run db:push`, then deploy production. Vercel registers the daily cron from
   `vercel.json` on deployment.

## Safety and results

- The delivery ledger prevents repeat sends, excludes admin accounts, retries a failed send an
  hour later, and excludes anyone who unsubscribes.
- The email contains a form link, your phone number, and a one-click unsubscribe endpoint.
- Form responses are visible in the Wardmate admin console under **Feedback**.
- The current Vercel Hobby schedule is daily. Upgrade to Pro and use an hourly schedule if
  you need delivery closer to exactly 24 hours after sign-up.
