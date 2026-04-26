import assert from "node:assert/strict";
import test from "node:test";
import {
  WAITLIST_POSITION_OFFSET,
  calculateTieredBoostPoints,
  canAwardReferral,
  getDisplayPosition,
} from "./waitlist";

test("calculateTieredBoostPoints applies configured tiers", () => {
  assert.equal(calculateTieredBoostPoints(0), 0);
  assert.equal(calculateTieredBoostPoints(1), 1);
  assert.equal(calculateTieredBoostPoints(2), 2);
  assert.equal(calculateTieredBoostPoints(3), 4);
  assert.equal(calculateTieredBoostPoints(4), 6);
  assert.equal(calculateTieredBoostPoints(5), 11);
  assert.equal(calculateTieredBoostPoints(7), 13);
});

test("getDisplayPosition ranks by effective score with tie-breaker", () => {
  const entries = [
    { email: "a@example.com", signupOrder: 1, boostPoints: 0 },
    { email: "b@example.com", signupOrder: 2, boostPoints: 2 },
    { email: "c@example.com", signupOrder: 3, boostPoints: 0 },
  ];

  assert.equal(getDisplayPosition({ entries, email: "b@example.com" }), 1 + WAITLIST_POSITION_OFFSET);
  assert.equal(getDisplayPosition({ entries, email: "a@example.com" }), 2 + WAITLIST_POSITION_OFFSET);
  assert.equal(getDisplayPosition({ entries, email: "c@example.com" }), 3 + WAITLIST_POSITION_OFFSET);
});

test("canAwardReferral blocks duplicate signups and self-referrals", () => {
  assert.equal(
    canAwardReferral({
      isExistingSignup: true,
      inviterEmail: "inviter@example.com",
      signupEmail: "new@example.com",
    }),
    false
  );

  assert.equal(
    canAwardReferral({
      isExistingSignup: false,
      inviterEmail: "same@example.com",
      signupEmail: "same@example.com",
    }),
    false
  );

  assert.equal(
    canAwardReferral({
      isExistingSignup: false,
      inviterEmail: "inviter@example.com",
      signupEmail: "new@example.com",
    }),
    true
  );
});
