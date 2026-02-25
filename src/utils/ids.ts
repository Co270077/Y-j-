/** Generate a short unique ID for subtasks and embedded items */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
