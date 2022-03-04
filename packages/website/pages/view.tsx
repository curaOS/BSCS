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

const CONTRACT_BURN_GAS = utils.format.parseNearAmount(`0.00000000029`); // 290 Tgas
const MARKET_ACCEPT_BID_GAS = utils.format.parseNearAmount(`0.00000000040`); // 400 Tgas
const YOCTO_NEAR = utils.format.parseNearAmount(`0.000000000000000000000001`);

const HARDCODED_ROYALTY_ADDRESS = "sample.address";
const HARDCODED_ROYALTY_SHARE = `2500`;


const GET_OWNER_NFT = gql`
  query getnft($owner_id: String) {
    nfts(skip: 0, first: 1, where: { owner: $owner_id }) {
      id
      contract {
        id
      }
      metadata {
        media
        media_animation
      }
      bids {
        amount
        bidder {
           id
        }
        sell_on_share
      }
      history {
        id
        type
        timestamp
        transactionHash
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
  const history = nft?.history;

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
          tokenId: nft?.id,
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
                type={`image`}
              />
            )}
          </AspectRatio>
        </Box>
        {!loading && nft && 
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

          {bids &&
              <Bidders
                  bidders={bids?.reduce((a, v) => (
                      { ...a, [v.bidder?.id]: {
                          ...v,
                          "bidder": v.bidder?.id
                      }}), {})
                  }
                  onAcceptBid={acceptBid}
              />
          }

          <CreatorShare
            address={HARDCODED_ROYALTY_ADDRESS}
            share={HARDCODED_ROYALTY_SHARE}
          />
          <List
              data={[
                { title: "Contract", content: nft?.contract?.id, link : `https://explorer.testnet.near.org/accounts/${nft?.contract?.id}`, copiable : true },
                { title: "Token ID", content: nft?.id, link : null, copiable : true },
                { title: "Media", content: "arweave link ↗", link : `${base_uri}${nft?.metadata?.media}`, copiable : false },
                { title: "Animation", content: "arweave link ↗", link : `${base_uri}${nft?.metadata?.media_animation}`, copiable : false },
              ]}
              width={"100%"}
          />
          {/*<History history = {history} />*/}

        </Box>
        }
      </Box>

      <Box
        sx={{
          display: [ 'block', 'flex' ],
          justifyContent: 'between'
        }}
      >

      </Box>

    </Layout>
  );
};

export default View;