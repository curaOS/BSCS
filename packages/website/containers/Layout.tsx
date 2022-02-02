// @ts-nocheck

import { useNearHooksContainer } from "@cura/hooks";
import { Container, Box, Spinner, Text } from "theme-ui";
import { useRecoilValue } from 'recoil'

import Header from "./Header";
import { indexLoaderState } from '../state/recoil'

import Menu from "./Menu";


export default function Layout({ children, requireAuth = false, page }) {

  const { accountId } = useNearHooksContainer();
   
  const indexLoader = useRecoilValue(indexLoaderState)

  return (
    <Box
    	sx={{
    		height: '100vh',
    		display: 'flex',
    		flexDirection:'column'
    	}}
    >
      <Header />
      <Menu accountId={accountId} />
      <Container
      	sx={{
      		height: '100%',
      		justifyContent: (requireAuth && !accountId) && 'center',
            display: (requireAuth && !accountId) && 'flex',
            alignItems: (requireAuth && !accountId) && 'center',
      	}}
      	variant={(requireAuth && !accountId) ? "images.gradient" : "container"}
      >
      	{(requireAuth && !accountId) ? (
          <Box>
       		<Text variant="buttons.1"> Please connect to use dapp </Text>
       	  </Box>
        ) :  indexLoader ? 
        	<Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    my: 3,
                }}
            >
                <Spinner />
            </Box>
       	: children
       }
      </Container>
    </Box>
  );
}
