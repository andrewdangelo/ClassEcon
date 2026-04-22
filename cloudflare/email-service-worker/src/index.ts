import { Container, getContainer } from "@cloudflare/containers";

interface Env {
  EMAIL_WORKER_CONTAINER: DurableObjectNamespace<EmailWorkerContainer>;
  [k: string]: unknown;
}

export class EmailWorkerContainer extends Container<Env> {
  defaultPort = 4004;
  sleepAfter = "2h";
  enableInternet = true;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    const forward: Record<string, string> = {};
    for (const [k, v] of Object.entries(env)) {
      if (typeof v === "string" && v.length > 0) forward[k] = v;
    }
    this.envVars = { ...forward, ROLE: "worker", PORT: "4004" };
  }

  override onStart() {
    console.log("[email-worker] container started (worker mode)");
  }
  override onError(err: Error) {
    console.error("[email-worker] container error:", err);
  }
}

export default {
  async fetch(): Promise<Response> {
    return new Response("email-service-worker has no public HTTP surface", {
      status: 404,
    });
  },

  // Cron trigger wakes the worker container every 5 minutes.
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const container = getContainer(env.EMAIL_WORKER_CONTAINER, "singleton");
    await container.start();
  },
} satisfies ExportedHandler<Env>;
