import { Container, getContainer } from "@cloudflare/containers";

interface Env {
  EMAIL_CONTAINER: DurableObjectNamespace<EmailServiceContainer>;
  [k: string]: unknown;
}

export class EmailServiceContainer extends Container<Env> {
  defaultPort = 4004;
  sleepAfter = "30m";
  enableInternet = true;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    const forward: Record<string, string> = {};
    for (const [k, v] of Object.entries(env)) {
      if (typeof v === "string" && v.length > 0) forward[k] = v;
    }
    this.envVars = { ...forward, ROLE: "api", PORT: "4004" };
  }

  override onStart() {
    console.log("[email-service] container started (api)");
  }
  override onError(err: Error) {
    console.error("[email-service] container error:", err);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = getContainer(env.EMAIL_CONTAINER, "singleton");
    return container.fetch(request);
  },
} satisfies ExportedHandler<Env>;
