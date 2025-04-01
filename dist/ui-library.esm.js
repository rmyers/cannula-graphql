/**
 * Template processing utilities for web components
 */

/**
 * Creates a document fragment from HTML string
 *
 * @param {string} html - HTML string to convert to DocumentFragment
 * @returns {DocumentFragment} Document fragment containing the parsed HTML
 */
function htmlToFragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.cloneNode(true);
}

/**
 * Loads component template from an HTML file
 * This works with rollup-plugin-html which converts HTML imports to strings
 *
 * @param {string} htmlString - Imported HTML string
 * @param {ShadowRoot} shadowRoot - The shadow root to append the template to
 * @returns {DocumentFragment} Document fragment of the parsed template
 */
function loadTemplate(htmlString, shadowRoot) {
  const fragment = htmlToFragment(htmlString);
  shadowRoot.appendChild(fragment);
  return fragment;
}

/**
 * Applies styles to a shadow root using Constructable Stylesheets if supported
 *
 * @param {ShadowRoot} shadowRoot - The shadow root to apply styles to
 * @param {string} cssString - CSS string to apply
 * @param {CSSStyleSheet[]} documentSheets - Optional array of document stylesheets to inherit
 * @returns {boolean} True if styles were applied using Constructable Stylesheets
 */
function applyStyles(shadowRoot, cssString, documentSheets = []) {
  try {
    // Check if Constructable Stylesheets are supported
    if (
      !("CSSStyleSheet" in window) ||
      !("replaceSync" in CSSStyleSheet.prototype)
    ) {
      return false;
    }

    // Create component-specific stylesheet
    const componentSheet = new CSSStyleSheet();
    componentSheet.replaceSync(cssString);

    // Apply document stylesheets + component stylesheet
    if (documentSheets.length > 0) {
      shadowRoot.adoptedStyleSheets = [...documentSheets, componentSheet];
    } else {
      // Just use component styles if no document stylesheets provided
      shadowRoot.adoptedStyleSheets = [componentSheet];
    }

    return true;
  } catch (error) {
    console.error(
      "Error applying styles with Constructable Stylesheets:",
      error,
    );
    return false;
  }
}

var toastTemplate = "<div class=\"toast\"><div class=\"toast-icon\"><lucide-icon name=\"info\" class=\"icon-type\"></lucide-icon></div><span class=\"message\"></span> <button class=\"close-btn\" aria-label=\"Close\"><lucide-icon name=\"x\" size=\"small\"></lucide-icon></button></div>";

var toastStyles = ":host{--toast-success-color:var(--pico-color-success,#10B981);--toast-error-color:var(--pico-color-error,#EF4444);--toast-info-color:var(--pico-primary,#3B82F6);--toast-warning-color:var(--pico-color-warning,#F59E0B);--toast-surface-color:white;--toast-text-color:white;--toast-shadow:var(--pico-card-shadow,0 4px 12px rgba(0,0,0,0.15));--toast-border-radius:var(--pico-border-radius,8px);--toast-font-family:var(--pico-font-family,sans-serif);--toast-font-size:16px;position:fixed !important;bottom:20px;right:20px;z-index:9999;display:block;background-color:transparent;min-width:300px;max-width:500px;transition:transform 0.3s ease,opacity 0.3s ease;transform:translateY(20px);opacity:0;pointer-events:none;}:host(.visible){transform:translateY(0);opacity:1;pointer-events:all;}.toast{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:var(--toast-border-radius);background:var(--toast-surface-color);box-shadow:var(--toast-shadow);font-family:var(--toast-font-family);font-size:var(--toast-font-size);}:host(.toast-success) .toast{background-color:var(--toast-success-color);color:white;}:host(.toast-error) .toast{background-color:var(--toast-error-color);}:host(.toast-info) .toast{background-color:var(--toast-info-color);}:host(.toast-warning) .toast{background-color:var(--toast-warning-color);}.toast-icon{margin-right:12px;color:var(--toast-text-color);}.message{flex:1;color:var(--toast-text-color);}.close-btn{background:none;border:none;cursor:pointer;font-size:18px;margin-left:8px;padding:4px;color:var(--toast-text-color);}.close-btn svg{width:18px;height:18px;fill:currentColor;}@media (max-width:600px){:host{min-width:auto;max-width:none;width:calc(100vw - 40px);}}";

