import type { StrategyVerifyCallback } from "remix-auth";
import {
  OAuth2Strategy,
  type OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";
import type { GuildedStrategyOptions, GuildedUser } from "./types";

const AUTHLINK = "https://authlink.app";
const API_V = "1";
const API_BASE = `${AUTHLINK}/api/v${API_V}`;

/**
 * You can ignore everything here except for `_json`,
 * which contains the actual Guilded user data
 */
export interface GuildedProfile {
  provider: "guilded";
  _json: GuildedUser;
}

export interface GuildedExtraParams extends Record<string, string | number> {
  /** The user's access token */
  access_token: string;
  /** The user's refresh token, which can be used to refresh the access token when it expires */
  refresh_token: string;
  /** Always `Bearer` */
  token_type: string;
  /** Seconds until `access_token` expires */
  expires_in: number;
  /** The scopes your application was authorized for, space-separated */
  scope: string;
}

export class GuildedStrategy<User> extends OAuth2Strategy<
  User,
  GuildedProfile,
  GuildedExtraParams
> {
  name = "guilded";
  private options: GuildedStrategyOptions;
  protected useBasicAuthenticationHeader = false;

  constructor(
    options: GuildedStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<GuildedProfile, GuildedExtraParams>
    >,
  ) {
    super(
      {
        authorizationURL: options.vanity
          ? `${AUTHLINK}/a/${options.vanity}`
          : `${AUTHLINK}/auth`,
        tokenURL: `${API_BASE}/token`,
        clientID: options.clientId,
        clientSecret: options.clientSecret,
        callbackURL: options.redirectUri ?? "",
      },
      verify,
    );
    this.options = options;
  }

  protected authorizationParams(params: URLSearchParams): URLSearchParams {
    if (!this.options.vanity) {
      params.set("client_id", this.options.clientId);
    } else {
      params.delete("client_id");
    }
    if (this.options.prompt) {
      params.set("prompt", this.options.prompt);
    }
    if (this.options.redirectUri) {
      params.set("redirect_uri", this.options.redirectUri);
    } else {
      params.delete("redirect_uri");
    }
    if (this.options.scope) {
      params.set("scope", this.options.scope.join(" "));
    } else {
      params.delete("scope");
    }

    return params;
  }

  protected async userProfile(accessToken: string): Promise<GuildedProfile> {
    const response = await fetch(`${API_BASE}/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const raw: GuildedUser = await response.json();
    return {
      provider: "guilded",
      _json: raw,
    };
  }
}
