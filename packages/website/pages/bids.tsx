// @ts-nocheck
/** @jsxImportSource theme-ui */

import { utils } from "near-api-js";
import { BiddersBids } from "@cura/components";
import {
  useNFTContract,
  useNearHooksContainer,
  useNFTViewMethod,
} from "@cura/hooks";
import { useSetRecoilState } from "recoil";
import { useQuery, gql } from "@apollo/client";
import { Box } from "theme-ui";

import Layout from "../containers/Layout";
import { contractAddress } from "../utils/config";
import { alertMessageState, indexLoaderState } from "../state/recoil";

const CONTRACT_REMOVE_BID_GAS = utils.format.parseNearAmount(`0.00000000020`); // 200 Tgas

const GET_BIDS = gql`
  query bids($bidder: String) {
    bids(first: 1, where: { id: $bidder }) {
      nft
      bidder
      amount
      sell_on_share
    }
  }
`;

const Bids = () => {
  const { contract } = useNFTContract(contractAddress);
  const { accountId } = useNearHooksContainer();
  const setIndexLoader = useSetRecoilState(indexLoaderState);
  const setAlertMessage = useSetRecoilState(alertMessageState);

  const { loading, data, error } = useQuery(GET_BIDS, {
    variables: {
      bidder: accountId || "",
    },
  });

  // const { loading, data, error } = useNFTViewMethod(
  //   contractAddress,
  //   "get_bidder_bids",
  //   { accountId: accountId }
  // );


  setIndexLoader(loading);

  if (error) {
    setAlertMessage(error.toString());
    console.error(error);
  }

  async function removeBid(token_id: string, bidder: string) {
    setIndexLoader(true);
    try {
      await contract.remove_bid(
        { tokenId: token_id, bidder: bidder },
        CONTRACT_REMOVE_BID_GAS
      );
      setIndexLoader(false);
    } catch (e) {
      console.error(e);
      setIndexLoader(false);
      setAlertMessage(e.toString());
    }
  }

  return (
    <Layout requireAuth={true}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 3,
        }}
      >
        {data && (
          <BiddersBids biddersBids={data?.bids || data} onRemoveBid={removeBid} />
        )}
      </Box>
    </Layout>
  );
};

export default Bids;
