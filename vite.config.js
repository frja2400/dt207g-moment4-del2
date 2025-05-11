import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
        login: 'login.html',
        register: 'register.html'
      }
    }
  }
});