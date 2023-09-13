module.exports = {
  extends: [
    "next",
    "prettier",
    "plugin:react-hooks/recommended",
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:effector/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["effector", "@typescript-eslint"],
  root: true,
};
