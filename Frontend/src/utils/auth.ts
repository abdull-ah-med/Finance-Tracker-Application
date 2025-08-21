import Cookies from 'js-cookie';

export const auth = {
  setToken(token: string) {
    Cookies.set('auth_token', token, { expires: 7 });
  },

  getToken(): string | undefined {
    return Cookies.get('auth_token');
  },

  removeToken() {
    Cookies.remove('auth_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
