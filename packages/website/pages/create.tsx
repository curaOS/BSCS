// @ts-nocheck
import { Box, AspectRatio, Button } from "theme-ui";
import { CreatorShare } from "@cura/components";
import { combineHTML } from "../utils/combine-html";
import { useNFTContract } from "@cura/hooks";
import { utils } from "near-api-js";
import { useSetRecoilState } from "recoil";
import axios from "axios";
import { useState, createRef } from "react";

import Layout from "../containers/Layout";
import { contractAddress } from "../utils/config";
import { alertMessageState, indexLoaderState } from "../state/recoil";
import { htmlToImg } from "../utils/html-to-img";

const CONTRACT_DESIGN_GAS = utils.format.parseNearAmount(`0.00000000020`); // 200 Tgas
const CONTRACT_CLAIM_GAS = utils.format.parseNearAmount(`0.00000000029`); // 300 Tgas
const CONTRACT_CLAIM_PRICE = utils.format.parseNearAmount(`1`); // 1N

const HARDCODED_ROYALTY_ADDRESS = "sample.address";
const HARDCODED_ROYALTY_SHARE = `2500`;

const arweaveLambda = process.env.NEXT_PUBLIC_ARWEAVE_LAMBDA;

const TEMP_TOKEN_ROYALTY = {
  split_between: {},
  percentage: 0,
};

const Create = () => {
  const { contract } = useNFTContract(contractAddress);

  const setIndexLoader = useSetRecoilState(indexLoaderState);
  const setAlertMessage = useSetRecoilState(alertMessageState);

  const [seed, setSeed] = useState();
  const [creativeCode, setCreativeCode] = useState(``);

  const iframeRef = createRef(null);
  const generatePreview = async () => {
    const iframeHtml = iframeRef.current.contentWindow.document.body;
    return await htmlToImg(iframeHtml);
  };

  async function retrieveData() {
    setIndexLoader(true);

    try {
      // const result = await contract.generate({}, CONTRACT_DESIGN_GAS);

      const nftMetadata = await contract.nft_metadata();

      // setSeed(result?.seed);

      // const arweaveHTML = combineHTML(
      //   `<script>let jsonParams = '${JSON.stringify({
      //     instructions: result?.instructions?.split(`,`),
      //   })}'</script>`,
      //   nftMetadata.packages_script,
      //   nftMetadata.render_script,
      //   nftMetadata.style_css
      // );
      const arweaveHTML = combineHTML(
        "",
        nftMetadata.packages_script,
        nftMetadata.render_script,
        nftMetadata.style_css
      );

      setCreativeCode(arweaveHTML);

      setTimeout(() => setIndexLoader(false), 200);
    } catch (e) {
      console.error(e);
      setIndexLoader(false);
      setAlertMessage(e.toString());
    }
  }

  async function claimDesign() {
    const preview = await generatePreview();
    

    setIndexLoader(true);

    try {
      const liveResponse = await axios.post(
        arweaveLambda,
        JSON.stringify({
          contentType: `text/html`,
          data: creativeCode,
        })
      );

      const previewResponse = await axios.post(
        arweaveLambda,
        JSON.stringify({
          contentType: `image/jpeg`,
          data: preview,
        })
      );

      console.log(`live`, liveResponse.data.transaction.id);
      console.log(`preview `, previewResponse.data.transaction.id);

      await contract.mint(
        {
          tokenMetadata: {
            media: previewResponse.data.transaction.id,
            media_animation: liveResponse.data.transaction.id,
            extra: Buffer.from(
              JSON.stringify({
                seed: seed,
              })
            ).toString(`base64`),
          },
          token_royalty: TEMP_TOKEN_ROYALTY
        },
        CONTRACT_CLAIM_GAS,
        CONTRACT_CLAIM_PRICE
      );
    } catch (error) {
      console.error(error);
      setIndexLoader(false);
      setAlertMessage(error.toString());
    }
  }

  return (
    <Layout requireAuth={true}>
      <Box
        sx={{
          mt: 50,
        }}
      >
        <Box
          sx={{
            display: ["block", "block", "block", "inline-block"],
            width: ["100%", "70%", "70%", "50%"],
            mr: [0, "auto", "auto", 6],
            ml: [0, "auto", "auto", 0],
            mb: [2, 0],
            textAlign: "center",
          }}
        >
          <AspectRatio
            ratio={1}
            sx={{
              bg: "gray.3",
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
              width: "100%",
              maxHeight: "100%",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {creativeCode && (
              <iframe
                srcDoc={creativeCode}
                ref={iframeRef}
                width={`100%`}
                height={`100%`}
                frameBorder="0"
                scrolling="no"
              ></iframe>
            )}
          </AspectRatio>
        </Box>
        <Box
          sx={{
            mt: 0,
            display: ["block", "block", "block", "inline-block"],
            verticalAlign: "top",
            margin: "auto",
            width: ["100%", "70%", "70%", "30%"],
            mb: [50, 0],
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: ["row", "row", "row", "column"],
              alignItems: "start",
              rowGap: 18,
              mb: [0, 30, 30, 30],
            }}
          >
            <Button onClick={retrieveData} variant="borderless" mr={3}>
              DESIGN
            </Button>
            <Button
              onClick={creativeCode == `` ? () => void 0 : claimDesign}
              variant="borderless"
            >
              CLAIM
            </Button>
          </Box>
          <CreatorShare
            address={HARDCODED_ROYALTY_ADDRESS}
            share={HARDCODED_ROYALTY_SHARE}
          />
        </Box>
      </Box>
    </Layout>
  );
};

export default Create;
