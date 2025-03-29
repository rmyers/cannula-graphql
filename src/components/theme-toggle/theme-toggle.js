import { applyStyles, loadTemplate } from "../../template-loader.js";
import toggleTemplate from "./theme-toggle.html";
import toggleStyles from "./theme-toggle.css";

export class ThemeToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Apply styles
    applyStyles(this.shadowRoot, toggleStyles, document.adoptedStyleSheets);
    loadTemplate(toggleTemplate, this.shadowRoot);
    this.initializeTheme();
  }

  initializeTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // If no saved preference, check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      document.documentElement.setAttribute(
        "data-theme",
        prefersDark ? "dark" : "light",
      );
      localStorage.setItem("theme", prefersDark ? "dark" : "light");
    }

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          const newTheme = e.matches ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", newTheme);
        }
      });
  }

  setupListeners() {
    const toggle = this.shadowRoot.querySelector(".toggle");
    toggle.addEventListener("click", () => {
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      document.documentElement.setAttribute(
        "data-theme",
        isDark ? "light" : "dark",
      );

      // Optionally save preference
      localStorage.setItem("theme", isDark ? "light" : "dark");
    });
  }

  connectedCallback() {
    this.setupListeners();
  }
}
