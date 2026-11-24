---
slug: rule-4
title: "Rule 4 deductions explained: what a withdrawn horse takes off your winnings"
page: https://wagerobserver.com/uk/tools/rule-4-calculator/
market: uk
order: 6
status: compliance-approved
---

# Rule 4 deductions explained: what a withdrawn horse takes off your winnings

Written on 24 Nov 2026 from /uk/tools/rule-4-calculator/. For Cheltenham (March 2027): live by the end of February. What appears on screen is in `data/rule-4.json`.

| # | Visual | Narration |
|---|---|---|
| 1 | title | When a horse is withdrawn after you've bet, the bookmaker can take a Rule 4 deduction from your winnings. Here's how much, and why. |
| 2 | lines | A late withdrawal gives the rest of the field a better chance, so the odds you took are now bigger than they should be. Rule 4 evens that out with a deduction from the winnings of bets placed before the withdrawal. |
| 3 | slips | You bet ten pounds to win at five to one. Then a horse priced at three to one is withdrawn: that's twenty-five pence in the pound. Your fifty pounds of winnings become thirty-seven pounds fifty, so the bet returns forty-seven pounds fifty instead of sixty. |
| 4 | table | The shorter the withdrawn horse's price, the bigger the deduction. Evens takes forty-five pence. Three to one, twenty-five pence. Six to one, ten pence. Longer than fourteen to one, nothing. |
| 5 | lines | If a six to one runner comes out as well, the deductions add up: thirty-five pence, and the bet returns forty-two pounds fifty. They never go above ninety pence in the pound. And Rule 4 only touches your winnings: your stake comes back in full. |
| 6 | checklist | Starting price bets are usually not reduced, unless the horse comes out too late to form a new market. Each-way bets lose the same share on both parts. |
| 7 | end | Work out any deduction with our free Rule 4 calculator at Wager Observer. Gambling is for over-eighteens. If it stops being fun, the National Gambling Helpline is free on oh eight oh eight, eight oh two oh, one three three. |

## Figures checked against the page (24 Nov 2026)

From /uk/tools/rule-4-calculator/ and `RULE4_BANDS` in the site's `src/lib/odds.ts` (Tattersalls' Rules, Rule 4(c)):

- £10 to win at 5/1: £50 winnings, £60 back.
- A 3/1 runner withdrawn (band 12/5 to 3/1): 25p in the £. £50 × 0.75 = £37.50; the bet returns £47.50.
- A 6/1 runner as well (band 6/1 to 9/1): 10p; together 35p. £50 × 0.65 = £32.50; returns £42.50.
- Evens to 6/5: 45p. Longer than 14/1: no deduction. Most 90p in the £ (`RULE4_MAX`); the full table runs from 1/9 or shorter (90p) to 10/1–14/1 (5p).
- Only winnings are reduced, never the stake; starting price bets usually aren't, unless the runner comes out too late for a new market; each-way bets lose the same share on both parts (all from the page and its FAQ).
- Left out on purpose: the page's note that some bookmakers skip the 5p band.

## Description

> When a horse is withdrawn after you've placed your bet, bookmakers take a Rule 4 deduction from your winnings. This video works through £10 at 5/1 with one and then two withdrawals, shows some of the deduction bands, and explains what Rule 4 never touches.
>
> Rule 4 calculator and full deductions table: https://wagerobserver.com/uk/tools/rule-4-calculator/
>
> 18+. Educational content, not betting advice. If gambling stops being fun: National Gambling Helpline 0808 8020 133 (free, 24/7) · GAMSTOP: https://www.gamstop.co.uk
>
> WagerObserver is an independent guide to licensed betting sites; some links on our site earn us a commission: https://wagerobserver.com/affiliate-disclosure/
> Narration: synthetic voice.

## Compliance (wo-compliance-check, 24 Nov 2026)

See `compliance.md`.
