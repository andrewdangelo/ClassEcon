import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  schema: process.env.VITE_GRAPHQL_HTTP_URL || "http://localhost:4000/graphql",
  documents: ["src/**/*.graphql", "src/graphql/**/*.{ts,tsx}"],
  generates: {
    "src/graphql/__generated__/": {
      preset: "client",
      plugins: [],
    },
  },
}
export default config
