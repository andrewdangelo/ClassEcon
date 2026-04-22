import { Container, getContainer } from "@cloudflare/containers";

interface Env {
  BACKEND_CONTAINER: DurableObjectNamespace<BackendContainer>;
  [k: string]: unknown;
}

export class BackendContainer extends Container<Env> {
  defaultPort = 4000;
  sleepAfter = "30m";
  enableInternet = true;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    const forward: Record<string, string> = {};
    for (const [k, v] of Object.entries(env)) {
      if (typeof v === "string" && v.length > 0) forward[k] = v;
    }
    this.envVars = { ...forward, ...(this.envVars ?? {}) };
  }

  override onStart() {
    console.log("[backend] container started");
  }
  override onError(err: Error) {
    console.error("[backend] container error:", err);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = getContainer(env.BACKEND_CONTAINER, "singleton");
    return container.fetch(request);
  },
} satisfies ExportedHandler<Env>;
