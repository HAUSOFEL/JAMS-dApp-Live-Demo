import { describe, expect, test } from "bun:test"
import { applyBracketVote, initialBrackets } from "./brackets"

const bracket = initialBrackets[0]
if (!bracket) throw new Error("Missing sample bracket")

describe("shared bracket progression", () => {
  test("winner advances to the semifinal and next ready battle goes live", () => {
    const next = applyBracketVote(bracket, "bboy-q3", "red")
    expect(next.matches.find(m => m.id === "bboy-s2")?.red?.id).toBe("to")
    expect(next.matches.find(m => m.id === "bboy-q4")?.status).toBe("live")
    expect(bracket.matches.find(m => m.id === "bboy-q3")?.status).toBe("live")
  })
  test("blue decision advances the blue competitor", () => {
    const next = applyBracketVote(bracket, "bboy-q3", "blue")
    expect(next.matches.find(m => m.id === "bboy-s2")?.red?.id).toBe("me")
  })
  test("tie keeps the match live without advancing either competitor", () => {
    const next = applyBracketVote(bracket, "bboy-q3", "tie")
    expect(next.matches.find(m => m.id === "bboy-q3")?.extraRound).toBe(true)
    expect(next.matches.find(m => m.id === "bboy-q3")?.winnerId).toBeUndefined()
    expect(next.matches.find(m => m.id === "bboy-s2")?.red).toBeUndefined()
  })
  test("completed matches cannot be judged again", () => {
    expect(applyBracketVote(bracket, "bboy-q1", "blue")).toBe(bracket)
  })
  test("final completion produces a champion and no live battles", () => {
    let next = bracket
    for (let i = 0; i < 5; i++) {
      const live = next.matches.find(m => m.status === "live")
      if (!live) throw new Error("Expected live battle")
      next = applyBracketVote(next, live.id, "red")
    }
    expect(next.matches.find(m => m.roundId === "finals")?.winnerId).toBe("kwb")
    expect(next.matches.filter(m => m.status !== "completed")).toHaveLength(0)
  })
})