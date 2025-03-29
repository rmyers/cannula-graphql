import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import css from "rollup-plugin-import-css";
import html from "rollup-plugin-html";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/ui-library.js",
      format: "iife",
      name: "UILibrary",
      sourcemap: true,
    },
    {
      file: "dist/ui-library.min.js",
      format: "iife",
      name: "UILibrary",
      plugins: [terser()],
      sourcemap: true,
    },
    {
      file: "dist/ui-library.esm.js",
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [
    // Import and minify HTML templates
    html({
      include: "**/*.html",
      htmlMinifierOptions: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: false, // We handle CSS separately
      },
    }),
    // Import and minify CSS
    css({
      minify: true,
      output: false, // Don't extract to a separate file
    }),
    // Resolve node modules
    resolve(),
  ],
};
