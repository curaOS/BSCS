// @ts-nocheck
import { Box, AspectRatio } from "theme-ui";
import { utils } from "near-api-js";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";
import { useQuery, gql } from "@apollo/client";
import { useNFTContract, useNearHooksContainer } from "@cura/hooks";
import {
  CreatorShare,
  Metadata,
  MediaObject,
  BidCreate,
  History,
  List
} from "@cura/components";

import Layout from "../../containers/Layout";
import { contractAddress } from "../../utils/config";
import { alertMessageState, indexLoaderState } from "../../state/recoil";
import { listData, historyData } from "../../utils/data"

const MARKET_SET_BID_GAS = utils.format.parseNearAmount(`0.00000000020`); // 200 Tgas

const HARDCODED_ROYALTY_ADDRESS = "sample.address";
const HARDCODED_ROYALTY_SHARE = `2500`;

const GET_SINGLE_NFT = gql`
  query getnft($token_id: String) {
    nfts(first: 1, where: { id: $token_id }) {
      id
      owner {
        id
      }
      creator {
        id
      }
      metadata {
        media
        title
        description
      }
    }
    nftContracts(first: 1, where: { id: "${contractAddress}" }) {
      base_uri
    }
  }
`;

const SingleView = () => {
  const router = useRouter();

  const setAlertMessage = useSetRecoilState(alertMessageState);
  const setIndexLoader = useSetRecoilState(indexLoaderState);

  const { contract } = useNFTContract(contractAddress);
  const { accountId } = useNearHooksContainer();

  const { loading, data, error } = useQuery(GET_SINGLE_NFT, {
    variables: {
      token_id: router.query.id || "",
    },
  });

  setIndexLoader(loading);

  if (error) {
    console.error(error);
    setAlertMessage(error);
  }

  let nft = data?.nfts[0];

  // If nft don't exist
  if (!loading && !nft) {
    router.push("/explore");
    return <></>;
  }

  // If user own nft
  if (nft && accountId) {
    if (nft.owner?.id === accountId) {
      router.push("/view");
      return <></>;
    }
  }

  async function setBid(amount, resale) {
    setIndexLoader(true);
    try {
      await contract.set_bid(
        {
          token_id: nft.id,
          amount: utils.format.parseNearAmount(amount),
          bidder: accountId,
          recipient: nft.owner?.id,
          sell_on_share: parseInt(resale) * 100,
          currency: `near`,
        },
        MARKET_SET_BID_GAS,
        utils.format.parseNearAmount(amount)
      );
    } catch (e) {
      console.error(e);
      setIndexLoader(false);
      setAlertMessage(e.toString());
    }
  }
  const base_uri = data?.nftContracts[0]?.base_uri;

  return (
    <Layout>
      <Box
        sx={{
          mt: 50,
        }}
      >
        <Box
          sx={{
            display: ["block", "block", "block", "inline-block"],
            width: ["100%", "70%", "70%", "50%"],
            mr: [0, "auto", "auto", "110px"],
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
          <Box>
            {data && (
              <Metadata
                data={{
                  owner_id: nft?.owner?.id,
                  metadata: nft?.metadata,
                }}
                loading={false}
                width={`100%`}
                variant={2}
              />
            )}
          </Box>

          <Box mt={2}>
            <CreatorShare
              address={HARDCODED_ROYALTY_ADDRESS}
              share={HARDCODED_ROYALTY_SHARE}
            />
          </Box>

          {accountId ? (
            <BidCreate onBid={setBid} />
          ) : (
            <Box
              sx={{
                mt: 35,
                fontWeight: "bold",
                fontSize: "24px",
              }}
            >
              Please login to add bids
            </Box>
          )}

          <Box
            sx={{
              display: [ 'block', 'flex' ],
              justifyContent: 'between'
            }}
          >

            <Box mb={35} >
              <List data={listData} />
            </Box>

            <Box mb={35} >
              <History history = {historyData} />
            </Box>

          </Box>

        </Box>
      </Box>
    </Layout>
  );
};

export default SingleView;
