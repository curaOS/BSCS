// @ts-nocheck
import { Header } from "@cura/components";
import { useNearHooksContainer } from "@cura/hooks";
import { useColorMode } from "theme-ui";
import { useRouter } from "next/router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import Link from "next/link";

import { contractAddress } from "../utils/config";
import { alertMessageState } from "../state/recoil";

export default function HeaderContainer({
  isInitial,
}: {
  isInitial?: boolean;
}) {
  const router = useRouter();

  const { signIn, signOut, accountId } = useNearHooksContainer();
  const [mode, setMode] = useColorMode();

  const alertMessage = useRecoilValue(alertMessageState);
  const setAlertMessage = useSetRecoilState(alertMessageState);

  const preSignOut = async () => {
    await signOut();
    router.reload();
  };

  const preSignIn = () => {
    signIn(
      contractAddress,
      window.location.origin + router.asPath,
      window.location.origin + router.asPath
    );
  };

  return (
    <>
      <Header
        isInitial={isInitial ? isInitial : false}
        title="BSCS"
        onSignIn={preSignIn}
        onSignOut={preSignOut}
        accountId={accountId}
        mode={mode}
        setMode={setMode}
        logo={mode == "dark" ? "/logoWhite.png" : "/logo.png"}
        nextLinkWrapper={(href, children) => (
          <Link href={href.includes("bids") ? "/bids" : href}>{children}</Link>
        )}
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        base=""
      />
    </>
  );
}