/**
 * Toast notification component
 * @element toast-element
 * @attr {string} type - Toast type: 'success', 'error', 'info', 'warning'
 * @attr {string} message - Toast message text
 * @attr {number} duration - Display duration in milliseconds
 * @attr {boolean} auto-hide - Whether to automatically hide the toast
 */
class ToastElement extends HTMLElement {
  constructor() {
    super();

    // Create shadow DOM
    this.attachShadow({ mode: "open" });

    // Apply styles
    applyStyles(this.shadowRoot, toastStyles, document.adoptedStyleSheets);
    loadTemplate(toastTemplate, this.shadowRoot);

    // Initialize properties
    this._duration = 3000;
    this._autoHide = true;
    this._timerId = null;
    this._type = "toast-info";

    // Get required elements
    this.messageElement = this.shadowRoot.querySelector(".message");
    this.closeButton = this.shadowRoot.querySelector(".close-btn");
    this.iconElement = this.shadowRoot.querySelector(".icon-type");

    // Add event listener for close button
    this.closeButton.addEventListener("click", () => this.hide());
  }

  /**
   * Web component lifecycle: When attributes change
   */
  static get observedAttributes() {
    return ["type", "message", "duration", "auto-hide"];
  }

  /**
   * Web component lifecycle: Component added to DOM
   */
  connectedCallback() {
    // Initialize from attributes if present
    if (this.hasAttribute("message")) {
      this.messageElement.textContent = this.getAttribute("message");
    }

    if (this.hasAttribute("type")) {
      this.type = this.getAttribute("type");
    } else {
      // Apply default type
      this.classList.add(this._type);
      // Set default icon
      this._updateIcon(this._type);
    }

    if (this.hasAttribute("duration")) {
      this._duration = parseInt(this.getAttribute("duration"), 10);
    }

    if (this.hasAttribute("auto-hide")) {
      this._autoHide = this.getAttribute("auto-hide") !== "false";
    }
  }

  /**
   * Web component lifecycle: Attribute changed
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "message" && this.messageElement) {
      this.messageElement.textContent = newValue;
    } else if (name === "type" && newValue) {
      this.type = newValue;
    } else if (name === "duration" && newValue) {
      this._duration = parseInt(newValue, 10);
    } else if (name === "auto-hide") {
      this._autoHide = newValue !== "false";
    }
  }

  /**
   * Update the icon based on toast type
   * @private
   */
  _updateIcon(type) {
    if (this.iconElement) {
      // Map toast type to icon name
      const iconName = type.replace("toast-", "") || "info";
      this.iconElement.setAttribute("name", iconName);
      this.iconElement.setAttribute("variant", iconName);
    }
  }

  /**
   * Type getter
   */
  get type() {
    return this._type.replace("toast-", "");
  }

  /**
   * Type setter
   */
  set type(value) {
    if (this._type) {
      this.classList.remove(this._type);
    }

    this._type = `toast-${value}`;
    this.classList.add(this._type);

    // Update the icon when type changes
    this._updateIcon(value);
  }

  /**
   * Message getter
   */
  get message() {
    return this.messageElement ? this.messageElement.textContent : "";
  }

  /**
   * Message setter
   */
  set message(value) {
    if (this.messageElement) {
      this.messageElement.textContent = value;
    }
  }

  /**
   * Duration getter
   */
  get duration() {
    return this._duration;
  }

  /**
   * Duration setter
   */
  set duration(value) {
    this._duration = value;
  }

  /**
   * Auto-hide getter
   */
  get autoHide() {
    return this._autoHide;
  }

