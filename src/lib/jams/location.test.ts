import { describe, test } from "node:test"
import assert from "node:assert/strict"
import { approximateHubFromTimeZone, getHub, nearestHub, nearestJamHub, parseSavedLocation } from "./location"

describe("location discovery", () => {
  test("precise coordinates resolve to the closest sample city", () => {
    assert.equal(nearestHub(43.4643, -80.5204).id, "kw")
    assert.equal(nearestHub(48.8566, 2.3522).id, "paris")
  })
  test("approximate detection uses time zone and never invents an unknown city", () => {
    assert.equal(approximateHubFromTimeZone("America/Toronto")?.id, "toronto")
    assert.equal(approximateHubFromTimeZone("Australia/Sydney"), null)
  })
  test("a city without samples resolves to the explicitly named nearest sample scene", () => {
    const result = nearestJamHub(getHub("toronto"))
    assert.equal(result.hub.id, "kw")
    assert.equal(result.km, 94)
  })
  test("saved precise choices keep the city but not GPS coordinates", () => {
    assert.deepEqual(parseSavedLocation({ hubId: "kw", accuracy: "precise", lat: 43.4643, lng: -80.5204 }), { hubId: "kw", accuracy: "precise" })
  })
  test("invalid stored choices cannot become locations", () => {
    assert.equal(parseSavedLocation({ hubId: "unknown", accuracy: "manual" }), null)
    assert.equal(parseSavedLocation({ hubId: "kw", accuracy: "invalid" }), null)
    assert.equal(parseSavedLocation(null), null)
  })
})