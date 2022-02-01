// @ts-nocheck

import { useNearHooksContainer } from "@cura/hooks";
import { Container } from "theme-ui";

import Header from "./Header";
import Menu from "./Menu";

export default function Layout({ children, requireAuth = false, page }) {
  const { accountId } = useNearHooksContainer();

  return (
    <>
      <Header />
      <Menu accountId={accountId} />
      <Container>
        {!requireAuth || accountId ? children : "need login"}
      </Container>
    </>
  );
}
