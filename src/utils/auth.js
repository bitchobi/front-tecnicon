// Guarda token y expiración (ej. 30 min)
export function setSession(token, minutos = 30) {
  const exp = Date.now() + minutos * 60 * 1000;
  localStorage.setItem('token', token);
  localStorage.setItem('token_exp', String(exp));
}

export function getToken() {
  return localStorage.getItem('token');
}

export function isExpired() {
  const exp = Number(localStorage.getItem('token_exp') || 0);
  return !exp || Date.now() > exp;
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('token_exp');
}

export function isLoggedIn() {
  const t = getToken();
  return Boolean(t) && !isExpired();
}
// 👇 NUEVO: leer payload del JWT para obtener id/sub
export function getUserId() {
  const t = getToken();
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split('.')[1]));
    // ajusta si tu payload usa otra clave
    return payload.id || payload.user_id || payload.sub || null;
  } catch {
    return null;
  }
}
