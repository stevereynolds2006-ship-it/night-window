# Night Window

Your Rare Friend pulled the graveyard shift at an interdimensional lost-and-found. Buy a claim ticket, rummage the overnight bin, and decide whether to keep whatever fell out of another timeline or redeem it for simulated $RAREFRIENDS.

**Builder:** Sharp ([@Sharpbigred](https://x.com/Sharpbigred))  
**Category:** Character Spotlight  
**SDK:** FriendSDK v0.1.2

This is the game source only. The FriendSDK runtime supplies wallet connection, owned-Friend selection, the 960×640 sandbox, and the simulated ledger.

## Play on your computer (or phone on the same Wi-Fi)

You need Node.js 22+, Git, and a browser wallet on **Robinhood mainnet (chain 4663)** holding a hardwired Rare Friends Generations NFT (generation ≥ 1). Preview play does not spend real RF and does not need a signature.

```sh
git clone https://github.com/spokesz/friendsdk.git
cd friendsdk
git clone https://github.com/stevereynolds2006-ship-it/night-window.git games/night-window-src
cp -R games/night-window-src/game/. games/night-window/
npm ci
npm run dev:game -- games/night-window
```

Open the printed URL, usually `http://localhost:4173`.

To test on a phone on the same network:

```sh
npm run dev:game -- games/night-window --host 0.0.0.0 --port 4173
```

Then open `http://YOUR-COMPUTER-LAN-IP:4173` on the phone. Use a mobile wallet that can hit Robinhood mainnet.

## How to play

1. Connect wallet → select your Friend. That Friend is the night clerk.
2. Walk with WASD / arrows, or tap a destination.
3. **Ticket window** — buy one simulated claim ticket for 1 RF.
4. **Overnight bin** — rummage. One ticket, one artifact.
5. Keep it in the locker or redeem its fixed value.
6. Read the PA ticker and the **Log**. Settings have mute and reduced motion.

## Economy (all simulated)

| Left behind | Chance | Value |
| --- | --- | --- |
| Sock that knows your name | 18% | 0.20 RF |
| Slightly used Thursday | 20% | 0.35 RF |
| Polite memo from gravity | 16% | 0.50 RF |
| Expired coupon for one consequence | 14% | 0.70 RF |
| Unionized pigeon | 11% | 1.00 RF |
| Bottled leftovers of an idea | 9% | 1.50 RF |
| Pocket weather | 7% | 2.50 RF |
| The last good idea you almost had | 3.5% | 4.00 RF |
| A spare ending | 1.5% | 6.00 RF |

Ticket price is 1 RF. Expected reward is 0.934 RF. Every purchased or pending ticket reserves 6 RF (the top prize). Kept artifacts reserve their printed value with no expiry.

## Files

| Path | What it is |
| --- | --- |
| `game/index.tsx` | Walkable courtyard, ticket window, bin, locker, log |
| `game/game.json` | Price, weights, rewards |
| `game/style.css` | Night-shift look |
| `game/host.css` | 960×640 reference frame |
| `game/README.md` | Rules in the SDK game-directory format |

## Checks

Validated with FriendSDK `check-games`: expected reward `934000000000000000`, maximum prize `6000000000000000000`.

Vibeathon submission is not opened yet. Play it first, then ask to submit and I will open the PR on [rarefriends-vibeathon](https://github.com/spokesz/rarefriends-vibeathon).
