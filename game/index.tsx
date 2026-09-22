"use client";

import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "@rarefriends/friendsdk/runtime";
import { GameWorld, type GameWorldInteraction } from "@rarefriends/friendsdk/world-view";
import { getWorldPreset, validateWorld } from "@rarefriends/friendsdk/world";
import { GameMenu } from "@rarefriends/friendsdk/frame";
import { formatGameAmount } from "@rarefriends/friendsdk/ui";
import { maximumPrize, type GameSnapshot, type GamePlay } from "@rarefriends/friendsdk/game";
import { createFriendSoundKit, type FriendSoundKit, type FriendSoundCue } from "@rarefriends/friendsdk/sounds";
import "@rarefriends/friendsdk/frame.css";
import "@rarefriends/friendsdk/world-view.css";
import "./style.css";

const station = getWorldPreset("02-circuit-courtyard-complete");
const world = validateWorld({
  ...station,
  props: [
    ...station.props,
    { type: "terminal", x: 236, y: 168, scale: 1.35 },
    { type: "crate", x: 392, y: 248, scale: 1.45 },
  ],
  actors: [],
});
const spawn = [288, 210] as const;
const interactions: readonly GameWorldInteraction[] = [
  { id: "buy", label: "Ticket window", position: [236, 168], reach: 92, labelOffset: -176 },
  { id: "open", label: "Overnight bin", position: [392, 248], reach: 92, labelOffset: -128 },
];

type Menu = "buy" | "open" | "inventory" | "settings" | "reward" | "log" | null;

const rf = (value: bigint) => `${formatGameAmount(value, 18)} RF`;

const FLAVOR: Record<string, { glyph: string; line: string }> = {
  "Sock that knows your name": {
    glyph: "🧦",
    line: "It mouthed your government name and then asked for a dryer.",
  },
  "Slightly used Thursday": {
    glyph: "📅",
    line: "Still warm. Someone clearly started it and got distracted.",
  },
  "Polite memo from gravity": {
    glyph: "⬇️",
    line: "Subject: Please stop jumping. Body: thank you in advance.",
  },
  "Expired coupon for one consequence": {
    glyph: "🎟️",
    line: "Fine print: consequence may arrive before or after the joke.",
  },
  "Unionized pigeon": {
    glyph: "🐦",
    line: "It will not fly unpaid. Breaks are mandatory. Coos are billable.",
  },
  "Bottled leftovers of an idea": {
    glyph: "🧪",
    line: "Shake it and you almost remember what you were going to say.",
  },
  "Pocket weather": {
    glyph: "🌧️",
    line: "A personal squall. Keep upright. Do not open indoors. Or do.",
  },
  "The last good idea you almost had": {
    glyph: "💡",
    line: "It recognizes you. It is disappointed, but professional about it.",
  },
  "A spare ending": {
    glyph: "🎬",
    line: "Not the original ending. The one they cut because it was too honest.",
  },
};

const ANNOUNCEMENTS = [
  "PA: a Tuesday arrived without its owner. If this is yours, bring ID and a plausible story.",
  "PA: please do not feed the weather. It is on a diet of unresolved plans.",
  "PA: gravity called. It wants its memo back and also your posture.",
  "PA: the pigeon union is observing this shift. Tips in crumbs are strike-adjacent.",
  "PA: lost child reported in aisle ∞. The child is a concept. The concept is hungry.",
  "PA: someone returned a plot hole. It is leaking into the floor drain.",
  "PA: night window is not liable for objects that remember you first.",
  "PA: if your ending feels spare, check the bin. Do not check the bin twice.",
  "PA: all times are local to a timeline we no longer staff.",
  "PA: the sock drawer in sector 7 filed a missing-persons report.",
];

