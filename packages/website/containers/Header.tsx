// @ts-nocheck
import { Header } from "@cura/components";
import { useNearHooksContainer } from "@cura/hooks";
import { Link, useColorMode } from "theme-ui";
import { useRouter } from "next/router";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { project } from "../utils/project";
import { alertMessageState } from "../state/recoil";

export default function HeaderContainer({
  isInitial,
}: {
  isInitial?: boolean;
}) {
  const router = useRouter();

  const { signIn, signOut, accountId } = useNearHooksContainer();
  const [mode, setMode] = useColorMode();

  const alertMessage = useRecoilValue(alertMessageState)
  const setAlertMessage = useSetRecoilState(alertMessageState)

  const preSignOut = async () => {
    await signOut();
    router.reload();
  };

  const preSignIn = () => {
    signIn(
      project,
      window.location.origin + router.asPath,
      window.location.origin + router.asPath
    );
  };

  return (
    <>
      <Header
        isInitial={isInitial ? isInitial : false}
        title="Creative Project"
        onSignIn={preSignIn}
        onSignOut={preSignOut}
        accountId={accountId}
        mode={mode}
        setMode={setMode}
        logo={mode == "dark" ? "/logoWhite.png" : "/logo.png"}
        nextLinkWrapper={(href, children) => (
          <Link href={href}>{children}</Link>
        )}
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        base=""
      />
    </>
  );
}
