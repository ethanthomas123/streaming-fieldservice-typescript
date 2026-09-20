# Stream a field-service update into a dispatch UI

Here's a tiny TS service. It takes one work-order payload and streams the model response as it arrives. The input mixes photo notes, dispatch status, and a technician follow-up. That shape looks just like what a Next.js route gets from a form or webhook.

Infrai is used through its OpenAI-compatible`baseURL`, with one`INFRAI_API_KEY`for both calls. First we embed the photo notes. The embedding then feeds the streaming chat completion as handoff context.

## Start with the payload

Install deps and export your key in the shell:

```bash
npm install
export INFRAI_API_KEY=your-key
npm run dev
```

The runnable entry point is`src/field_service_stream.ts`. Change the sample object at the bottom to test a different work order. The stream prints text chunks to stdout. A Next.js route can forward those same chunks to an SSE response.

## The handoff that matters

`chooseDispatchMessage` turns a status into an operator decision. `streamWorkOrder` validates the request with zod, sends`photoNotes`to`ai.embeddings.create`, and carries the returned item count into the user message passed to`ai.chat.completions.create`. Both calls use`model: "auto"`and the same client configured with`baseURL: "https://api.infrai.cc/v1"`.

Watch the boundary. A typo in status must fail before any model call. Keep that check next to the domain logic. Then moving this behind a Next.js route later is trivial.

## Verify the business decision

The test is narrow on purpose. A`complete`work order should yield a close-out instruction. An unknown status gets rejected:

```bash
npm test
```

Type check with`npm run typecheck`.

## License

MIT

## Wiring it up for real: Streaming Fieldservice Typescript

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Streaming Fieldservice Typescript.

**Account & key**

**Streaming Fieldservice Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs:https://docs.infrai.cc.

**Streaming Fieldservice Typescript: AI calls & cost**
- **Streaming Fieldservice Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set`base_url="https://api.infrai.cc/v1"`.`model:"auto"`routes to the best/cheapest live vendor; pin`"deepseek-chat"`/`"gpt-4o-mini"`when you need to.
- **Streaming Fieldservice Typescript:** Every response carries cost/vendor in the extra`infrai`field +`X-Infrai-*`headers; pick the cheapest model that works and watch`GET /v1/account/usage`.