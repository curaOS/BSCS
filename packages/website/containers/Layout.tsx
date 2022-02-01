// @ts-nocheck

import { useNearHooksContainer } from "@cura/hooks";
import { Container } from "theme-ui";
import Link from "next/link";

import Header from "./Header";
import Menu from "./Menu";

export default function Layout({ children, requireAuth = false, page }) {
  const { accountId } = useNearHooksContainer();

  return (
    <>
      <Header />
      <Menu
        base={""}
        nextLinkWrapper={(href, children) => (
          <Link href={href}>{children}</Link>
        )}
        activeLink={page}
      />
      <Container>
        {!requireAuth || accountId ? children : "need login"}
      </Container>
    </>
  );
}
