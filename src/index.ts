import {
  OAuth2Strategy,
  type OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";
import type { GuildedStrategyOptions, GuildedUser } from "./types";
import type { StrategyVerifyCallback } from "remix-auth";

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

  // async authenticate(
  //   request: Request,
  //   sessionStorage: SessionStorage,
  //   options: AuthenticateOptions,
  // ): Promise<User> {
  //   // Implementing some logic from sergiodxa/remix-auth-oauth2 here
  //   const session = await sessionStorage.getSession(
  //     request.headers.get("Cookie"),
  //   );

  //   let user: User | null = session.get(options.sessionKey) ?? null;
  //   if (user) {
  //     return this.success(user, request, sessionStorage, options);
  //   }

  //   const params = new URL(request.url).searchParams;
  //   const code = params.get("code");
  //   if (!code) {
  //     const state = generateState();
  //     session.flash("oauth2:state", state);

  //     const authOptions = new URLSearchParams({ state });
  //     if (!("vanity" in this.options)) {
  //       authOptions.set("client_id", this.options.clientId);
  //     }
  //     if (this.options.prompt) {
  //       authOptions.set("prompt", this.options.prompt);
  //     }
  //     if (this.options.redirectUri) {
  //       authOptions.set("redirect_uri", this.options.redirectUri);
  //     }
  //     if (this.options.scope) {
  //       authOptions.set("scope", this.options.scope.join(" "));
  //     }

  //     throw redirect(
  //       `https://authlink.app/${
  //         "vanity" in this.options ? `a/${this.options.vanity}` : "auth"
  //       }${authOptions.size === 0 ? "" : `?${authOptions}`}`,
  //       {
  //         headers: {
  //           "Set-Cookie": await sessionStorage.commitSession(session),
  //         },
  //       },
  //     );
  //   }

  //   const state = params.get("state");
  //   const storedState = session.get("oauth2:state");
  //   if (storedState && state !== storedState) {
  //     throw await this.failure(
  //       "State did not match expected value",
  //       request,
  //       sessionStorage,
  //       options,
  //     );
  //   }

  //   const authResponse = await fetch(`${API_BASE}/token`, {
  //     method: "POST",
  //     body: new URLSearchParams({
  //       client_id: this.options.clientId,
  //       client_secret: this.options.clientSecret,
  //       grant_type: "authorization_code",
  //       code,
  //     }),
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //   });
  //   if (!authResponse.ok) {
  //     throw await this.failure(
  //       `Bad access token response: ${
  //         authResponse.statusText
  //       } - ${await authResponse.text()}`,
  //       request,
  //       sessionStorage,
  //       options,
  //     );
  //   }
  //   const tokenData = (await authResponse.json()) as GuildedAccessTokenResponse;
  //   return this.success(tokenData, request, sessionStorage, options);

  //   // const user = await this.getUser(tokenData.access_token);
  //   // if (user.id) {
  //   //   return await this.success(user, request, sessionStorage, options);
  //   // }

  //   // throw await this.failure(
  //   //   JSON.stringify(user),
  //   //   request,
  //   //   sessionStorage,
  //   //   options,
  //   // );
  // }

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
