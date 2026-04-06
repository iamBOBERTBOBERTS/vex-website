import assert from "node:assert/strict";
import { DealertrackAdapter } from "../src/lib/dms/adapters/dealertrackAdapter.js";
 
async function main() {
  // Unit-only: validates adapter shape without touching network.
  const adapter = new DealertrackAdapter(async () => []);
  assert.equal(adapter.vendor, "dealertrack");
  assert.equal(typeof adapter.fetchInventoryFull, "function");
  assert.equal(typeof adapter.fetchInventoryDelta, "function");
  assert.equal(typeof adapter.syncInventory, "function");
  // Do not call fetch methods here — they hit Dealertrack APIs.
  const res = await adapter.syncInventory({ tenantId: "t_test", mode: "delta" });
  assert.equal(res.imported, 0);
  assert.equal(res.skipped, 0);
  assert.ok(res.lastSyncAt instanceof Date);
  assert.deepEqual(res.records, []);
  console.log(JSON.stringify({ ok: true, adapter: adapter.vendor }));
}
 
main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
