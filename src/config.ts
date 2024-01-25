const {
  SSO_AUTH_SERVER_URI = "https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect",
  SSO_CLIENT_ID = "",
  SSO_CLIENT_SECRET = "",
  BACKEND_URL = "",
  DEBUG = "false",
  VERBOSE_DEBUG = "false",
} = process.env;

if (DEBUG === "true" && VERBOSE_DEBUG == "true") {
  console.log(`DEBUG: 'citz-imb-kc-express-api-docs' environment variables:
  SSO_AUTH_SERVER_URI=${SSO_AUTH_SERVER_URI}
  SSO_CLIENT_ID=${SSO_CLIENT_ID}
  SSO_CLIENT_SECRET=${SSO_CLIENT_SECRET}
  BACKEND_URL=${BACKEND_URL}`);
}

// Exports
export default {
  KC_AUTHORIZATION_URL: `${SSO_AUTH_SERVER_URI}/auth`,
  KC_TOKEN_URL: `${SSO_AUTH_SERVER_URI}/token`,
  LOGIN: "/login",
  LOGIN_CALLBACK: "/login/callback",
  BASE_PATH: "/docs",
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
  BACKEND_URL,
  DEBUG,
  VERBOSE_DEBUG,
  TITLE: "API Documentation",
  DESCRIPTION:
    "Welcome to our API documentation. Here you'll find details about our API's functionalities. This documentation is automatically generated based on the api codebase.",
};
