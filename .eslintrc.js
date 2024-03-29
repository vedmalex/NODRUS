module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/@typescript-eslint",
  ],
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/array-type": [
      "error",
      {
        default: "generic",
      },
    ],
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-namespace": "off",
    "arrow-parens": ["error", "always"],
    "@typescript-eslint/no-unused-vars": ["off"],
    "@typescript-eslint/explicit-function-return-type": [
      "off",
      { allowExpressions: true },
    ],
    "@typescript-eslint/member-delimiter-style": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "require-atomic-updates": "warn",
    "no-return-await": "warn",
    "require-await": "warn",
  },
};