/** Graveyard-shift lost-and-found. Runtime supplies the verified Friend and preview client. */
export default function NightWindow({ friendId, client, paused }: GameComponentProps) {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [menu, setMenu] = useState<Menu>(null);
  const [result, setResult] = useState<GamePlay | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [announcement, setAnnouncement] = useState(ANNOUNCEMENTS[0]);
  const sound = useRef<FriendSoundKit | null>(null);
  const locked = useRef(false);
  const epoch = useRef(0);
  const definition = client.definition;

  useEffect(() => {
    const version = ++epoch.current;
    sound.current = createFriendSoundKit({ muted: true });
    setSnapshot(null); setMenu(null); setResult(null); setError(""); setMessage("");
    setBusy(false); setMuted(true); locked.current = false;
    void client.read().then(value => { if (version === epoch.current) setSnapshot(value); }).catch(cause => {
      if (version === epoch.current) setError(cause instanceof Error ? cause.message : "Could not load the preview.");
    });
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => {
      epoch.current++;
      sound.current?.dispose();
      sound.current = null;
      preference.removeEventListener("change", update);
    };
  }, [client, friendId]);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = window.setInterval(() => {
      setAnnouncement(ANNOUNCEMENTS[Math.floor(Math.random() * ANNOUNCEMENTS.length)]);
    }, 7000);
    return () => window.clearInterval(id);
  }, [paused, reducedMotion]);

  async function act(work: () => Promise<void>, cue?: FriendSoundCue, after?: () => void) {
    if (locked.current || paused) return;
    const version = epoch.current;
    locked.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    void sound.current?.unlock();
    try {
      await work();
      const value = await client.read();
      if (version === epoch.current) {
        setSnapshot(value);
        if (cue) sound.current?.play(cue);
        after?.();
      }
    } catch (cause) {
      if (version === epoch.current) setError(cause instanceof Error ? cause.message : "The preview action failed.");
    } finally {
      if (version === epoch.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  }

  const navigate = (next: Menu) => {
    if (!busy && !paused) {
      setMenu(next);
      setError("");
      setMessage("");
    }
  };

  const feedback = (
    <p role={error ? "alert" : "status"}>
      {error || message || (busy ? "Waiting for preview confirmation…" : "Simulated RF and outcomes. Night window is not a real desk.")}
    </p>
  );

  if (!snapshot) {
    return (
      <div className="nw-loading" role={error ? "alert" : "status"}>
        <span className="nw-shift">Graveyard shift</span>
        {error || "Opening the night window…"}
        {error && <button type="button" disabled={busy || paused} onClick={() => void act(async () => {})}>Retry</button>}
      </div>
    );
  }
  if (snapshot.friendId !== friendId) {
    return <p role="alert">This game session does not match the selected Friend.</p>;
  }

  const maxPrize = maximumPrize(definition);
  const canBuy = snapshot.rfBalance >= definition.price && snapshot.freeStake >= maxPrize && snapshot.freeStake + definition.price >= maxPrize;
  const pending = snapshot.plays.find(play => play.outcomeId === null);
  const outcome = result?.outcomeId ? definition.outcomes[result.outcomeId - 1] : null;
  const flavor = outcome ? FLAVOR[outcome.name] : undefined;
  const count = snapshot.inventory.reduce((total, amount) => total + amount, 0n);
  const rummage = () => act(async () => {
    const version = epoch.current;
    const play = pending ?? (await client.play(1n))[0];
    const settled = await client.settle(play.id);
    if (version === epoch.current) {
      setResult(settled);
      setMenu("reward");
    }
  }, "reveal-common");

  return (
    <section className="nw-game" aria-label={definition.name} aria-busy={busy}>
      <div className="nw-world" inert={Boolean(menu) || paused || undefined}>
        <GameWorld
          world={world}
          spawn={spawn}
          interactions={interactions}
          friendId={friendId}
          paused={Boolean(menu) || paused}
          reducedMotion={reducedMotion}
          onInteract={id => navigate(id === "buy" ? "buy" : "open")}
        />
        <div className="nw-hud">
          <span>PREVIEW · {rf(snapshot.rfBalance)} · {snapshot.consumables.toString()} tickets</span>
          <button type="button" onClick={() => navigate("inventory")}>Locker · {count.toString()}</button>
          <button type="button" onClick={() => navigate("log")}>Log</button>
          <button type="button" onClick={() => navigate("settings")}>Settings</button>
        </div>
        <div className="nw-ticker" aria-live="polite"><b>NIGHT WINDOW</b>{announcement}</div>
        <p className="nw-hint">
          <span className="nw-desktop-hint">WASD / arrows to walk · tap a destination · E at a station</span>
          <span className="nw-mobile-hint">Tap to walk · tap a station when you are close</span>
        </p>
      </div>
      {menu && (
        <GameMenu
          title={
            menu === "buy" ? "Ticket window"
              : menu === "open" ? "Overnight bin"
                : menu === "reward" ? "Something fell out"
                  : menu === "inventory" ? "Staff locker"
                    : menu === "log" ? "Shift log"
                      : "Settings"
          }
          onClose={busy ? undefined : () => navigate(null)}
        >
          {menu === "buy" ? <>
            <p>One claim ticket costs {rf(definition.price)} and authorizes one rummage of the overnight bin.</p>
            <p className="nw-blurb">Your Rare Friend is the clerk. The window does not explain itself. Neither should you.</p>
            <table>
              <thead><tr><th>Left behind</th><th>Chance</th><th>Value</th></tr></thead>
              <tbody>
                {definition.outcomes.map(item => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.chanceBps / 100}%</td>
                    <td>{rf(item.reward)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="rf-frame-primary"
              disabled={!canBuy || busy || paused}
              onClick={() => void act(() => client.buy(1n), "purchase", () => setMessage("One simulated ticket stamped. Do not lose it. It already knows where you live."))}
            >
              Buy one ticket · {rf(definition.price)}
            </button>
            {!canBuy && (
              <p>{snapshot.rfBalance < definition.price
                ? "Not enough simulated RF for a ticket."
                : "New tickets are paused until there is enough free backing for the rarest ending."}</p>
            )}
            <p>Every ticket reserves {rf(maxPrize)}. Unused tickets stay with this Friend.</p>
          </> : menu === "open" ? <>
            <p>{snapshot.consumables.toString()} tickets ready. One rummage consumes one ticket.</p>
            <p className="nw-blurb">Reach into the bin. Do not make eye contact with whatever reaches back.</p>
            <button
              type="button"
              className="rf-frame-primary"
              disabled={busy || paused || !pending && snapshot.consumables === 0n}
              onClick={() => void rummage()}
            >
              {pending ? "Finish pending rummage" : "Rummage the bin"}
            </button>
          </> : menu === "reward" && outcome ? (
            <div className="nw-reward">
              <div className="nw-glyph" aria-hidden="true">{flavor?.glyph ?? "◇"}</div>
              <h3>{outcome.name}</h3>
              <p>{rf(outcome.reward)} · {outcome.chanceBps / 100}% chance</p>
              <p className="nw-blurb">{flavor?.line}</p>
              <p>This simulated artifact is already in the Friend's locker.</p>
              <button type="button" disabled={busy || paused} onClick={() => navigate(null)}>Keep it on the shelf</button>
              {outcome.reward > 0n && (
                <button
                  type="button"
                  disabled={busy || paused}
                  onClick={() => void act(() => client.redeem(result!.outcomeId!, 1n), "reward", () => setMenu("inventory"))}
                >
                  Redeem · {rf(outcome.reward)}
                </button>
              )}
            </div>
          ) : menu === "inventory" ? <>
            <p>Kept artifacts retain a fixed simulated value with no expiry.</p>
            {definition.outcomes.map((item, index) => (
              <div className="nw-item" key={item.name}>
                <span>
                  <strong>{FLAVOR[item.name]?.glyph ?? "·"} {item.name}</strong>
                  <small>{snapshot.inventory[index].toString()} owned · {rf(item.reward)} · {FLAVOR[item.name]?.line}</small>
                </span>
                <button
                  type="button"
                  disabled={busy || paused || snapshot.inventory[index] === 0n || item.reward === 0n}
                  onClick={() => void act(() => client.redeem(index + 1, 1n), "reward")}
                >
                  Redeem
                </button>
              </div>
            ))}
          </> : menu === "log" ? <>
            <p className="nw-shift">Clerk on duty: Friend #{friendId.toString()}</p>
            <p>The night window sits between a circuit courtyard and several unfinished timelines. Objects fall in. Tickets go out. Nobody files a correct form.</p>
            <p className="nw-blurb">Current announcement: {announcement}</p>
            <ul className="nw-blurb">
              {ANNOUNCEMENTS.slice(0, 6).map(line => <li key={line}>{line.replace(/^PA:\s*/, "")}</li>)}
            </ul>
            <p>All balances in this preview are simulated. The Friend on screen is your verified Generations NFT.</p>
          </> : menu === "settings" ? <>
            <button
              type="button"
              aria-pressed={!muted}
              onClick={() => {
                const next = !muted;
                setMuted(next);
                sound.current?.setMuted(next);
                if (!next) void sound.current?.unlock();
              }}
            >
              {muted ? "Sound off" : "Sound on"}
            </button>
            <label>
              <input type="checkbox" checked={reducedMotion} onChange={event => setReducedMotion(event.target.checked)} />
              Reduce motion
            </label>
            <p>All economy actions are simulated. Reloading resets this preview. Wallet connection and ownership verification are provided by the SDK.</p>
          </> : null}
          {feedback}
        </GameMenu>
      )}
    </section>
  );
}
