document.addEventListener("DOMContentLoaded", function () {
  var expandButtons = document.querySelectorAll(".endpoint-inner-expand-arrow");
  var executeButtons = document.querySelectorAll(".execute-button");

  expandButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var detailsId = this.getAttribute("data-index");
      var details = document.getElementById("details-" + detailsId);
      var svgs = this.querySelectorAll(".arrow-svg");

      // Toggle details visibility
      var isDisplayed = details.style.display === "block";
      details.style.display = isDisplayed ? "none" : "block";

      // Switch SVG visibility
      svgs[0].style.display = isDisplayed ? "block" : "none";
      svgs[1].style.display = isDisplayed ? "none" : "block";
    });
  });

  executeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var endpointsData = document
        .getElementById("endpoint-data")
        .getAttribute("data-endpoints");
      var endpoints = JSON.parse(endpointsData);

      var index = this.getAttribute("id").split("-").slice(-2).join("-");
      var module = index.split("-")[0];
      var endpointIndex = index.split("-")[1];
      var endpoint = endpoints[module].endpoints[endpointIndex];
      var route =
        endpoint.route === "/" ? "/" + module : "/" + module + endpoint.route;

      var executeResponseDiv = document.getElementById(
        "execute-response-" + index
      );
      var statusCodeElement = document.getElementById(
        "execute-response-status-code-" + index
      );
      var responseBodyElement = document.getElementById(
        "execute-response-body-code-" + index
      );

      // Show loading text
      const originalText = button.textContent;
      const loadingIntervalId = setLoadingText(
        button,
        "Executing",
        originalText
      );

      var accessToken = getCookie("access_token");
      var headers = {};

      if (endpoint.protected && accessToken) {
        headers["Authorization"] = "Bearer " + accessToken;
      }

      // Handle route and query parameters
      var allParamsFilled = true;
      var queryString = "";

      // Replace route parameters with user inputs and check for required params
      var routeParams = endpoint.route.match(/:[a-zA-Z]+/g);
      if (routeParams) {
        routeParams.forEach(function (param) {
          var inputElement = document.getElementById(
            "input-" + module + "-" + endpointIndex + "-" + param.substring(1)
          );
          if (inputElement && inputElement.value) {
            route = route.replace(param, inputElement.value);
          } else {
            allParamsFilled = false; // Mark as incomplete if a required route param is missing
          }
        });
      }

      // Handle query parameters
      var queryParams = endpoint.controller.query;
      if (queryParams) {
        var queryParts = [];
        Object.entries(queryParams).forEach(function ([
          paramName,
          paramDetails,
        ]) {
          var inputElement = document.getElementById(
            "query-" + module + "-" + endpointIndex + "-" + paramName
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

const copyToClipboard = (text) => {
  const tempInput = document.createElement("input");
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
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

const login = () => {
  window.location.href = "/docs/login?idp=idir";
};
