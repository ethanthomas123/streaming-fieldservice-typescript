import assert from "node:assert/strict";
import { chooseDispatchMessage, workOrderSchema } from "../src/field_service_stream";

const order = workOrderSchema.parse({
  workOrderId: "WO-7",
  photoNotes: "Loose valve at the pump.",
  dispatchStatus: "complete",
  technicianFollowUp: "Attach the final reading."
});

assert.equal(chooseDispatchMessage(order), "Close the work order and send the customer a completion note.");
assert.throws(() => workOrderSchema.parse({ ...order, dispatchStatus: "unknown" }));
console.log("dispatch decision test passed");
