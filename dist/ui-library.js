var UILibrary = (function () {
  'use strict';

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

  var toastTemplate = "<div class=\"toast\"><div class=\"toast-icon\"><svg class=\"icon-success\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\"/></svg> <svg class=\"icon-error\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z\"/></svg> <svg class=\"icon-info\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z\"/></svg> <svg class=\"icon-warning\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z\"/></svg></div><span class=\"message\"></span> <button class=\"close-btn\" aria-label=\"Close\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z\"/></svg></button></div>";

  var toastStyles = ":host{--toast-success-color:var(--pico-color-success,#43a047);--toast-error-color:var(--pico-color-error,#d32f2f);--toast-info-color:var(--pico-primary,#1976d2);--toast-warning-color:var(--pico-color-warning,#f57c00);--toast-text-color:var(--pico-color-text-inverse,white);--toast-shadow:var(--pico-card-shadow,0 3px 10px rgba(0,0,0,0.2));--toast-border-radius:var(--pico-border-radius,4px);--toast-font-family:var(--pico-font-family,sans-serif);--toast-font-size:var(--pico-font-size,16px);position:fixed;bottom:20px;right:20px;z-index:1000;visibility:hidden;min-width:250px;max-width:320px;padding:var(--pico-spacing,12px 16px);border-radius:var(--toast-border-radius);font-family:var(--toast-font-family);font-size:var(--toast-font-size);box-shadow:var(--toast-shadow);transition:transform 0.2s ease-out,opacity 0.2s ease-out;transform:translateY(30px);opacity:0;}:host(.visible){visibility:visible;transform:translateY(0);opacity:1;}:host(.success){background-color:var(--toast-success-color);color:var(--toast-text-color);}:host(.error){background-color:var(--toast-error-color);color:var(--toast-text-color);}:host(.info){background-color:var(--toast-info-color);color:var(--toast-text-color);}:host(.warning){background-color:var(--toast-warning-color);color:var(--toast-text-color);}.content{display:flex;align-items:center;gap:8px;}.message{flex-grow:1;}button{--pico-button-padding:0;background:transparent;border:none;color:inherit;cursor:pointer;margin-left:auto;opacity:0.7;transition:opacity 0.2s;display:flex;align-items:center;justify-content:center;padding:0;}button:hover{opacity:1;}svg{width:20px;height:20px;fill:currentColor;}@media (max-width:600px){.toast{min-width:auto;max-width:none;width:calc(100vw - 40px);}}";

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
      this._type = "info";

      // Get required elements
      this.messageElement = this.shadowRoot.querySelector(".message");
      this.closeButton = this.shadowRoot.querySelector(".close-btn");

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
     * Type getter
     */
    get type() {
      return this._type;
    }

    /**
     * Type setter
     */
    set type(value) {
      if (this._type) {
        this.classList.remove(this._type);
      }

      this._type = value;
      this.classList.add(value);
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
      if (this._timerId) {
        clearTimeout(this._timerId);
        this._timerId = null;
      }

      this.classList.add("visible");

      if (this._autoHide) {
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
      this.classList.remove("visible");

      if (this._timerId) {
        clearTimeout(this._timerId);
        this._timerId = null;
      }

      this.dispatchEvent(new CustomEvent("toast-hidden"));

      return this;
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

    toast.addEventListener("toast-hidden", () => {
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

  // Form error handling with PicoCSS
  class FormErrorHandler {
    /**
     * Handles API error responses by adding error attributes to form elements
     * @param {Object} errorResponse - The error response object from the API
     */
    static handleErrors(errorResponse) {
      // Check if there are errors to process
      if (!errorResponse || !errorResponse.errors) {
        console.error("Invalid error response format");
        return;
      }

      // Reset any existing errors first
      FormErrorHandler.clearErrors();

      // Process each form's errors
      Object.keys(errorResponse.errors).forEach((formKey) => {
        const formErrors = errorResponse.errors[formKey];

        // Process each error for this form
        formErrors.forEach((error) => {
          if (!error.field || !error.message) {
            console.warn("Invalid error format:", error);
            return;
          }

          // Find the input element
          const fieldName = error.field;
          const inputElement = document.querySelector(`[name="${fieldName}"]`);

          if (!inputElement) {
            console.warn(
              `Input element with name "${error.field}" not found. Adding error to form.`,
            );

            // Find the form element
            const formElement = document.querySelector(
              `form[name="${formKey}"], form#${formKey}, form[data-form-id="${formKey}"]`,
            );
            if (!formElement) {
              // If we can't find the form, look for a div with the form's ID
              const formContainer = document.getElementById(formKey);
              if (!formContainer) {
                console.error(
                  `Neither form nor container for "${formKey}" found`,
                );
                return;
              }

              // Add the error to the form container
              FormErrorHandler.addError(formContainer, error.message);
              return;
            }

            // Add the error to the form
            FormErrorHandler.addError(formElement, error.message);
            return;
          }

          // Use parent element (which would be the form field container in PicoCSS)
          const parentElement = inputElement.parentElement;
          if (!parentElement) {
            console.warn(
              `Parent element for input "${error.field}" not found. Adding error directly.`,
            );
            FormErrorHandler.addError(inputElement, error.message);
            return;
          }

          // Add error to the parent element
          FormErrorHandler.addError(parentElement, error.message);
        });
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
          GraphQLToastHandler.create(
            "error",
            error.message || "An error occurred",
            duration,
          );
        });
      } else if (response.extensions && response.extensions.successMessage) {
        // Display success message if provided in extensions
        GraphQLToastHandler.create(
          "success",
          response.extensions.successMessage,
          duration,
        );
      }

      // Return the data part of the response
      return response.data;
    }

    /**
     * Creates and shows a toast notification
     * @param {string} type - Toast type: 'success', 'error', or 'info'
     * @param {string} message - Message to display
     * @param {number} duration - How long to show the toast in ms
     * @returns {HTMLElement} - The created toast element
     */
    static create(type, message, duration = 4000) {
      const toast = document.createElement("graphql-toast");
      toast.setAttribute("type", type);
      toast.setAttribute("message", message);
      toast.setAttribute("duration", duration.toString());
      document.body.appendChild(toast);
      return toast;
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

                  // Check if there's HTML in the extensions
                  if (response.extensions && response.extensions.html) {
                    // Use the HTML from extensions for the swap
                    evt.detail.serverResponse = response.extensions.html;
                  } else if (!response.data && response.errors) {
                    // If there's an error but no HTML or data, prevent the swap
                    evt.detail.shouldSwap = false;
                    return true;
                  }

                  if (response.extensions && response.extensions.errors) {
                    FormErrorHandler.handleErrors(response.extensions);
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
      const picoResponse = await fetch(
        "https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css",
      );
      const picoCSS = await picoResponse.text();

      const picoStyleSheet = new CSSStyleSheet();
      picoStyleSheet.replaceSync(picoCSS);
      document.adoptedStyleSheets = [picoStyleSheet];

      // 2. Add your custom styles
      const customStyleSheet = new CSSStyleSheet();
      customStyleSheet.replaceSync(`
      :root {
        --toast-border-radius: 8px;
        /* More custom variables... */
      }
    `);

      // 3. Apply stylesheets to document
      document.adoptedStyleSheets = [picoStyleSheet, customStyleSheet];

      // 4. Register web components if not already registered
      if (!customElements.get("toast-element")) {
        customElements.define("toast-element", ToastElement);
      }

      if (!customElements.get("theme-toggle")) {
        customElements.define("theme-toggle", ThemeToggle);
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

  return UILibrary;

})();
//# sourceMappingURL=ui-library.js.map
