import { showToast } from "./toast/toast";

// Form error handling with PicoCSS
export class FormErrorHandler {
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
export class GraphQLToastHandler {
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
