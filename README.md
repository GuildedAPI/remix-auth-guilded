# remix-auth-guilded

remix-auth strategy for Authlink, an OAuth2 provider for Guilded. If you prefer Next.js, see [next-auth-guilded](https://github.com/GuildedAPI/next-auth-guilded).

## Supported runtimes

| Runtime    | Has Support |
| ---------- | ----------- |
| Node.js    | ✅          |
| Cloudflare | ✅          |

## How to use

### Create an Authlink application

Visit https://authlink.app/dev/apps, press "new", and connect your Guilded bot to finalize the application. Add a redirect URI and note down your client ID and secret (you will need to press "reset" to generate a secret). You may also configure a vanity code with preconfigured options, though beware that these can be overridden.

### Create session storage

```ts
// app/session.server.ts
import { createCookieSessionStorage } from "@remix-run/node";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: ["s3cr3t"],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
```

### Create the strategy instance

```ts
// app/auth.server.ts
import { Authenticator } from "remix-auth";
import { GuildedStrategy, type GuildedUser } from "remix-auth-guilded";
import { sessionStorage } from "~/session.server";

export interface GuildedAuth {
  id: string;
  name: string;
  avatar: string | null;
  banner: string | null;
  accessToken: string;
  refreshToken: string;
}

export const auth = new Authenticator<DiscordAuth>(sessionStorage);

const guildedStrategy = new GuildedStrategy(
  {
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    redirectUri: "https://example.com/auth/guilded/callback",
    scope: ["identify"],
  },
  // OR { clientId, clientSecret, vanity: "..." }
  async ({
    accessToken,
    refreshToken,
    extraParams,
    profile,
  }): Promise<DiscordAuth> => {
    // This package does not fetch the user for you
    const user = await this.getUser(accessToken)

    // This goes into your sessionStorage and is also returned by
    // this method if successRedirect is not provided
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      banner: user.banner,
      accessToken,
      refreshToken,
    };
  },
);

auth.use(guildedStrategy);
```

### Use in a loader

```ts
// app/routes/auth.guilded.callback.tsx
import type { LoaderFunction } from "@remix-run/node";
import { auth } from "~/auth.server";

export const loader: LoaderFunction = ({ request }) => {
  return auth.authenticate("guilded", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
```

## Attribution

Design elements & examples from [remix-auth-discord](https://github.com/JonnyBnator/remix-auth-discord).
