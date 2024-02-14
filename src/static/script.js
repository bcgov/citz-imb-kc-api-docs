document.addEventListener("DOMContentLoaded", function () {
  const setLoadingText = (button, loadingText, originalText) => {
    let count = 0;
    const maxDots = 3;
    const intervalId = setInterval(() => {
      if (count > maxDots) {
        button.textContent = originalText;
        clearInterval(intervalId);
      } else {
        button.textContent = `${loadingText} ${".".repeat(count)}`;
        count++;
      }
    }, 200); // Change the dot every 500 milliseconds

    return intervalId;
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return undefined;
  };

  const syntaxHighlightJson = (json) => {
    if (typeof json !== "string") {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return json.replace(
      /(\{|\}|\[|\])|("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")(\s*:\s*)?|(\b-?\d+(?:\.\d*)?([eE][+-]?\d+)?\b)|true|false|null/g,
      (match, p1, p2, p3, p4, p5) => {
        let cls = "json-language-number";
        if (p1) {
          // Bracket
          cls = "json-language-bracket";
        } else if (p4) {
          // Property name
          cls = "json-language-property";
        } else if (p2) {
          // String value
          cls = "json-language-string";
        } else if (/true|false|null/.test(match)) {
          // Boolean or null
          cls = "json-language-boolean";
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  const executeButtons = document.querySelectorAll(".execute-button");
  const endpointExpandButtons = document.querySelectorAll(
    ".expand-arrow-button"
  );
  const moduleExpandButtons = document.querySelectorAll(
    ".module-expand-arrow-button"
  );

  moduleExpandButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const detailsId = this.getAttribute("data-index");
      const details = document.getElementById("module-details-" + detailsId);
      const svgs = this.querySelectorAll(".module-arrow-svg");

      // Toggle details visibility
      let isDisplayed = details.style.display === "block";
      details.style.display = isDisplayed ? "none" : "block";

      // Switch SVG visibility
      svgs[0].style.display = isDisplayed ? "block" : "none";
      svgs[1].style.display = isDisplayed ? "none" : "block";
    });
  });

  endpointExpandButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const detailsId = this.getAttribute("data-index");
      const details = document.getElementById("details-" + detailsId);
      const svgs = this.querySelectorAll(".arrow-svg");

      // Toggle details visibility
      let isDisplayed = details.style.display === "block";
      details.style.display = isDisplayed ? "none" : "block";

      // Switch SVG visibility
      svgs[0].style.display = isDisplayed ? "block" : "none";
      svgs[1].style.display = isDisplayed ? "none" : "block";
    });
  });

  executeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const endpointsData = document
        .getElementById("endpoint-data")
        .getAttribute("data-endpoints");
      const endpoints = JSON.parse(endpointsData);

      const index = this.getAttribute("id").split("-").slice(-2).join("-");
      const module = index.split("-")[0];
      const endpointIndex = index.split("-")[1];
      const endpoint = endpoints[module].endpoints[endpointIndex];
      let route =
        endpoint.route === "/" ? "/" + module : "/" + module + endpoint.route;

      const executeResponseDiv = document.getElementById(
        "execute-response-" + index
      );
      const statusCodeElement = document.getElementById(
        "execute-response-status-code-" + index
      );
      const responseBodyElement = document.getElementById(
        "execute-response-body-code-" + index
      );

      // Show loading text
      const originalText = button.textContent;
      const loadingIntervalId = setLoadingText(
        button,
        "Executing",
        originalText
      );

      const accessToken = getCookie("access_token");
      let headers = {};

      if (endpoints[module].protected && accessToken) {
        headers["Authorization"] = "Bearer " + accessToken;
      }

      // Handle route and query parameters
      let allParamsFilled = true;
      let queryString = "";

      // Replace route parameters with user inputs and check for required params
      const routeParams = endpoint.route.match(/:[a-zA-Z]+/g);
      if (routeParams) {
        routeParams.forEach(function (param) {
          const inputElement = document.getElementById(
            "pathParam-input-" +
              module +
              "-" +
              endpointIndex +
              "-" +
              param.substring(1)
          );
          if (inputElement && inputElement.value) {
            route = route.replace(param, inputElement.value);
          } else {
            allParamsFilled = false; // Mark as incomplete if a required route param is missing
          }
        });
      }

      // Handle query parameters
      const queryParams = endpoint.controller.query;
      if (queryParams) {
        let queryParts = [];
        Object.entries(queryParams).forEach(function ([
          paramName,
          paramDetails,
        ]) {
          const inputElement = document.getElementById(
            "query-input-" + module + "-" + endpointIndex + "-" + paramName
          );
          if (inputElement) {
            if (paramDetails.required && !inputElement.value) {
              allParamsFilled = false; // Mark as incomplete if a required query param is missing
            } else if (inputElement.value) {
              queryParts.push(
                encodeURIComponent(paramName) +
                  "=" +
                  encodeURIComponent(inputElement.value)
              );
            }
          }
        });
        if (queryParts.length > 0) {
          queryString = "?" + queryParts.join("&");
        }
      }

      // Append query string to route
      route += queryString;

      if (!allParamsFilled) {
        clearInterval(loadingIntervalId);
        button.textContent = originalText; // Reset button text.
        alert("Please fill in all required parameters.");
        return;
      }

      fetch(route, {
        method: endpoint.method,
        headers: headers,
      })
        .then((response) => {
          clearInterval(loadingIntervalId);
          button.textContent = originalText; // Reset button text.
          statusCodeElement.textContent = response.status;
          executeResponseDiv.style.display =
            executeResponseDiv.style.display === "none" ? "block" : "none";

          // Check response content type
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return response.json().then((data) => {
              responseBodyElement.innerHTML = syntaxHighlightJson(data);
            });
          } else {
            return response.text().then((text) => {
              responseBodyElement.textContent = text;
            });
          }
        })
        .then(() => {
          executeResponseDiv.style.display = "block";
        })
        .catch((error) => {
          clearInterval(loadingIntervalId);
          button.textContent = originalText; // Reset button text.
          console.error("Error:", error);
          responseBodyElement.textContent = "Error: " + error.message;
          executeResponseDiv.style.display = "block";
        });
    });
  });
});

const login = () => {
  window.location.href = "/docs/login?idp=idir";
};

const copyToClipboard = (text) => {
  const tempInput = document.createElement("input");
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
};
