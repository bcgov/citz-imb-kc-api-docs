import { encodeJWT } from "./jwt";
import qs from "qs";

import config from "../../config";
const {
  KC_TOKEN_URL,
  BASE_PATH,
  LOGIN_CALLBACK,
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
  BACKEND_URL,
} = config;

export const getTokens = async (code: string) => {
  const params = {
    grant_type: "authorization_code",
    client_id: SSO_CLIENT_ID,
    redirect_uri: BACKEND_URL + BASE_PATH + LOGIN_CALLBACK,
    code,
  };

  const headers = {
    Authorization: `Basic ${encodeJWT(
      `${SSO_CLIENT_ID}:${SSO_CLIENT_SECRET}`
    )}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const response = await fetch(KC_TOKEN_URL, {
    method: "POST",
    headers,
    body: qs.stringify(params),
  });

  const { id_token, access_token, refresh_token, refresh_expires_in } =
    await response.json();

  return {
    id_token,
    access_token,
    refresh_token,
    refresh_expires_in,
  };
};
