# Night Window

Your Rare Friend pulled the graveyard shift at an interdimensional lost-and-found. Buy a claim ticket, rummage the overnight bin, and decide whether to keep the artifact or redeem it.

**SDK:** FriendSDK v0.1.2  
**Builder:** Sharp (@Sharpbigred)  
**Category:** Character Spotlight

## Play locally

From the FriendSDK repo root, Node.js 22+:

```sh
npm ci
npm run dev:game -- games/night-window
```

Open the printed URL (usually `http://localhost:4173`). Connect a browser wallet on Robinhood mainnet (chain 4663) that owns a hardwired Rare Friends Generations NFT, generation 1 or higher. Select that Friend. Preview play does not spend real RF or require a signature.

## How to play

- Move with WASD, arrow keys, or tap/click a destination.
- Walk to the **Ticket window**, press E or tap the prompt, and buy a simulated claim ticket (1 RF).
- Walk to the **Overnight bin** and rummage. One ticket produces one artifact.
- Keep it in the locker or redeem its fixed simulated value.
- Open **Log** for shift notes. Settings include mute and reduced motion.

## Economy (simulated)

| Rule | Exact value |
| --- | --- |
| Ticket price | 1 RF (`1000000000000000000`) |
| Sock that knows your name | 18% / 1,800 bps · 0.20 RF |
| Slightly used Thursday | 20% / 2,000 bps · 0.35 RF |
| Polite memo from gravity | 16% / 1,600 bps · 0.50 RF |
| Expired coupon for one consequence | 14% / 1,400 bps · 0.70 RF |
| Unionized pigeon | 11% / 1,100 bps · 1.00 RF |
| Bottled leftovers of an idea | 9% / 900 bps · 1.50 RF |
| Pocket weather | 7% / 700 bps · 2.50 RF |
| The last good idea you almost had | 3.5% / 350 bps · 4.00 RF |
| A spare ending | 1.5% / 150 bps · 6.00 RF |
| Expected reward | 0.934 RF per ticket |
| Consumable | One ticket produces exactly one artifact |
| Backing | Each purchased or pending ticket reserves 6 RF; kept artifacts reserve their fixed RF value |
| Redemption | Fixed value, no expiry; intended for the selected Friend's canonical wallet in a future approved integration |

All balances, purchases, rummages, artifacts and redemptions are simulated. An owned hardwired Generations NFT is still required. This component only calls the SDK preview client.

The selected Friend is the clerk on duty and uses the SDK's canonical Generations artwork. World scenery is the SDK Circuit Courtyard preset plus a ticket terminal and overnight crate.
