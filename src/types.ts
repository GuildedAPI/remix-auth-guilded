export type GuildedStrategyScope =
  | "identify"
  | "servers"
  | "servers.members.read";

export type GuildedPromptType = "consent" | "none";

interface GuildedStrategyUrlOptions {
  /** The client ID of the Authlink application/Guilded bot */
  clientId: string;
  /** The client secret of the Authlink application */
  clientSecret: string;
  /** The URI to redirect to after authorization */
  redirectUri: string;
  /** Skips manual reauthorization if the user has aleady allowed the selected scopes */
  prompt?: GuildedPromptType;
  /** The scopes to request from the user */
  scope?: GuildedStrategyScope[];
}

export type GuildedStrategyOptions =
  | (Pick<GuildedStrategyUrlOptions, "clientId" | "clientSecret"> & {
      /**
       * When a vanity is provided, all other parameters are optional, but
       * are able to override the options set for the vanity.
       */
      vanity: string;
    } & Partial<
        Pick<GuildedStrategyUrlOptions, "prompt" | "redirectUri" | "scope">
      >)
  | ({ vanity?: string } & GuildedStrategyUrlOptions);

export interface GuildedUserAlias {
  alias: string;
  discriminator: string | null;
  name: string;
  createdAt: string;
  /** Guilded user ID */
  userId: string;
  /** @see https://guildedapi.com/resources/user/#game-ids */
  gameId: number;
  socialLinkSource: string | null;
  additionalInfo: Record<string, unknown>;
  editedAt: string;
  socialLinkHandle: string | null;
  playerInfo: Record<string, unknown> | null;
}

export interface GuildedUserStatus {
  content: string | null;
  customReactionId: number;
  customReaction: {
    id: number;
    name: string;
    png: string | null;
    webp: string | null;
    apng: string | null;
  };
}

export enum GuildedUserPresence {
  Online = 1,
  Idle = 2,
  DoNotDisturb = 3,
  Offline = 4,
}

export interface GuildedTransientStatus {
  id: number;
  /** @see https://guildedapi.com/resources/user/#game-ids */
  gameId: number | null;
  name?: string;
  type: string;
  startedAt: string;
  guildedClientId: string;
}

export interface GuildedUser {
  id: string;
  name: string;
  subdomain: string | null;
  aliases: GuildedUserAlias[];
  avatar: string | null;
  banner: string | null;
  createdAt: string;
  userStatus: GuildedUserStatus | null;
  moderationStatus: string | null;
  aboutInfo: {
    bio?: string;
    tagLine?: string;
  };
  lastOnline: string;
  userPresenceStatus: GuildedUserPresence;
  userTransientStatus: null;
}
