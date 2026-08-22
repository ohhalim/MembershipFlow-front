const STORAGE_KEY = 'membershipflow_post_login_path'

export function rememberPostLoginPath(path: string) {
  if (!isSafeInternalPath(path)) return
  sessionStorage.setItem(STORAGE_KEY, path)
}

export function consumePostLoginPath(fallback = '/home') {
  const path = sessionStorage.getItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
  return path && isSafeInternalPath(path) ? path : fallback
}

function isSafeInternalPath(path: string) {
  return path.startsWith('/') && !path.startsWith('//')
}
