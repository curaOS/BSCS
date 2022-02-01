import { useNearHooksContainer } from '@cura/hooks'
import { Box, Container, Spinner } from 'theme-ui'

import Header from './Header'


export default function Layout({ children } : {children: JSX.Element}){

	const { accountId } = useNearHooksContainer();


	return(
		<>
			<Header />

			<Container >
                { accountId && (
                    children
                )}
            </Container>
		</>
	)
}