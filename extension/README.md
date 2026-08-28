# WardMate — prescription fill

Ticks the drugs from a WardMate discharge summary on the hospital's FUP drug list.

## What it does, and what it deliberately does not

**Does:** ticks one checkbox per medicine you have linked to the formulary in WardMate.

**Does not:** press Select. Press Save. Fill any dose, frequency or duration. Choose a drug
you have not already linked yourself. Send anything anywhere — it talks to no server, and the
only data it holds is the list you paste into it, kept in this browser.

You review every tick and press Select yourself. That is the point: a wrong tick is visible
and costs one click to undo, which is a different thing entirely from software walking a
multi-step form unattended.

## Installing

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. **Load unpacked** → choose this `extension` folder

## Using it

1. In WardMate, open the patient's discharge summary → **Copy for hospital system**
2. In ESIC, open the patient's prescription page → **Add** under Medications (the drug list opens)
3. The WardMate panel is at the top right. First time only: paste, then **Load**
4. Press **Tick N drugs**
5. **Read the list.** Then press Select yourself

Anything it could not tick is named, with why — not linked in WardMate, or not on this list.
Those you enter by hand.

## Known limits

- Written against the page as captured on 28 Aug 2026. If ESIC changes that page, ticking may
  stop working — it will fail visibly (nothing gets ticked), not silently mis-tick.
- The formulary list repeats entries (1,557 rows, 1,057 distinct medicines — the duplicates are
  separate stock batches). Exactly one row is ticked per medicine.
- Drugs with no confirmed formulary link in WardMate are never guessed at.
