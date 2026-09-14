# Episode template: ailabs-explainer

A beat sheet with real word budgets, derived from the measured chapter proportions in
`references/ailabs-unlazy/TEARDOWN.md`. Fill in the subject; the shape stays.

## How the budgets were derived

The reference runs 2942 words over 12:57. Strip the 202-word sponsor read, which we do
not inherit, and 2740 words remain across six beats. Those beats hold these proportions:

| Beat | Reference words | Share |
|---|---:|---:|
| Cold open | 168 | 6.1% |
| What it is | 215 | 7.8% |
| Mechanism of the problem | 616 | 22.5% |
| Mechanism of the solution | 861 | 31.4% |
| Install and use | 298 | 10.9% |
| The honest failure and the fix | 582 | 21.2% |

Two thirds of the script is mechanism. That is the format.

## Budget at 225 wpm

Default target 5:30, which is 1237 words. Scale the table for other runtimes.

| Beat | Words | Runtime | Shots |
|---|---:|---:|---|
| 1. Cold open | 75 | 0:20 | 1 synthetic, one continuous hold |
| 2. What it is | 97 | 0:26 | 1 synthetic + 1 punched-in recording |
| 3. Mechanism of the problem | 278 | 1:14 | 2 to 3 synthetic, at least one 20s+ hold |
| 4. Mechanism of the solution | 389 | 1:44 | 3 to 4 synthetic, the hero diagram lives here |
| 5. Install and use | 135 | 0:36 | punched-in recordings, faster cutting allowed |
| 6. The honest failure and the fix | 262 | 1:10 | 2 synthetic, the payoff visual lives here |
| **Total** | **1236** | **5:30** | |

Other runtimes: 3:30 = 787 words. 7:30 = 1687 words. Keep the percentages.

## The beats

**1. Cold open.** State the problem the viewer already feels, in the first sentence. No
bumper, no "hey everyone", no channel intro. The reference opens on "they never take
ownership of that task, and this is why we always have to review the agent's output."
Then promise the twist before 0:30 so there is a reason to stay.

**2. What it is.** Name the thing. Borrow authority if there is real authority to borrow.
Say what it does in one sentence, not what it is built from.

**3. Mechanism of the problem.** The longest beat before the solution, and the one most
people skip. Explain *why* the problem exists at the level of the actual mechanism.
Name two concrete ways it shows up, with a specific example of each.

Then kill the prior art. List what already exists by name and give each one its specific
flaw. This is what makes the new thing feel necessary rather than merely novel. Vague
dismissal does not work here; the audience knows these tools.

**4. Mechanism of the solution.** How it actually works, in order, one idea per shot.
This is where the hero diagram earns its 20s+ hold. Do not list features. Walk the
mechanism.

**5. Install and use.** Short. Real screen recordings, punched in until the command
being typed is unmissable. This is the only beat where faster cutting is correct.

**6. The honest failure and the fix.** Where it broke when we ran it, with a real number
attached. Then what we changed, and the measured result. This beat is not optional and
it is not garnish: it is the only part of the video that is ours, and admitting the
shortfall buys more credibility than the other five beats combined.

## Shot rules

- Roughly 4.7 hard cuts per minute across the whole video.
- At least one continuous hold of 20s or more in each of beats 3, 4 and 6.
- Exactly one accent colour on screen, marking the thing being narrated right now.
- Grey pills instead of real text, unless the literal word is the point.
- Real recordings punched to 200 to 300%. If the viewer squints, the shot is wrong.

## Before you record

Write the frame map - slot, start frame, duration, motif, what the accent is on - and
check it sums to the total. Do this before opening a component file.

After the narration exists, measure the real audio and rebuild the map against those
timings. The audio is the authority, not the plan.

## Subject selection

The reference works because it explains a real tool with a real repo, and the author had
read the source rather than the README. That is not a stylistic preference. An explainer
that is wrong about the mechanism is worse than no explainer, because this audience
checks.

Do not script a subject you have not read the code for.
