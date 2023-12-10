/** @type {import('eslint').Linter.FlatConfig[]} */

import pluginImport from "eslint-plugin-import";
import parserTypescript from "@typescript-eslint/parser";
import pluginTypescript from "@typescript-eslint/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";

export default [
    {
        files: ["*.ts"],
        ignores: [
            "*.js",
            "*.d.ts",
            "*.json",
            ".private",
            "pkg/",
            "node_modules/**/*",
        ],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: parserTypescript,
        },
        plugins: {
            pluginImport,
            pluginTypescript,
            stylistic,
        },
        settings: {
            "import/resolver": {
                typescript: true,
            },
        },
    },
    stylistic.configs.customize({
        indent: 4,
        quotes: "double",
        semi: true,
    }),
];
