import { Container, getContainer } from "@cloudflare/containers";

interface Env {
  PAYMENT_CONTAINER: DurableObjectNamespace<PaymentServiceContainer>;
  [k: string]: unknown;
}

export class PaymentServiceContainer extends Container<Env> {
  defaultPort = 4003;
  sleepAfter = "30m";
  enableInternet = true;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    const forward: Record<string, string> = {};
    for (const [k, v] of Object.entries(env)) {
      if (typeof v === "string" && v.length > 0) forward[k] = v;
    }
    // Force PORT=4003 regardless of what secret storage might say, so the
    // container binds to the port our Worker expects.
    this.envVars = { ...forward, PORT: "4003" };
  }

  override onStart() {
    console.log("[payment-service] container started");
  }
  override onError(err: Error) {
    console.error("[payment-service] container error:", err);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = getContainer(env.PAYMENT_CONTAINER, "singleton");
    return container.fetch(request);
  },
} satisfies ExportedHandler<Env>;
