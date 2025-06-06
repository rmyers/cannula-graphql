import { ToastElement } from "./components/toast/toast.js";
import { ThemeToggle } from "./components/theme-toggle/theme-toggle.js";
import { LucideIcon } from "./components/icons/lucide-icon.js";
import { GraphQLToastHandler, FormErrorHandler } from "./components/forms.js";

// The main initialization function
async function initialize() {
  // prevent content flashing
  document.body.style.opacity = 0;

  try {
    // 1. Load and apply Pico CSS
    // const picoResponse = await fetch(
    //   "https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css",
    // );
    // const picoCSS = await picoResponse.text();

    // const picoStyleSheet = new CSSStyleSheet();
    // picoStyleSheet.replaceSync(picoCSS);
    // document.adoptedStyleSheets = [picoStyleSheet];

    // 2. Add your custom styles
    const customStyleSheet = new CSSStyleSheet();
    customStyleSheet.replaceSync(`
      :root {
        --toast-border-radius: 8px;
        /* More custom variables... */
      }
    `);

    // 3. Apply stylesheets to document
    document.adoptedStyleSheets = [customStyleSheet];

    // 4. Register web components if not already registered
    if (!customElements.get("toast-element")) {
      customElements.define("toast-element", ToastElement);
    }

    if (!customElements.get("theme-toggle")) {
      customElements.define("theme-toggle", ThemeToggle);
    }

    if (!customElements.get("lucide-icon")) {
      customElements.define("lucide-icon", LucideIcon);
    }

    // 5. Register HTMX plugin if HTMX is available
    if (window.htmx) {
      GraphQLToastHandler.registerHtmxExtension();
    }

    // Show the document
    document.body.style.opacity = 1;

    return true;
  } catch (error) {
    console.error("UI Library initialization failed:", error);
    // Show the document
    document.body.style.opacity = 1;
    return false;
  }
}

// Expose library API
const UILibrary = {
  initialize,
  ToastElement,
  ThemeToggle,
  GraphQLToastHandler,
  FormErrorHandler,
};

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}

// Export for module usage
export default UILibrary;

// Export for global usage
window.UILibrary = UILibrary;
