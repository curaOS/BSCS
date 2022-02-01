// @ts-nocheck
/** @jsxImportSource theme-ui */
import Link from "next/link";
import { Container, Box, Button } from "theme-ui";
import { useRouter } from "next/router";

export default function MenuContainer({ accountId }) {
  const router = useRouter();

  // get the last part of the path (e.g. create, view, explore)
  const activeLink = router.pathname.split("/").slice(-1)[0];

  const Btn = ({ href, content }) => {
    return (
      <Link href={`/${href}`} passHref>
        <Button
          variant="navigation"
          sx={{
            borderTop: 0,
            borderBottom: 0,
            width: "100%",
            bg: href === activeLink && "primary",
            color: href === activeLink && "bg",
          }}
        >
          {content}
        </Button>
      </Link>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        bg: "bg",
        borderBottom: 1,
        borderTop: accountId ? 1 : 0,
      }}
    >
      <Container
        as="nav"
        variant="wide"
        px={[0, 0, 0]}
        sx={{ display: "flex", ">*": { flex: 1 } }}
      >
        <Btn href={`create`} content="create" />
        <Btn href={`view`} content="view" />
        <Btn href={`explore`} content="explore" />
      </Container>
    </Box>
  );
}
