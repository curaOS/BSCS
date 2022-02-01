import { Header } from '@cura/components'
import { useNearHooksContainer } from '@cura/hooks'
import { Link, useColorMode } from "theme-ui";
import { useRouter } from 'next/router'


export default function HeaderContainer({ 
	isInitial
} : {
	isInitial?: boolean
}){

	const router = useRouter();

	const { signIn, signOut, accountId } = useNearHooksContainer();
	const [mode, setMode] = useColorMode()

	const preSignOut= async()=>{
		await signOut()
		router.push(window.location.origin + '/')
	}

	return(
		<>
			<Header
				isInitial={ isInitial ? isInitial : false }
				title="Creative Project"
				onSignIn={signIn}
				onSignOut={preSignOut}
				accountId={accountId}
				mode={mode}
				setMode={setMode}
				logo={mode == 'dark' ? '/logoWhite.png' : '/logo.png'}
				nextLinkWrapper={(href, children) => (
					<Link href={href}>{children}</Link>
				)}

				setAlertMessage={()=> null}
				alertMessage=""
				base=""
			/>
		</>
	)
}