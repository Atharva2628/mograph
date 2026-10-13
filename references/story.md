# Story

## An arc that works for a technical pitch

This is the arc of the VASE Propulsion film (3:09). Use it as a starting point, not a template.

| Act | Job | Music | Notes |
|---|---|---|---|
| 1 · The problem, felt | Shock: show the failure mode, fast and loud | energetic intro | 3–5 full-screen failures, each a different vehicle and world, each dated and named if real, a counter of cost going haywire |
| 2 · Why it is like that | Explain the root cause simply | quieter section | two or three reasons, one diagram each, a number with a keyword |
| 3 · Origin | Make it human: who, when, the setback | quiet / mid | first person if the user presents; one beat per scene |
| 4 · The answer | Reveal the company and the patent; how it works | the big drop | reveal the brand on the drop, then the mechanism part by part |
| 5 · Proof | Show the key property working | driving | side by side (sea level vs vacuum), a sweep with a live readout |
| 6 · Missions | Every use case, the flagship cinematic | after a breakdown | a countdown on the breakdown, the hero mission on the drop, the rest as numbered cards |
| 7 · Close | Value slams, the offer, the name | last drop, then silence | hold the end card through the song's natural silence |

## The hook

- One line that would make an engineer and an investor both stop. Big, two lines, the second in the accent colour.
- **It must survive the strongest counter-example.** "Every rocket throws itself away" fails against reusable boosters; "Every orbital rocket today breaks itself apart" (they all stage) is true and still shocking.
- Follow it with one sub-line that names the mechanism with keywords: "Mid-flight, on purpose. It's called *staging*, and every split is *one more way to fail.*"

## Reading budget

Viewers read slower than you think, and they are watching the motion.

- Headline: ≤ 6 words, hold ≥ 1.2 s after it lands.
- Narration: ≤ 16 words per group, type on in ≤ 0.55 s (`say` caps it), then hold 0.6 s + 0.3 s per word.
- Steps that build (an equation, a list): ~0.6–0.8 s apart in song time is the floor; shorten the scene before you shorten the gaps.
- Never stack two long lines in one beat. Split the sentence or cut words: "Thick air pinches the exhaust. Thin air lets it balloon out. Either way, thrust is wasted…" (30 words) became "Thick air *pinches* the exhaust. Thin air lets it *balloon.* Both *waste thrust*, so every stage needs *its own engine.*" (19).
- If the start feels rushed, the honest fix is time: stretch the opening of the song (see `music.md`), then spend the extra time on the scenes that carry words, and take it back from scenes that only need a glance.

## Where the words go

- During action the eye is on the action. Put the reason in the action's space: a **centered lower-third banner** (`failBanner`), and a **callout with a leader line** pointing at the exact part (`failTag`), large and blinking.
- Corner text is for the HUD (section, time, coordinates), never for the one sentence the scene exists to land.
- Captions appear at the setup (the staging moment), not after the explosion; the explosion is too short to read through.
- Keep text off the subject: headlines left, the object right, or the banner low and the object high.

## Keywords

Mark them with `*asterisks*`: `say('Orbit needs about *9.4 km/s.*', …)`, `pop('MONTHS LATER, *BOEING* FILED', …, { hc: '#0b3b8f' })`, `richLine('Second stage *failed to ignite.*', …)`. Highlight numbers, the decisive verb, names and the contrast word. Two to four per sentence; more and nothing stands out.

## Voice

- If the user is the presenter (a founder pitching their own invention), write the origin in the first person, short and plain: "I searched for patents. *Nothing.* So I *doubted myself*, and *shelved it.*"
- Describe their idea in their words. Ask, or read their own pages; don't simplify it into something they didn't mean ("an aerospike inside a bell" was wrong; "an aerospike's contour revolved 360° into a bell" was the idea).

## Honesty

- Real events: name, date and what happened, checked ("07 MAR 2023 · H3 Test Flight 1 · second stage failed to ignite").
- Invented scenes, numbers and vehicles: "ILLUSTRATIVE" on screen.
- Claims about the user's own technology: stay inside what the patent claims and what physics allows; soften slogans that overreach ("beat the tyranny of the rocket equation").
- Military applications: keep it at the level of capability language ("harder to detect: no separations, no spent stages to track"); no operational detail.
- End card: one line, "Concept visualization. Depictions are schematic; the patent's claims govern."
- Other companies: their name in a bold colour treatment, not their logo, unless the user supplies an official file and wants it.
