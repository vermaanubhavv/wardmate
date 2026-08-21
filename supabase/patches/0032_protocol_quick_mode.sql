-- Structuring the company protocol library into Quick Mode's sections.
--
-- 0026 gave every protocol a single flat, ordered list of prompts. That is enough to publish
-- something, but it cannot tell "check this now" apart from "escalate urgently if this is
-- true" — and the one thing worth a resident's attention fastest, a red flag, was sitting in
-- the same undifferentiated bullet list as routine advice.
--
-- This is deliberately the smaller half of the protocol-engine spec it was asked against. That
-- spec's full shape — organizations/facilities, eight roles, a versioned approval pipeline,
-- append-only audit events, a patient-attached Guided workflow with a rules engine and
-- voice-extraction-per-field acceptance — is real work, genuinely weeks of it, and would
-- restructure how this app models who belongs to what. None of it is here. What is here is the
-- part that was cheap, safe, and immediately useful on its own: giving an item a KIND, so Quick
-- Mode can put "escalate now" ahead of "here is some background reading" the way the spec's own
-- wireframe does. The safety boundary — never invented, never a diagnosis, never a dose — was
-- already true of 0026 and does not change here.
--
-- Safe to run more than once.

begin;

alter table company_protocol_items add column if not exists kind text
  not null default 'immediate_action'
  check (kind in ('immediate_action', 'red_flag', 'investigation', 'pathway_step'));

-- Only meaningful on a red_flag row. A severity on anything else is not a graded warning, it
-- is a rule with nothing to trigger it, so the check keeps the two from drifting apart.
alter table company_protocol_items add column if not exists severity text
  check (
    (kind = 'red_flag' and severity in ('warning', 'urgent', 'critical'))
    or (kind <> 'red_flag' and severity is null)
  );

-- Read within a kind, in the order authored — the same purpose position already served, now
-- scoped per section instead of across the whole protocol.
create index if not exists company_protocol_items_kind_idx
  on company_protocol_items (protocol_id, kind, position);

commit;
