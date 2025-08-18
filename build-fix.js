// Script para corrigir build no Docker
import { promises as fs } from 'fs';
import path from 'path';

async function fixViteConfig() {
  const viteConfigPath = path.resolve('vite.config.ts');
  
  // Config limpo para produção
  const productionConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});`;

  try {
    await fs.writeFile(viteConfigPath, productionConfig);
    console.log('✅ vite.config.ts atualizado para produção');
  } catch (error) {
    console.error('❌ Erro ao atualizar vite.config.ts:', error);
  }
}

fixViteConfig();