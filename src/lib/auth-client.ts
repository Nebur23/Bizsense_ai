import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  twoFactorClient,
  adminClient,
} from "better-auth/client/plugins";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:3000",
  plugins: [
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/two-factor";
      },
    }),
    adminClient(),
  ],
});

export const {
  signIn,

  signOut,

  signUp,

  useSession,
  organization,
  useListOrganizations,
  useActiveOrganization,
} = authClient;