  /**
   * Auto-hide setter
   */
  set autoHide(value) {
    this._autoHide = value;
  }

  /**
   * Show the toast notification
   * @returns {ToastElement} This instance for chaining
   */
  show() {
    if (this._visible) return this;

    this._visible = true;
    this.classList.add("visible");

    // Dispatch shown event
    this.dispatchEvent(new CustomEvent("toast:shown"));

    // Reposition all toasts
    this._repositionAllToasts();

    if (this._autoHide && this._duration > 0) {
      this._timerId = setTimeout(() => {
        this.hide();
      }, this._duration);
    }

    return this;
  }

  /**
   * Hide the toast notification
   * @returns {ToastElement} This instance for chaining
   */
  hide() {
    if (!this._visible) return this;

    this._visible = false;
    this.classList.remove("visible");

    if (this._timerId) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }

    // Add a small delay to allow for animation, matching GraphQLToast
    setTimeout(() => {
      // Dispatch hidden event
      this.dispatchEvent(new CustomEvent("toast:hidden"));

      // If this is from auto-hide, remove the element from DOM
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }

      // Reposition remaining toasts
      this._repositionAllToasts();
    }, 300); // Match this delay with CSS transition time

    return this;
  }

  /**
   * Reposition all toasts to stack properly
   * @private
   */
  _repositionAllToasts() {
    const toasts = document.querySelectorAll("toast-element");
    const spaceBetweenToasts = 10; // Margin between toasts in pixels
    let cumulativeHeight = 0;

    // Convert NodeList to Array and reverse to start from the bottom
    // This way we process toasts from bottom to top
    Array.from(toasts)
      .reverse()
      .forEach((toast) => {
        // Position this toast above the previous ones
        toast.style.bottom = `${20 + cumulativeHeight}px`;
        toast.style.right = "20px";

        // Add this toast's height to the cumulative height
        cumulativeHeight += toast.scrollHeight + spaceBetweenToasts;
      });
  }
}

// Helper function
function showToast(options = {}) {
  const {
    message = "",
    type = "info",
    duration = 3000,
    autoHide = true,
  } = options;

  const toast = document.createElement("toast-element");
  toast.message = message;
  toast.type = type;
  toast.duration = duration;
  toast.autoHide = autoHide;

  document.body.appendChild(toast);
  toast.show();

  toast.addEventListener("toast:hidden", () => {
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 200);
  });

  return toast;
}

// Export for CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ToastElement, showToast };
}

// Export for global usage
if (typeof window !== "undefined") {
  window.ToastElement = ToastElement;
  window.showToast = showToast;
}

var toggleTemplate = "<button class=\"toggle\"><lucide-icon name=\"sun\" variant=\"primary\" class=\"light\"></lucide-icon><lucide-icon name=\"moon\" variant=\"primary\" class=\"dark\"></lucide-icon></button>";

var toggleStyles = ".toggle{background:var(--surface);border:1px solid var(--border);padding:0.5rem 1rem;border-radius:0.5rem;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;}.dark{display:none;}:host-context([data-theme=\"dark\"]) .light{display:none;}:host-context([data-theme=\"dark\"]) .dark{display:inline;}";

class ThemeToggle extends HTMLElement {
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

var iconTemplate = "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></svg>";

var iconStyles = ":host{display:inline-flex;width:24px;height:24px;}:host([size=\"small\"]){width:16px;height:16px;}:host([size=\"large\"]){width:32px;height:32px;}.icon{width:100%;height:100%;color:var(--icon-color,currentColor);transition:all 0.2s ease;}:host([variant=\"primary\"]) .icon{color:var(--primary,#3b82f6);}:host([variant=\"muted\"]) .icon{color:var(--text-secondary,#6b7280);}";

/**
 * Available icons these are copied from Lucide https://lucide.dev/icons/
 *
 * To add a new one just pick a name copy the contents of the svg here. Only include the
 * contents of the svg and remove the <svg *></svg> tags as that is added by the component.
 */
const icons = {
  menu: '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
  settings:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  // Add toast notification icons
  success:
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
  info: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
  warning:
    '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
  error:
    '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>',
  x: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
};

/**
 * LucideIcon web component
 * @element lucide-icon
 * @attr {string} name - Icon name
 * @attr {string} size - Icon size: 'small', 'default', 'large'
 * @attr {string} variant - Icon variant: 'primary', 'success', 'error', 'info', 'warning', 'muted'
 * @attr {string} color - Custom icon color
 */
class LucideIcon extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Apply styles and load template
    applyStyles(this.shadowRoot, iconStyles, document.adoptedStyleSheets);
    loadTemplate(iconTemplate, this.shadowRoot);

