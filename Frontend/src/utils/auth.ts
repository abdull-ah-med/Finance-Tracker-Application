import Cookies from 'js-cookie';

export const auth = {
  // No-op: backend sets cookie, frontend does not need to set token
  setToken() {},

  // Only read from cookie
  getToken(): string | undefined {
    return Cookies.get('auth_token');
  },

  removeToken() {
    Cookies.remove('auth_token', { path: '/' });
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('auth_token');
  },
};
