import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname),
  test: {
    pool: "forks",
    root: path.resolve(__dirname),
  },
  css: {
    postcss: path.resolve(__dirname),
  },
});