    // Get the SVG element
    this.svgElement = this.shadowRoot.querySelector("svg");
  }

  static get observedAttributes() {
    return ["name", "size", "variant", "color"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const name = this.getAttribute("name");
    const color = this.getAttribute("color");
    const iconPath = icons[name] || "";

    // Update SVG content with the selected icon
    if (this.svgElement) {
      this.svgElement.innerHTML = iconPath;

      // Apply custom color if specified
      if (color) {
        this.svgElement.style.color = color;
      } else {
        this.svgElement.style.color = "";
      }
    }
  }
}

// Form error handling with PicoCSS
class FormErrorHandler {
  /**
   * Handles API error responses by adding error attributes to form elements
   * @param {Object} response - The error response object from the API
   */
  static handleErrors(response) {
    // Check if there are errors to process
    if (!response.errors) {
      return;
    }

    // Reset any existing errors first
    FormErrorHandler.clearErrors();

    // Process each error
    response.errors.forEach((error) => {
      if (!error.extensions || !error.extensions.field) {
        return;
      }

      // Find the input element
      const fieldName = error.extensions.field;
      const inputElement = document.querySelector(`[name="${fieldName}"]`);

      if (!inputElement) {
        console.warn(
          `Input element with name "${fieldName}" not found. Adding error to form.`,
        );
        return;
      }

      // Use parent element (which would be the form field container in PicoCSS)
      const parentElement = inputElement.parentElement;
      if (!parentElement) {
        console.warn(
          `Parent element for input "${fieldName}" not found. Adding error directly.`,
        );
        FormErrorHandler.addError(inputElement, error.message);
        return;
      }

      // Add error to the parent element
      FormErrorHandler.addError(parentElement, error.message);
    });
  }

  /**
   * Adds an error message to an element using PicoCSS ARIA attributes
   * @param {HTMLElement} element - The element to add the error to
   * @param {string} message - The error message
   */
  static addError(element, message) {
    // Find the input element within the container (if element is not the input itself)
    const inputElement =
      element.tagName === "INPUT"
        ? element
        : element.querySelector("input, select, textarea");

    if (inputElement) {
      // Set ARIA attributes for PicoCSS
      inputElement.setAttribute("aria-invalid", "true");

      // Generate a unique ID for the helper element if needed
      const helperId = `${inputElement.name}-helper`;
      inputElement.setAttribute("aria-describedby", helperId);

      // Look for existing small/helper element
      let helperElement = document.getElementById(helperId);

      // If no helper element exists, create one
      if (!helperElement) {
        helperElement = document.createElement("small");
        helperElement.id = helperId;

        // Add the small element after the input
        if (inputElement.nextElementSibling) {
          inputElement.parentNode.insertBefore(
            helperElement,
            inputElement.nextElementSibling,
          );
        } else {
          inputElement.parentNode.appendChild(helperElement);
        }
      }

      // Store original message if this is the first error
      if (!helperElement.dataset.originalText) {
        helperElement.dataset.originalText = helperElement.textContent;
      }

      // Set the error message
      helperElement.textContent = message;
    } else {
      // For form level errors, create a message at the top
      const errorMsg = document.createElement("p");
      errorMsg.className = "error-message";
      errorMsg.setAttribute("role", "alert");
      errorMsg.textContent = message;

      // Add to the beginning of the form
      element.prepend(errorMsg);
    }
  }

