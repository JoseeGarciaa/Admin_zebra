import type { AdminUser } from "./data"

const STORAGE_KEY = "admin-platform:user"

export function storeAdminUser(user: AdminUser): void {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function getStoredAdminUser(): AdminUser | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AdminUser
  } catch (error) {
    console.error("Failed to parse stored admin user", error)
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function clearStoredAdminUser(): void {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}
