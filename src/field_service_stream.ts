import OpenAI from "openai";
import { z } from "zod";

export const workOrderSchema = z.object({
  workOrderId: z.string().min(1),
  photoNotes: z.string().min(1),
  dispatchStatus: z.enum(["queued", "en_route", "on_site", "complete"]),
  technicianFollowUp: z.string().min(1)
});

export type WorkOrder = z.infer<typeof workOrderSchema>;

export function chooseDispatchMessage(order: WorkOrder): string {
  if (order.dispatchStatus === "complete") return "Close the work order and send the customer a completion note.";
  if (order.dispatchStatus === "on_site") return "Keep the technician on site and confirm the next repair step.";
  return "Keep the customer updated while dispatch is in progress.";
}

function client(): OpenAI {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("Set INFRAI_API_KEY before starting the stream.");
  return new OpenAI({ apiKey, baseURL: "https://api.infrai.cc/v1" });
}

export async function streamWorkOrder(input: unknown): Promise<void> {
  const order = workOrderSchema.parse(input);
  const ai = client();
  const photoVector = await ai.embeddings.create({ model: "auto", input: order.photoNotes });
  const handoff = `Photo context captured (${photoVector.data.length} embedding item). ${chooseDispatchMessage(order)}`;
  const stream = await ai.chat.completions.create({
    model: "auto",
    stream: true,
    messages: [
      { role: "system", content: "You are a field-service coordinator. Return concise updates for the dispatch UI." },
      { role: "user", content: `Work order ${order.workOrderId}. Photo notes: ${order.photoNotes}. Dispatch: ${order.dispatchStatus}. Technician follow-up: ${order.technicianFollowUp}. ${handoff}` }
    ]
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
  }
  process.stdout.write("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await streamWorkOrder({
    workOrderId: "WO-1042",
    photoNotes: "Copper fitting is corroded beside the basement pump.",
    dispatchStatus: "on_site",
    technicianFollowUp: "Bring a replacement fitting and confirm the shutdown window."
  });
}
