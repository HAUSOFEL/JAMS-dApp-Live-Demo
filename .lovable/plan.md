# Making JAMS feel familiar to dancers (less crypto, more app)

Right now the app speaks in wallet/blockchain language on almost every screen: sign-in says "Connect via Privy / Solana Wallet", passes are "minted", tips are "SOL", and a whole tab is called "Blinks / Solana Actions". For a dancer who just wants to find a jam, that reads as friction. The plan below keeps every existing feature and only changes how it's presented, plus adds a short welcome flow.

## 1. Sign-in that looks like every other app

- Lead with Apple, Google, and a new "Continue with email" option.
- Move the wallet option to a small "Advanced: use my own wallet" link at the bottom.
- Replace "Successfully signed in via Privy" with "Welcome to JAMS".
- Sign-in silently creates the account's wallet in the background; no mention of it up front.

## 2. First-run welcome (3 quick steps)

Shown once after the first sign-in:
1. Pick your dance styles (breaking, house, popping, hip hop, all-styles).
2. Set your city, so the map and feed open near them.
3. Choose a display name and avatar.

Ends on "You're in" with a shortcut to the nearest jam. Skippable, and re-openable from the profile.

## 3. Plain-language everywhere

| Now | Change to |
| --- | --- |
| Claim Event Pass / minted to wallet | Get my ticket / Saved to My Tickets |
| Blinks & Solana Actions tab | Share & Tickets |
| Blink Action URL | Share link (with Copy / Share buttons) |
| Refresh On-Chain State | Refresh |
| Send 0.25 SOL Tip | Send a tip — with dollar amounts ($1 / $3 / $5) shown first |
| Connected Wallet card | My Account — balance in dollars, address hidden behind "Show details" |
| cNFT passes | My Tickets |

Crypto terms stay available, just tucked under a "Show technical details" toggle for people who want them.

## 4. Tickets in an obvious place

Add a "My Tickets" section to the profile so a claimed pass and its QR code can be found again without going back to the map. Includes event name, date, venue, QR, and Add to Calendar.

## 5. Small comfort touches

- Empty states with one clear next action instead of blank panels.
- A short "New here?" card on Home linking to the welcome steps.
- Confirmations phrased as outcomes ("You're on the list for KWC Practice Hub") instead of transaction language.

## Technical notes

- New: `src/components/jams/onboarding/welcome-flow.tsx`, onboarding state + `dancerProfile` (styles, city, display name) in `jams-context.tsx`, persisted to `localStorage` for now.
- Copy edits in `login-view.tsx`, `blinks-view.tsx`, `modals.tsx`, `map/event-pass-claim.tsx`, `notification-hub.tsx`.
- New "My Tickets" block in `views/profile-view.tsx`, backed by a `claimedPasses` array in the Jams context; tickets currently held client-side, matching the app's existing mock data layer.
- Rename the Blinks tab label and headings only — the component/route names stay as-is to avoid churn.
- No backend work in this pass; if you want tickets and profiles to survive a reinstall or sync across devices, that's a follow-up with Lovable Cloud.
