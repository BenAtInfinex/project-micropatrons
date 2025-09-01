import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const reactComponentTypeMessage = {
  message:
    "Avoid using this type as it includes the children prop by default, " +
    "which may not be appropriate. Instead, define the component props " +
    "explicitly.",
};

export default [
  {
    ignores: [
      "**/secrets.ts",
      "eslint.config.mjs",
      "tailwind.config.js",
      "vitest.config.ts",
      "vitest.setup.ts",
      "postcss.config.js",
      "integration-tests/**/*.{ts,tsx}",
    ],
  },
  ...compat.extends("@infinex/eslint-config/app"),
  {
    plugins: {
      react,
    },

    languageOptions: {
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
    },

    settings: {
      react: {
        version: "detect",
      },
      // Add these settings for path resolution
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
          alwaysTryTypes: true,
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js"],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unsafe-function-type": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_|ignore|unused",
        },
      ],
      "@typescript-eslint/no-restricted-types": [
        "error",
        {
          types: {
            object: {
              message:
                "Declare properties, and where possible their value types, explicitly.",
              suggest: ["Record<string, unknown>"],
            },
            ComponentType: reactComponentTypeMessage,
            FC: reactComponentTypeMessage,
            SFC: reactComponentTypeMessage,
            "React.ComponentType": reactComponentTypeMessage,
            "React.FC": reactComponentTypeMessage,
            "React.SFC": reactComponentTypeMessage,
          },
        },
      ],
      "import/first": "warn",
      "import/named": "warn",
      "import/newline-after-import": "warn",
      "import/no-default-export": "warn",
      "import/no-duplicates": "warn",
      "import/no-unresolved": "error",
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          groups: [
            "builtin",
            "external",
            "internal",
            "sibling",
            "parent",
            "index",
          ],

          pathGroups: [
            {
              pattern: "config",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@infinex/**",
              group: "internal",
            },
            {
              pattern: "pages/**",
              group: "internal",
            },
            {
              pattern: "components/**",
              group: "internal",
            },
            {
              pattern: "assets/**",
              group: "internal",
            },
          ],

          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "no-async-promise-executor": "warn",
      "no-empty-pattern": "warn",
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
];
