"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";

const SignedOut = () => {
  return (
    <Button variant='ghost' onClick={() => authClient.signOut()}>
      Sign Out
    </Button>
  );
};

export default SignedOut;
