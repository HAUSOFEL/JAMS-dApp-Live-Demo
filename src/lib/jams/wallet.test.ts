import { test } from "node:test"
import assert from "node:assert/strict"
import { generateWallet, parseSecret } from "./wallet"

test("exported key re-imports to the same address", () => {
  const w = generateWallet()
  assert.equal(parseSecret(w.secret).address, w.address)
})
test("rejects garbage keys", () => {
  assert.throws(() => parseSecret("abc"))
})
