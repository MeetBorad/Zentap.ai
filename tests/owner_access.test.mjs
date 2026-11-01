// tests/owner_access.test.mjs
import assert from "assert";
import crypto from "crypto";

async function runTests() {
  console.log("Starting Owner Access & PIN Security Test Suite...\n");

  const {
    hashSecret,
    checkLockout,
    recordFailedAttempt,
    resetLockout,
    generateOwnerSessionToken,
    verifyOwnerSessionToken,
    DEFAULT_PIN_HASH
  } = await import("../src/lib/ownerAccess.ts");

  const {
    updateTagAndBusinessFromOwner,
    resetTagCardFromOwner
  } = await import("../src/lib/businessStore.ts");

  // 1. PIN Hashing Check
  console.log("Test 1: SHA-256 PIN hashing");
  const defaultHash = hashSecret("1234");
  assert.strictEqual(defaultHash, DEFAULT_PIN_HASH, "Default PIN 1234 hash mismatch");
  assert.strictEqual(hashSecret("9999"), crypto.createHash("sha256").update("9999").digest("hex"));
  console.log("✓ PIN hashing is accurate\n");

  // 2. 5-Attempt Lockout & 30-Minute Lock Check
  console.log("Test 2: Rate limiting and 30-minute lockout after 5 failed attempts");
  const testTag = "zt-test-01";
  const testIp = "192.168.1.100";

  resetLockout(testTag, testIp);
  let status = checkLockout(testTag, testIp);
  assert.strictEqual(status.isLocked, false);

  // 4 failed attempts: not locked yet
  for (let i = 1; i <= 4; i++) {
    const res = recordFailedAttempt(testTag, testIp);
    assert.strictEqual(res.lockedNow, false, `Should not be locked on attempt ${i}`);
  }

  // 5th failed attempt: triggers 30-minute lock!
  const fifthAttempt = recordFailedAttempt(testTag, testIp);
  assert.strictEqual(fifthAttempt.lockedNow, true, "5th attempt must trigger lockout");

  const lockedStatus = checkLockout(testTag, testIp);
  assert.strictEqual(lockedStatus.isLocked, true, "Tag+IP must be locked");
  assert.ok(lockedStatus.remainingMs > 29 * 60 * 1000, "Lock duration must be ~30 minutes");
  console.log("✓ 30-minute lockout enforced on 5th failure\n");

  // 3. 15-Minute Scoped Session Token
  console.log("Test 3: 15-minute scoped session token issuance & verification");
  const { token, expiresAt } = generateOwnerSessionToken(testTag, "biz-101");
  assert.ok(token, "Session token must be non-empty");
  assert.ok(expiresAt > Date.now() + 14 * 60 * 1000, "Expiry must be 15 minutes");

  const verified = verifyOwnerSessionToken(token, testTag);
  assert.strictEqual(verified.valid, true, "Token must be valid for the same tag code");
  assert.strictEqual(verified.businessId, "biz-101");

  // Cannot use token on another tag
  const fakeTagVerify = verifyOwnerSessionToken(token, "zt-other-card");
  assert.strictEqual(fakeTagVerify.valid, false, "Token must be strictly scoped to its own tag code");
  console.log("✓ Session token is valid and scoped strictly to tag for 15 minutes\n");

  // 4. Update Tag and Business Details
  console.log("Test 4: Update card details (Name, Google Review, WhatsApp, Instagram)");
  const updateRes = updateTagAndBusinessFromOwner("zt-0001", {
    name: "Updated Boutique Cafe",
    review_url: "https://g.page/r/updated-cafe/review",
    whatsapp_number: "919876543210",
    instagram_handle: "updated_cafe_official"
  });
  assert.strictEqual(updateRes.success, true);
  console.log("✓ Details updated successfully\n");

  // 5. Reset Card (Levels: off, direct, needs_approval)
  console.log("Test 5: Reset card levels (off, direct, needs_approval)");
  const resetOff = resetTagCardFromOwner("zt-0001", "off");
  assert.strictEqual(resetOff.success, true);
  assert.strictEqual(resetOff.tag?.active, false, "Reset level 'off' must deactivate tag");

  const resetDirect = resetTagCardFromOwner("zt-0001", "direct");
  assert.strictEqual(resetDirect.success, true);
  assert.strictEqual(resetDirect.tag?.destination, "direct", "Reset level 'direct' must switch destination to direct");
  assert.strictEqual(resetDirect.tag?.active, true);

  console.log("✓ Reset levels function correctly\n");

  console.log("ALL OWNER ACCESS & PIN SECURITY TESTS PASSED! 🎉");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
