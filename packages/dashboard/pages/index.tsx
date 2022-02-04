import type { NextPage } from "next";
import { Box, Heading } from "theme-ui";

const Home: NextPage = () => {
  return (
      <Box sx={{ textAlign: "center" }}>
        <Heading m={5}>Welcome to Cura</Heading>
      </Box>
  )
}

export default Home
