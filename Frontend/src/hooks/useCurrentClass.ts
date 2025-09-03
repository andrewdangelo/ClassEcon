import { useClassContext } from "@/context/ClassContext"

export function useCurrentClass() {
  const { classes, currentClassId } = useClassContext()
  const current = classes.find((c) => c.id === currentClassId) || null
  return { currentClassId, current }
}
