import { signIn, signOut, useSession } from "next-auth/react";
import styles from "./header.module.css";

import { Avatar, Box, Flex, Spacer } from "@chakra-ui/react";
import HDLink from "./hd-link";

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <Box as="header" width="100%">
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <Box className={styles.signedInStatus}>
        <Box
          className={`nojs-show ${
            !session && loading ? styles.loading : styles.loaded
          }`}
        >
          {!session && (
            <Flex>
              <Box>You are not signed in</Box>
              <Spacer />
              <a
                href={`/api/auth/signin`}
                className={styles.buttonPrimary}
                onClick={(e) => {
                  e.preventDefault();
                  signIn();
                }}
              >
                Sign in
              </a>
            </Flex>
          )}
          {session?.user && (
            <Flex>
              {session.user.image && (
                <HDLink href="/dashboard/profile">
                  <Avatar src={session.user.image} />
                </HDLink>
              )}
              <Box>
                <span className={styles.signedInText}>
                  <small>Signed in as</small>
                  <br />
                  <HDLink href="/dashboard/profile">
                    <strong>{session.user.email ?? session.user.name}</strong>
                  </HDLink>
                </span>
              </Box>
              <Spacer />
              <Box>
                <a
                  href={`/api/auth/signout`}
                  className={styles.button}
                  onClick={(e) => {
                    e.preventDefault();
                    signOut();
                  }}
                >
                  Sign out
                </a>
              </Box>
            </Flex>
          )}
        </Box>
      </Box>
      <Box as="nav">
        <Flex as="ul" className={styles.navItems}>
          <li className={styles.navItem}>
            <HDLink href="/">Home</HDLink>
          </li>
          {session?.user && (
            <>
              <Spacer />
              <li className={styles.navItem}>
                <HDLink href="/dashboard">Dashboard</HDLink>
              </li>
              <li className={styles.navItem}>
                <HDLink href="/dashboard/profile">Profile</HDLink>
              </li>
            </>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
