# Scrap2Cash NG

**Tagline:** Turn household recyclables into naira. Know the price, find a collector, book a pickup on WhatsApp, works offline.

**Track:** Theme Track, Rethinking Waste

**Links:** GitHub: `<add repo URL>` · Live demo: `<add deployed URL>` · Video: `<add YouTube/Vimeo URL>`

---

## The waste problem we targeted (Theme Track paragraph)

In Nigerian cities, recyclable household waste (PET bottles, aluminium cans, cartons, scrap metal and small e-waste) is thrown out with general rubbish and ends up in drains, dumps and open burning, even though recyclers publicly pay for it: on 2026 price lists clear PET bottles fetch ₦200–₦300/kg and drink cans up to ₦1,800/kg. The blocker is information, not technology. Households don't know their waste has a price, how much, who buys it near them, or how to prepare it so they aren't short-changed. Scrap2Cash NG closes that gap at the point of disposal. **How we'd measure it:** (1) kilograms logged as handed over per active household per month (the in-app tracker records this, and a pilot can export it as CSV); (2) the share of generated pickup requests that collectors confirm, from WhatsApp follow-ups with 3–5 partner collectors; (3) the gap between our estimate and the price actually paid, which tells us whether the price table is honest; and (4) for a pilot street or estate in Port Harcourt, a before/after count of bottles and cans found in its drains on a fixed weekly route.

## Inspiration

> _Yusuf: make this paragraph yours. Swap in a real moment from your own street before you submit._

In Port Harcourt, as in Lagos and Abuja, you can see the paradox after any heavy rain. Gutters fill with pure-water bottles, malt cans and nylon, while "iron condemn" buyers walk the streets and recycling companies publish what they pay per kilo. The money is already in the system. Most households just don't know it, or don't trust the price they're offered. I wanted a tool my neighbours could use on a cheap Android phone with patchy data, one that answers three questions: *what is this worth, who will take it, and how do I reach them?*

## What it does

- **Value estimator**: pick from 14 materials (clear and coloured PET, hard plastics, sachets/nylon, cartons, paper, cans, aluminium scrap, iron, copper, brass, e-waste, glass). Enter kilograms, or just count bottles and cans. You get a low / typical / high naira range, and one tap shows every quote behind it with its source.
- **Collectors directory**: 17 real collectors and drop-off points in Port Harcourt, Lagos and Abuja (Fifthseed, Wecyclers, RecyclePoints, Westman, V-Martins, Chanja Datti, Ecobarter, EPRON e-waste centres and more). Filter by material, sort by distance, then Call, WhatsApp or get Directions. Each entry is labelled by how far you can trust it: from the collector's own website, from the official EPRON list, or demo data to confirm.
- **WhatsApp pickup request**: choose a collector that takes your items. The app writes a clear message (items, kilograms, estimate, area, landmark, best time) and opens WhatsApp with it. You still press send yourself.
- **Impact tracker**: log what you handed over and what you were paid. See kilograms diverted, CO₂e avoided, naira earned and bottles/cans kept out of drains, with a per-material chart and CSV export. All of it stays on the phone.
- **Offline "what bin / what value?" assistant**: type "30 pure water bottles", "2kg malt cans", "condemn iron", "old phone charger" or "used diapers". A rules engine that understands English plus Nigerian Pidgin and market terms returns the right bin, prep tips, safety warnings (don't burn cable insulation, tape swollen batteries) and a value range. It needs no network and no API key.

## How we built it

- **Vite + React 18 + TypeScript (strict) + Tailwind CSS v4**, no backend and no secrets. The production build is about 65 kB of gzipped JavaScript with system fonts and no image downloads, so it loads on 3G and low-end Android phones.
- **A transparent price model.** `materials.ts` stores every raw quote with its source id. The app derives low = lowest quote, high = highest quote, typical = median of the quotes' mid-points. Quotes come from Fifthseed's Port Harcourt price list (24 Oct 2026), Westman Recycle's live rates, Ecobarter, V-Martins, Jhonks, and Nairametrics and Technext reporting.
- **Carbon from EPA WARM v16.** CO₂e saved per kg = (landfill factor − recycling factor) × 1.102311. We used proxies where WARM has no exact match (Mixed Plastics for sachets, Aluminum Ingot for scrap aluminium) and say so in the UI.
- **The offline assistant** is an ordered rules table with include/exclude keywords (so "pure water *bottles*" becomes PET while "pure water *sachets*" become nylon) and a quantity parser for kg, grams and item counts.
- **Offline-first**: a hand-written service worker caches the app shell, and `localStorage` holds the bag, the impact log and the pickup details, wrapped so private mode or a full storage quota can never crash the app.
- **WhatsApp** through `wa.me` deep links with URL-encoded prefilled text, so there is no WhatsApp Business API, cost or approval process.
- **Quality**: 18 Vitest unit tests (pricing maths, the CO₂ factors checked against WARM's published worked example, assistant rules, Nigerian phone normalisation, data integrity), plus mobile screenshots captured with headless Chromium via Playwright.
- **AI assistance (disclosure):** I built this with substantial help from an AI assistant (Hark), which helped research sources, write code and draft these docs. I directed and reviewed the work. Every price, collector and carbon figure comes from a cited public source. The app itself uses no AI at runtime.

## Challenges we ran into

- **Prices are messy.** The same kilogram of cans is quoted at ₦360 in Abuja and ₦1,800 in Port Harcourt. Instead of inventing one "correct" number, we show the full band and the median, and let users open every quote.
- **Trustworthy collector data.** Many recyclers only appear on Instagram or LinkedIn. We labelled every row by evidence level rather than presenting unverified phone numbers as fact.
- **Carbon factors for Nigeria.** There is no Nigerian equivalent of WARM, so we used US factors, chose proxies carefully and stated the limitation in the app.
- **Language.** "Pure water", "condemn" and "rubber" mean specific things in Nigeria. The assistant has to handle them, and must not mistake "pure water bottles" for sachets.

## Accomplishments that we're proud of

- A complete, working flow in one small static app: "I have bottles" → estimate → collector → WhatsApp message → logged impact.
- Real, dated Nigerian prices, including a Port Harcourt buyer's October 2026 price list, instead of generic global figures.
- Works in airplane mode after the first visit, fits low-end phones, and needs no account.
- Every number in the app can be traced to a source.

## What we learned

- For waste, the missing piece is often a **market-information** problem, not a sorting-technology problem.
- Showing a range plus its sources builds more trust than a single precise-looking number.
- Designing for a low-end Android phone with a weak signal forces good engineering: small bundles, no web fonts, offline by default.

## What's next

- **Pilot in Port Harcourt** with 2–3 collectors such as Fifthseed: confirm phone numbers, agree a shared price feed, and measure the confirmation rate of pickup requests.
- **Live prices**: let collectors update their own rates (a simple signed JSON feed or a Google Sheet, like Fifthseed already publishes).
- **Pidgin, Yoruba, Igbo and Hausa UI**, plus voice input for the assistant.
- **On-device image recognition** (a small TF.js model) so users can snap an item instead of typing.
- **Estate and school mode**: pooled bags, leaderboards and a monthly impact report for residents' associations.
- **Verified receipts**: collectors confirm a hand-over by QR code, so impact numbers can be audited.

## Built with

`react` · `typescript` · `vite` · `tailwindcss` · `vitest` · `service-worker` · `pwa` · `localstorage` · `whatsapp` (`wa.me` deep links) · `geolocation-api` · `playwright` (screenshots) · `epa-warm` (emission factors)
