import { IdentityProvider } from "../../types";
import qs from "qs";

import config from "../../config";
const {
  KC_AUTHORIZATION_URL,
  BASE_PATH,
  LOGIN_CALLBACK,
  SSO_CLIENT_ID,
  BACKEND_URL,
} = config;

export const getLoginURL = (kc_idp_hint: IdentityProvider) => {
  const params = {
    client_id: SSO_CLIENT_ID,
    response_type: "code",
    scope: "email+openid",
    redirect_uri: encodeURIComponent(
      `${BACKEND_URL}${BASE_PATH}${LOGIN_CALLBACK}`
    ),
    kc_idp_hint,
  };

  return `${KC_AUTHORIZATION_URL}?${qs.stringify(params, { encode: false })}`;
};
