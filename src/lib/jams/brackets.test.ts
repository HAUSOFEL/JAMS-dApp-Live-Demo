import { describe, test } from "node:test"
import assert from "node:assert/strict"
import { applyBracketVote, initialBrackets } from "./brackets"

const bracket = initialBrackets[0]
if (!bracket) throw new Error("Missing sample bracket")

describe("shared bracket progression", () => {
  test("winner advances to the semifinal and next ready battle goes live", () => {
    const next = applyBracketVote(bracket, "bboy-q3", "red")
    assert.equal(next.matches.find(m => m.id === "bboy-s2")?.red?.id, "to")
    assert.equal(next.matches.find(m => m.id === "bboy-q4")?.status, "live")
    assert.equal(bracket.matches.find(m => m.id === "bboy-q3")?.status, "live")
  })
  test("blue decision advances the blue competitor", () => {
    const next = applyBracketVote(bracket, "bboy-q3", "blue")
    assert.equal(next.matches.find(m => m.id === "bboy-s2")?.red?.id, "me")
  })
  test("tie keeps the match live without advancing either competitor", () => {
    const next = applyBracketVote(bracket, "bboy-q3", "tie")
    assert.equal(next.matches.find(m => m.id === "bboy-q3")?.extraRound, true)
    assert.equal(next.matches.find(m => m.id === "bboy-q3")?.winnerId, undefined)
    assert.equal(next.matches.find(m => m.id === "bboy-s2")?.red, undefined)
  })
  test("completed matches cannot be judged again", () => {
    assert.equal(applyBracketVote(bracket, "bboy-q1", "blue"), bracket)
  })
  test("final completion produces a champion and no live battles", () => {
    let next = bracket
    for (let i = 0; i < 5; i++) {
      const live = next.matches.find(m => m.status === "live")
      if (!live) throw new Error("Expected live battle")
      next = applyBracketVote(next, live.id, "red")
    }
    assert.equal(next.matches.find(m => m.roundId === "finals")?.winnerId, "kwb")
    assert.equal(next.matches.filter(m => m.status !== "completed").length, 0)
  })
})