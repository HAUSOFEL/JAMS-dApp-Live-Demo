import { describe, expect, it } from "vitest"
import { canViewLists } from "./follow-graph"
describe("follow list privacy", () => {
  it("owner can always see own lists", () => expect(canViewLists("me", "me", true)).toBe(true))
  it("others cannot see private lists", () => expect(canViewLists("shadow", "me", true)).toBe(false))
  it("others can see public lists", () => expect(canViewLists("kwb", "me", false)).toBe(true))
})
