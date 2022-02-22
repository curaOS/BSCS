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

const MARKET_SET_BID_GAS = utils.format.parseNearAmount(`0.00000000020`); // 200 Tgas

const HARDCODED_ROYALTY_ADDRESS = "sample.address";
const HARDCODED_ROYALTY_SHARE = `2500`;

const GET_SINGLE_NFT = gql`
  query getnft($token_id: String) {
    nfts(skip: 0, first: 1, where: { id: $token_id }) {
      id
      contract {
        id
      }
      owner {
        id
      }
      creator {
        id
      }
      metadata {
        media
        media_animation
        title
        description
      }
      history {
        id
        type
        timestamp
        mintBy { 
            id 
        }
        burnBy { 
            id 
        }
        transferFrom { 
            id 
        }
        transferTo { 
            id 
        }
        transactionHash
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
      fetchPolicy: "no-cache"
  });

  setIndexLoader(loading);

  if (error) {
    console.error(error);
    setAlertMessage(error);
  }

  let nft = data?.nfts[0];
  let history = nft?.history;

  // If nft don't exist
  if (!loading && !nft) {
    router.push("/explore");
    return <></>;
  }

  // If user own nft
  if (nft && accountId) {
    if (nft.owner?.id === accountId) {
      router.push("/view/"+router.query.id || "");
      return <></>;
    }
  }

  async function setBid(amount, resale) {
    setIndexLoader(true);
    try {
      await contract.set_bid(
        {
          tokenId: nft.id,
          bid:{
              amount: utils.format.parseNearAmount(amount),
              bidder: accountId,
              recipient: nft?.id,
              sell_on_share: parseInt(resale) * 100,
              currency: `near`,
          }
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
          
          {!accountId && (
            <Box
              sx={{
                mb: 35,
                variant: "text.h5",
              }}
            >
              Please connect to add bids
            </Box>
          )}
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

          {accountId && <BidCreate onBid={setBid} />}
          <List
              data={[
                { title: "Contract", content: nft?.contract?.id, link : `https://explorer.testnet.near.org/accounts/${nft?.contract?.id}`, copiable : true },
                { title: "Token ID", content: nft?.id, link : null, copiable : true },
                { title: "Media", content: "arweave link ↗", link : `${base_uri}${nft?.metadata?.media}`, copiable : false },
                { title: "Animation", content: "arweave link ↗", link : `${base_uri}${nft?.metadata?.media_animation}`, copiable : false },
              ]}
              width={"100%"}
          />
          <History history = {history} />
            

        </Box>

      </Box>
    </Layout>
  );
};

export default SingleView;
