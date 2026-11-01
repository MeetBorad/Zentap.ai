// ZenTap Hardware Tag Layer Test Suite
// Verifies all Tag physical routing, reassignments, soft delete and slug locking

import assert from "assert";

async function run() {
  console.log("=================================================");
  console.log("   ZenTap Physical Tag Layer Test Suite          ");
  console.log("=================================================\n");

  const {
    getAllTags,
    getTagByCode,
    generateTagBatch,
    assignTag,
    releaseTag,
    toggleTagActive,
    updateTagDestination,
    softDeleteBusinessWithTags,
    adminUpdateBusinessRecord,
    getAllBusinesses,
    addBusinessRecord,
  } = await import("../src/lib/businessStore.ts");

  const { resolveScan } = await import("../src/lib/resolveTag.ts");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err);
      failed++;
    }
  }

  // 1. Initial inventory check
  await test("Seed tags are properly populated", async () => {
    const tags = getAllTags();
    assert.ok(tags.length >= 4, "Should have at least 4 seed tags");
    const t1 = getTagByCode("zt-0001");
    assert.ok(t1, "zt-0001 must exist");
    assert.strictEqual(t1.form, "standee");
    assert.strictEqual(t1.type, "review");
  });

  // 2. Batch generation
  await test("Generate batch of 10 standees creates sequential codes", async () => {
    const beforeCount = getAllTags().length;
    const updated = generateTagBatch(10, "standee");
    assert.strictEqual(updated.length, beforeCount + 10, "Should add 10 new tags");
    const newTag = updated[0];
    assert.ok(/^zt-\d{4}$/.test(newTag.code), `Code ${newTag.code} must match zt-XXXX format`);
    assert.strictEqual(newTag.form, "standee");
    assert.strictEqual(newTag.business_id, null, "New batch tags must be free in inventory");
  });

  // 3. Assign tag ("Give to Business")
  await test("Give to Business assigns tag with purpose and note", async () => {
    const tags = getAllTags();
    const freeTag = tags.find((t) => !t.business_id);
    assert.ok(freeTag, "Must have a free tag to assign");

    const assigned = assignTag(freeTag.id, "sample-demo-biz-01", "whatsapp", {
      label: "Support Desk",
      whatsapp_number: "919274560880",
      whatsapp_message: "Hello Support!",
    });

    const check = assigned.find((t) => t.id === freeTag.id);
    assert.strictEqual(check.business_id, "sample-demo-biz-01");
    assert.strictEqual(check.type, "whatsapp");
    assert.strictEqual(check.label, "Support Desk");
    assert.strictEqual(check.whatsapp_number, "919274560880");
  });

  // 4. "Take Back" (free it up)
  await test("Take Back releases tag to inventory while keeping it active", async () => {
    const tags = getAllTags();
    const assignedTag = tags.find((t) => t.business_id === "sample-demo-biz-01" && t.type === "whatsapp");
    assert.ok(assignedTag, "Must have assigned whatsapp tag");

    const released = releaseTag(assignedTag.id);
    const check = released.find((t) => t.id === assignedTag.id);
    assert.strictEqual(check.business_id, null, "Business ID must be cleared");
    assert.strictEqual(check.type, null, "Type must be cleared");
    assert.strictEqual(check.label, null, "Label must be cleared");
    assert.strictEqual(check.active, true, "Tag remains active in inventory");
  });

  // 5. Slug Locking rule
  await test("Slug can be edited once after creation, then permanently locks", async () => {
    const newBiz = addBusinessRecord({
      name: "Lock Test Cafe",
      email: "lock@test.com",
      slug: "lock-test-cafe",
      plan: "standee_1500",
      payment_status: "paid",
      review_url: null,
      active: true,
      owner_user_id: "lock-test-owner",
    });

    assert.strictEqual(newBiz.slug, "lock-test-cafe");
    assert.ok(!newBiz.slug_locked, "Newly created business slug should not be locked initially");

    // First edit: should succeed and lock
    const updatedOnce = adminUpdateBusinessRecord(newBiz.id, {
      slug: "lock-test-cafe-prime",
    });
    const bizAfterOnce = updatedOnce.find((b) => b.id === newBiz.id);
    assert.strictEqual(bizAfterOnce.slug, "lock-test-cafe-prime");
    assert.strictEqual(bizAfterOnce.slug_locked, true, "Slug must lock after first edit");

    // Second edit: should be rejected
    const updatedTwice = adminUpdateBusinessRecord(newBiz.id, {
      slug: "lock-test-cafe-hacked",
    });
    const bizAfterTwice = updatedTwice.find((b) => b.id === newBiz.id);
    assert.strictEqual(bizAfterTwice.slug, "lock-test-cafe-prime", "Locked slug must not be modified");
  });

  // 6. Soft Delete with Tags
  await test("Soft deleting business releases all attached hardware tags", async () => {
    const biz = addBusinessRecord({
      name: "Hardware Fleet Biz",
      email: "fleet@biz.com",
      slug: "hardware-fleet-biz",
      plan: "standee_1500",
      payment_status: "paid",
      review_url: "https://g.page/r/test/review",
      active: true,
      owner_user_id: "fleet-owner",
    });

    const tags = getAllTags();
    const freeTag = tags.find((t) => !t.business_id);
    assignTag(freeTag.id, biz.id, "review");

    const { releasedTagsCount, businesses } = softDeleteBusinessWithTags(biz.id);
    assert.ok(releasedTagsCount >= 1, "Must release attached tag(s)");

    const softDeletedBiz = businesses.find((b) => b.id === biz.id);
    assert.strictEqual(softDeletedBiz.is_deleted, true);
    assert.strictEqual(softDeletedBiz.active, false);

    const recheckedTag = getAllTags().find((t) => t.id === freeTag.id);
    assert.strictEqual(recheckedTag.business_id, null, "Attached tag must now be free in inventory");
  });

  // 7. Physical Tag Resolution (routing & fallbacks)
  await test("resolveScan: Review Standee resolves to ZenTap Page or Direct Google", async () => {
    const res = await resolveScan("zt-0001", "nfc", { logPage: false });
    assert.ok(res.kind === "page" || res.kind === "redirect");
    if (res.kind === "page") {
      assert.strictEqual(res.slug, "zentap");
    }
  });

  await test("resolveScan: WhatsApp card resolves to wa.me redirect", async () => {
    const res = await resolveScan("zt-0003", "qr", { logPage: false });
    assert.strictEqual(res.kind, "redirect");
    assert.ok(res.url.startsWith("https://wa.me/919274560880"));
  });

  await test("resolveScan: Instagram card resolves to instagram.com redirect", async () => {
    const res = await resolveScan("zt-0004", "nfc", { logPage: false });
    assert.strictEqual(res.kind, "redirect");
    assert.ok(res.url.includes("instagram.com/zentapdigitalsolutions"));
  });

  await test("resolveScan: Unassigned or non-existent code returns unavailable", async () => {
    const res = await resolveScan("zt-9999", "nfc", { logPage: false });
    assert.strictEqual(res.kind, "unavailable");
  });

  console.log(`\n=================================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`=================================================`);
  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
