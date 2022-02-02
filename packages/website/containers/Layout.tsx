// @ts-nocheck

import { useNearHooksContainer } from "@cura/hooks";
import { Container, Box, Spinner } from "theme-ui";
import { useRecoilValue } from 'recoil'

import Header from "./Header";
import { indexLoaderState } from '../state/recoil'

import Menu from "./Menu";

export default function Layout({ children, requireAuth = false, page }) {

  const { accountId } = useNearHooksContainer();
   
  const indexLoader = useRecoilValue(indexLoaderState)

  return (
    <>
      <Header />
      <Menu accountId={accountId} />
      <Container>
      	{indexLoader ? (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    my: 3,
                }}
            >
                <Spinner />
            </Box>
        ) :  (!requireAuth || accountId) ? 
        	 children 
       	: "need login"
       }
      </Container>
    </>
  );
}
