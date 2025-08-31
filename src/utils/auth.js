// src/utils/auth.js - Versión unificada

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';
const SESSION_KEY = 'userSession';

// Función que usa tu LoginForm.vue actual
export function setSession(token, expirationMinutes = 30) {
  if (token) {
    const expirationTime = Date.now() + (expirationMinutes * 60 * 1000);
    const sessionData = {
      token,
      expirationTime
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(TOKEN_KEY, token); // Para compatibilidad
    
    return true;
  }
  return false;
}

// Función para obtener el token de la sesión
export function getToken() {
  // Primero verificar sesión con tiempo
  const sessionData = getSessionData();
  if (sessionData && sessionData.token) {
    return sessionData.token;
  }
  
  // Fallback al token simple
  return localStorage.getItem(TOKEN_KEY);
}

// Obtener datos completos de la sesión
export function getSessionData() {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (sessionStr) {
      const sessionData = JSON.parse(sessionStr);
      
      // Verificar si no ha expirado
      if (sessionData.expirationTime && Date.now() < sessionData.expirationTime) {
        return sessionData;
      } else {
        // Sesión expirada, limpiar
        clearSession();
        return null;
      }
    }
  } catch (error) {
    console.error('Error parsing session data:', error);
    clearSession();
  }
  return null;
}

// Funciones para el usuario
export function setUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getUser() {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

export function getUserId() {
  const user = getUser();
  return user?.id_usuario || user?.id || null;
}

export function getUserRole() {
  // Primero verificar el usuario
  const user = getUser();
  if (user?.rol || user?.role) {
    return user.rol || user.role;
  }
  
  // Fallback al localStorage directo (como usa tu LoginForm actual)
  return localStorage.getItem('rol') || null;
}

// Verificar si está autenticado
export function isAuthenticated() {
  const token = getToken();
  const sessionData = getSessionData();
  return !!(token && sessionData);
}

export function isAdmin() {
  const role = getUserRole();
  return role === 'admin';
}

export function isOperador() {
  const role = getUserRole();
  return role === 'operador';
}

// Limpiar sesión
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('rol');
  sessionStorage.clear();
}

// Alias para logout (para compatibilidad)
export function logout() {
  clearSession();
}

// Función para refrescar/extender la sesión
export function extendSession(minutes = 30) {
  const sessionData = getSessionData();
  if (sessionData && sessionData.token) {
    setSession(sessionData.token, minutes);
    return true;
  }
  return false;
}

// Verificar token con el servidor
export async function verifyToken() {
  const token = getToken();
  if (!token) return false;

  try {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    const response = await fetch(`${API_BASE}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.valid && data.user) {
        // Actualizar datos del usuario
        setUser(data.user);
        return true;
      }
    }
    
    // Si el token no es válido, limpiar
    clearSession();
    return false;
  } catch (error) {
    console.error('Error verificando token:', error);
    return false;
  }
}

// Función para obtener tiempo restante de sesión
export function getSessionTimeRemaining() {
  const sessionData = getSessionData();
  if (sessionData && sessionData.expirationTime) {
    const remaining = sessionData.expirationTime - Date.now();
    return Math.max(0, remaining);
  }
  return 0;
}

// Función para formatear tiempo restante
export function formatSessionTimeRemaining() {
  const remaining = getSessionTimeRemaining();
  if (remaining <= 0) return 'Expirada';
  
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}