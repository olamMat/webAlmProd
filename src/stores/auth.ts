import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async login(credentials: { Login: string; Pass: string }) {
      this.loading = true;
      this.error = null;
      try {
        // Función para codificar en Base64 con UTF-16LE (Little Endian)
        const toUtf16LeBase64 = (str: string) => {
          const bytes = new Uint8Array(str.length * 2);
          for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            bytes[i * 2] = code & 0xff;
            bytes[i * 2 + 1] = (code >> 8) & 0xff;
          }
          let binary = '';
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          return btoa(binary);
        };

        // El usuario indica que AMBAS capas deben ser UTF-16LE
        const firstPass = toUtf16LeBase64(credentials.Pass);
        const doublePass = toUtf16LeBase64(firstPass);
        
        const response = await axios.post('/api/login', {
          Login: credentials.Login,
          Pass: doublePass
        });
        
        if (response.data.success && response.data.data.length > 0) {
          this.user = response.data.data[0];
          localStorage.setItem('user', JSON.stringify(this.user));
          return true;
        } else {
          this.error = 'Credenciales inválidas';
          return false;
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Error al iniciar sesión';
        return false;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.user = null;
      localStorage.removeItem('user');
    }
  }
});
