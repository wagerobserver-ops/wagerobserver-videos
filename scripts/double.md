---
slug: double
title: "Double bets explained: doubles, each-way doubles and two singles"
page: https://wagerobserver.com/uk/guides/double/
market: uk
order: 8
status: compliance-approved
---

# Double bets explained: doubles, each-way doubles and two singles

Written on 24 Nov 2026 from /uk/guides/double/ (published 20 Nov 2026, issue #239). What appears on screen is in `data/double.json`.

| # | Visual | Narration |
|---|---|---|
| 1 | title | A double is one bet on two selections, and both have to win. It's the smallest accumulator, and the each-way version is two bets, not one. |
| 2 | lines | Here's five pounds on a six to four and a two to one: the return from the first rides on the second. Five, times two and a half, times three, is thirty-seven pounds fifty. |
| 3 | table | The same five pounds as two singles of two pounds fifty would return thirteen pounds seventy-five if both won. But if only one wins, the singles still pay something. The double pays nothing. |
| 4 | slips | Each way, it's a win double and a place double: five pounds each way costs ten. At a fifth of the odds, both placed returns nine pounds ten, less than you paid. At eight to one and ten to one, the same result returns thirty-nine pounds. |
| 5 | lines | If one selection is a non-runner, it usually counts at odds of one, so the double becomes a single on the other: twelve pounds fifty. Some boosted multiples are voided instead, so check the rules where you bet. |
| 6 | end | Work out any double or each-way double with our free calculator at Wager Observer. Gambling is for over-eighteens. If it stops being fun, the National Gambling Helpline is free on oh eight oh eight, eight oh two oh, one three three. |

## Figures checked against the page (24 Nov 2026)

Settled with the site's own code (`settle()` with `betType('doubles')` in `src/lib/odds.ts`, run on 24 Nov 2026), as on the page:

- £5 double at 6/4 (2.50) and 2/1 (3.00): £37.50, stake included.
- The same £5 as two £2.50 singles: £13.75 if both win; £6.25 if only the 6/4; £7.50 if only the 2/1.
- £5 each way (£10), 1/5 the odds: place odds 1.30 and 1.40; both placed, the place double returns £9.10. At 8/1 and 10/1 (place odds 2.60 and 3.00): £39.00.
- A non-runner counts at 1.0: £5 × 2.50 = £12.50. Boosted multiples can be voided instead (the page's FAQ).

## Description

> A double is one bet on two selections: both have to win, and the odds multiply. This video works through a £5 double, compares it with two singles, shows how an each-way double pays (and when it returns less than you paid), and what a non-runner does. Prices are illustrative.
>
> Double guide: https://wagerobserver.com/uk/guides/double/
> Double calculator: https://wagerobserver.com/uk/tools/double-calculator/
> The Small Print, our newsletter every two weeks: https://wagerobserver.com/newsletter/
>
> 18+. Educational content, not betting advice. If gambling stops being fun: National Gambling Helpline 0808 8020 133 (free, 24/7) · GAMSTOP: https://www.gamstop.co.uk
>
> WagerObserver is an independent guide to licensed betting sites; some links on our site earn us a commission: https://wagerobserver.com/affiliate-disclosure/
> Narration: synthetic voice.

## Compliance (wo-compliance-check, 24 Nov 2026)

See `compliance.md`.
