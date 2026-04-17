import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import nextConfig from "eslint-config-next/core-web-vitals";

export default tseslint.config(
  ...nextConfig,
  ...tseslint.configs.recommended,
  {
    ignores: ["kv/", "dist/", "lib/li.fi-ts/", "lib/openzeppelin-contracts/"],
  },
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-import-type-side-effects": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "react/display-name": "off",
    },
  },
);
