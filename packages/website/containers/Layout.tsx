// @ts-nocheck

import { useNearHooksContainer } from "@cura/hooks";
import { Container } from "theme-ui";

import Header from "./Header";

export default function Layout({ children, requireAuth = false }) {
  const { accountId } = useNearHooksContainer();

  return (
    <>
      <Header />
      <Container>
        {!requireAuth || accountId ? children : "need login"}
      </Container>
    </>
  );
}
