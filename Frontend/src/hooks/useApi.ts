import * as React from "react"

export function useApi<T>(call: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const run = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await call()
      setData(result)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [call])

  React.useEffect(() => {
    // only run if deps are resolvable (no undefined/empty identifiers)
    const hasUndefined = deps.some((d) => d === undefined || d === null)
    if (!hasUndefined) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, refetch: run }
}
