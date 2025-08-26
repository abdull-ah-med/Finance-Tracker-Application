import Cookies from 'js-cookie';

export const auth = {
  // No-op: backend sets cookie, frontend does not need to set token
  setToken(_token: string) {},

  // Only read from cookie
  getToken(): string | undefined {
    return Cookies.get('auth_token');
  },

  removeToken() {
    Cookies.remove('auth_token');
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('auth_token');
  },
};
