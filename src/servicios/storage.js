const hasWindow = typeof window !== 'undefined'

const memoryStore = new Map()

const storage = {
  getItem(key) {
    if (hasWindow && window.localStorage) {
      return window.localStorage.getItem(key)
    }
    return memoryStore.get(key) ?? null
  },
  setItem(key, value) {
    if (hasWindow && window.localStorage) {
      window.localStorage.setItem(key, value)
    } else {
      memoryStore.set(key, value)
    }
  },
  removeItem(key) {
    if (hasWindow && window.localStorage) {
      window.localStorage.removeItem(key)
    } else {
      memoryStore.delete(key)
    }
  },
}

function clone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value))
}

export function loadState(key, fallback) {
  try {
    const stored = storage.getItem(key)
    if (!stored) {
      return clone(fallback)
    }
    return JSON.parse(stored)
  } catch (error) {
    console.warn(`[storage] Error al cargar "${key}":`, error)
    return clone(fallback)
  }
}

export function saveState(key, value) {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`[storage] Error al guardar "${key}":`, error)
  }
}

export function clearState(key) {
  try {
    storage.removeItem(key)
  } catch (error) {
    console.warn(`[storage] Error al limpiar "${key}":`, error)
  }
}

