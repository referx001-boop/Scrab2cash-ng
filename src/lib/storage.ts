// Tiny, crash-proof localStorage wrapper (private mode / full storage never breaks the app)
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota / private mode */
  }
}
export const KEYS = { cart: 's2c.cart.v1', log: 's2c.log.v1', city: 's2c.city.v1', profile: 's2c.profile.v1' }
