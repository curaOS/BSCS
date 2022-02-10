// @ts-nocheck

import { useNearHooksContainer } from "@cura/hooks";
import { Container, Box, Spinner, Text } from "theme-ui";
import { useRecoilValue } from "recoil";

import Header from "./Header";
import { indexLoaderState } from "../state/recoil";

import Menu from "./Menu";

export default function Layout({ children, requireAuth = false, page }) {
  const { accountId } = useNearHooksContainer();

  const indexLoader = useRecoilValue(indexLoaderState);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <Menu accountId={accountId} />
      {requireAuth && !accountId ? (
        <Box
          sx={{
            height: "100%",
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
          }}
          variant="images.gradient"
        >
          <Text variant="buttons.1"> Please connect to use dapp </Text>
        </Box>
      ) : (
        <Container variant="wide">
          {indexLoader ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                my: 3,
              }}
            >
              <Spinner />
            </Box>
          ) : (
            children
          )}
        </Container>
      )}
    </Box>
  );
}
