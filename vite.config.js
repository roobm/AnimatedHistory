import { defineConfig } from 'vite';

// GitHub Pages serves the site from /AnimatedHistory/. The dev server stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/AnimatedHistory/' : '/',
}));
