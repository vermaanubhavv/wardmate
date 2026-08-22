-- Lets a checklist protocol item say which part of the note it belongs to, so "Current
-- progress" (formerly "Where things stand") can group by Subjective / Objective / Assessment /
-- Plan instead of one flat list. A 5th bucket, 'checks', holds the genuinely administrative
-- items (consent, fitness clearance, fasting status) that do not honestly belong in any SOAP
-- section — see the conversation that decided this rather than forcing them into Plan.
--
-- Nullable: Quick Mode clinical protocols (immediate_action/red_flag/investigation/pathway_step
-- cards like IV Fluids) have no use for this field at all, and a procedure not yet migrated off
-- care_templates has no protocol row to carry it either.

begin;

alter table company_protocol_items add column if not exists soap_section text
  check (soap_section in ('subjective', 'objective', 'assessment', 'plan', 'checks'));

commit;
