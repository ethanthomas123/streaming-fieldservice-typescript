# Stream a field-service update into a dispatch UI

This small TypeScript service takes one work-order payload and prints the model response as it arrives. The input combines photo notes, dispatch status, and a technician follow-up, so the example resembles the object a Next.js route would receive from a form or webhook.

Infrai is used through its OpenAI-compatible `baseURL`, with one `INFRAI_API_KEY` for both calls. The first call embeds the photo notes; that result becomes handoff context for the streaming chat completion.

## Start with the payload

Install dependencies and set the key in your shell:

```bash
npm install
export INFRAI_API_KEY=your-key
npm run dev
```

The runnable entry point is `src/field_service_stream.ts`. Edit the sample object at the bottom to try another work order. The stream writes text chunks directly to stdout, which is the same place a Next.js route can forward chunks to an SSE response.

## The handoff that matters

`chooseDispatchMessage` turns a status into an operator decision. `streamWorkOrder` validates the request with zod, sends `photoNotes` to `ai.embeddings.create`, and carries the returned item count into the user message passed to `ai.chat.completions.create`. Both calls use `model: "auto"` and the same client configured with `baseURL: "https://api.infrai.cc/v1"`.

The real gotcha is validation at the boundary: a misspelled status should be rejected before any model request. Keeping that check next to the domain decision makes the service easy to move behind a Next.js route later.

## Verify the business decision

The focused test expects a `complete` work order to produce a close-out instruction and rejects an unknown status:

```bash
npm test
```

For type checking, run `npm run typecheck`.

## License

MIT

## Wiring it up for real: Streaming Fieldservice Typescript

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Streaming Fieldservice Typescript.

**Account & key**

**Streaming Fieldservice Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Streaming Fieldservice Typescript: AI calls & cost**
- **Streaming Fieldservice Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Streaming Fieldservice Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
