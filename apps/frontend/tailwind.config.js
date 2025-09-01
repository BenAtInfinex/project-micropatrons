const path = require("path");

const {
  legacyThemeExtensions,
  uiContentPaths,
} = require("@infinex/tailwind-config");

// Custom shadows used by Cardrun only
const boxShadow = {
  buttonAccent:
    "0px 2px 0px -1px rgba(255, 255, 255, 0.40) inset, 0px 0px 2px 0px rgba(12, 13, 15, 0.9)",
  buttonAccentDisabled:
    "0px 2px 0px -1px rgba(255, 255, 255, 0.04) inset, 0px 0px 2px 0px rgba(12, 13, 15, 0.90)",
  buttonNeutral:
    "0px 2px 0px -1px rgba(255, 255, 255, 0.1) inset, 0px 0px 2px 0px rgba(12, 13, 15, 0.9)",
};

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      ...legacyThemeExtensions,
      boxShadow,
    },
  },
  content: [
    "./src/**/*.{ts,tsx}",
    ...uiContentPaths,
    path.join(
      path.dirname(require.resolve("@infinex/web-shared/components")),
      "**/*.{ts,tsx}",
    ),
    path.join(
      path.dirname(require.resolve("@infinex/web-shared/swidge")),
      "**/*.{ts,tsx}",
    ),
  ],
  presets: [require("@infinex/ui/tailwind-config-preset")],
};