  /**
   * Clear all existing error messages and restore original helper text
   */
  static clearErrors() {
    // Reset all invalid inputs
    document.querySelectorAll('[aria-invalid="true"]').forEach((input) => {
      // Remove the attribute completely rather than setting to false
      // This returns the input to its initial state rather than marking as explicitly valid
      input.removeAttribute("aria-invalid");

      // Get the helper element
      const helperId = input.getAttribute("aria-describedby");
      if (helperId) {
        const helperElement = document.getElementById(helperId);
        if (helperElement && helperElement.dataset.originalText) {
          // Restore original helper text
          helperElement.textContent = helperElement.dataset.originalText;
          delete helperElement.dataset.originalText;
        }
      }
    });

    // Remove any form-level error messages
    document.querySelectorAll(".error-message").forEach((errMsg) => {
      errMsg.remove();
    });
  }
}

// Create a utility class for handling GraphQL responses
class GraphQLToastHandler {
  /**
   * Creates and displays toast notifications for GraphQL errors or success messages
   * @param {Object} response - The GraphQL response object with data, errors, and extensions properties
   * @param {number} [duration=4000] - How long the toast should stay visible (ms)
   * @returns {Object} - The data portion of the response
   */
  static handleResponse(response, duration = 4000) {
    // Check if there are errors to display
    if (response.errors && response.errors.length > 0) {
      // Display each error as a separate toast
      response.errors.forEach((error) => {
        showToast({
          type: "error",
          message: error.message || "An error occurred",
          duration,
        });
      });
    } else if (response.extensions && response.extensions.successMessage) {
      // Display success message if provided in extensions
      showToast({
        type: "success",
        message: response.extensions.successMessage,
        duration,
      });
    }

    // Return the data part of the response
    return response.data;
  }

  /**
   * Add HTMX extension for GraphQL responses
   */
  static registerHtmxExtension() {
    // Only add if HTMX is available
    if (typeof htmx === "undefined") {
      console.warn("HTMX not found, GraphQL extension not loaded");
      return;
    }

    // Register the HTMX extension
    htmx.defineExtension("graphql-toast", {
      onEvent: function (name, evt) {
        // Handle JSON responses for HTMX requests
        if (name === "htmx:configRequest") {
          evt.detail.headers["Accept"] = "application/json";
          // Add all the params to the request
          const params = new URLSearchParams(document.location.search);
          for (const [key, value] of params.entries()) {
            evt.detail.parameters[key] = value;
          }
        }

        if (name === "htmx:beforeRequest") {
          FormErrorHandler.clearErrors();
        }

        if (name === "htmx:beforeSwap") {
          const xhr = evt.detail.xhr;

          // Check if this is a JSON response
          if (
            xhr.getResponseHeader("Content-Type")?.includes("application/json")
          ) {
            try {
              // Parse JSON response
              const response = JSON.parse(xhr.responseText);

              // Check if this looks like a GraphQL response (has data or errors)
              if (
                response &&
                (response.data !== undefined || response.errors)
              ) {
                // Handle the GraphQL response notifications
                GraphQLToastHandler.handleResponse(response);
                FormErrorHandler.handleErrors(response);

                // Check if there's HTML in the extensions
                if (response.extensions && response.extensions.html) {
                  // Use the HTML from extensions for the swap
                  evt.detail.serverResponse = response.extensions.html;
                } else if (!response.data && response.errors) {
                  // If there's an error but no HTML or data, prevent the swap
                  evt.detail.shouldSwap = false;
                  return true;
                }
              }
            } catch (e) {
              console.error("Error processing JSON response:", e);
            }
          }
        }
      },
    });
  }
}

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

// Export for global usage
window.UILibrary = UILibrary;

export { UILibrary as default };
//# sourceMappingURL=ui-library.esm.js.map
