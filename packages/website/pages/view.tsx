// @ts-nocheck
import { Box, AspectRatio, Button } from "theme-ui";
import { utils } from "near-api-js";
import { useNFTContract, useNearHooksContainer } from "@cura/hooks";
import { CreatorShare, Bidders, MediaObject, List, History } from "@cura/components";
import { useSetRecoilState } from "recoil";
import { useQuery, gql } from "@apollo/client";

import Layout from "../containers/Layout";
import { contractAddress } from "../utils/config";
import { alertMessageState, indexLoaderState } from "../state/recoil";
import { listData, historyData } from "../utils/data"

const CONTRACT_BURN_GAS = utils.format.parseNearAmount(`0.00000000029`); // 290 Tgas
const MARKET_ACCEPT_BID_GAS = utils.format.parseNearAmount(`0.00000000025`); // 250 Tgas
const YOCTO_NEAR = utils.format.parseNearAmount(`0.000000000000000000000001`);

const HARDCODED_ROYALTY_ADDRESS = "sample.address";
const HARDCODED_ROYALTY_SHARE = `2500`;


const GET_OWNER_NFT = gql`
  query getnft($owner_id: String) {
    nfts(first: 1, where: { owner: $owner_id }) {
      id
      metadata {
        media
      }
      bids {
        amount
        bidder
        sell_on_share
      }
    }
    nftContracts(first: 1, where: { id: "${contractAddress}" }) {
      base_uri
    }
  }
`;

const View = () => {
  const { accountId } = useNearHooksContainer();
  const { contract } = useNFTContract(contractAddress);

  const setAlertMessage = useSetRecoilState(alertMessageState);
  const setIndexLoader = useSetRecoilState(indexLoaderState);

  const { loading, data, error } = useQuery(GET_OWNER_NFT, {
    variables: {
      owner_id: accountId || "",
    },
  });

  setIndexLoader(loading);

  if (error) {
    console.error(error);
    setAlertMessage(error);
  }

  const nft = data?.nfts[0];
  const bids = nft?.bids;

  async function burnDesign() {
    setIndexLoader(true);
    try {
      await contract.burn_design(
        { token_id: nft?.id },
        CONTRACT_BURN_GAS,
        YOCTO_NEAR
      );
    } catch (e) {
      setIndexLoader(false);
      setAlertMessage(e.toString());
    }
  }

  async function acceptBid(bidder: string) {
    setIndexLoader(true);
    try {
      await contract.accept_bid(
        {
          token_id: nft?.id,
          bidder: bidder,
        },
        MARKET_ACCEPT_BID_GAS,
        YOCTO_NEAR
      );
    } catch (e) {
      setIndexLoader(false);
      setAlertMessage(e.toString());
    }
  }

  const base_uri = data?.nftContracts[0]?.base_uri;

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
              mb: 36,
              width: "100%",
              maxHeight: "100%",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {data && (
              <MediaObject
                mediaURI={`${base_uri}${nft?.metadata?.media}`}
                width={`100%`}
                height={`100%`}
              />
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
          <Button onClick={burnDesign} variant="borderless">
            BURN
          </Button>

          {bids && <Bidders bidders={bids} onAcceptBid={acceptBid} />}

          <CreatorShare
            address={HARDCODED_ROYALTY_ADDRESS}
            share={HARDCODED_ROYALTY_SHARE}
          />
          <History history = {historyData} />

        </Box>
      </Box>

      <Box
        sx={{
          display: [ 'block', 'flex' ],
          justifyContent: 'between'
        }}
      >

        <Box mb={35} >
          <List data={listData} />
        </Box>

      </Box>

    </Layout>
  );
};

export default View;
