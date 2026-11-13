import { describe, test } from "node:test"
import assert from "node:assert/strict"
import { canViewLists, followerIds, followingIds, sampleFollowers, sampleFollowing, toggleFollowing } from "./follow-graph"
import { validateProfileEdits } from "./stores"
describe("follow list privacy", () => {
  test("owner can always see own lists", () => assert.equal(canViewLists("me", "me", true), true))
  test("others cannot see private lists", () => assert.equal(canViewLists("shadow", "me", true), false))
  test("others can see public lists", () => assert.equal(canViewLists("kwb", "me", false), true))
  test("privacy survives saved profile validation", () => assert.equal(validateProfileEdits({ privateFollowLists: true })?.privateFollowLists, true))
  test("privacy can be switched off", () => assert.equal(validateProfileEdits({ privateFollowLists: false })?.privateFollowLists, false))
})

describe("sample connection actions", () => {
  test("unfollow removes a sample following and follow adds it back", () => {
    const original = sampleFollowing("me")
    const id = original[0]
    assert.ok(id)
    const next = toggleFollowing(original, id)
    assert.equal(followingIds("me", next, []).includes(id), false)
    assert.equal(followerIds(id, next, []).includes("me"), false)
    assert.equal(toggleFollowing(next, id).includes(id), true)
  })
  test("removing a follower updates both sides of the relationship", () => {
    const id = sampleFollowers("me")[0]
    assert.ok(id)
    assert.equal(followerIds("me", [], []).includes(id), true)
    assert.equal(followerIds("me", [], [id]).includes(id), false)
    assert.equal(followingIds(id, [], [id]).includes("me"), false)
  })
})
