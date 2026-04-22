import { Container, getContainer } from "@cloudflare/containers";

interface Env {
  AUTH_CONTAINER: DurableObjectNamespace<AuthServiceContainer>;
  [k: string]: unknown;
}

export class AuthServiceContainer extends Container<Env> {
  defaultPort = 4001;
  sleepAfter = "30m";
  enableInternet = true;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Forward every string-typed binding (secrets + plain text vars) into the
    // container's process environment so the Node app sees its config.
    const forward: Record<string, string> = {};
    for (const [k, v] of Object.entries(env)) {
      if (typeof v === "string" && v.length > 0) forward[k] = v;
    }
    this.envVars = { ...forward, ...(this.envVars ?? {}) };
  }

  override onStart() {
    console.log("[auth-service] container started");
  }
  override onError(err: Error) {
    console.error("[auth-service] container error:", err);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = getContainer(env.AUTH_CONTAINER, "singleton");
    return container.fetch(request);
  },
} satisfies ExportedHandler<Env>;
