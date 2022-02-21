// @ts-nocheck
/** @jsxImportSource theme-ui */
import { useQuery, gql } from "@apollo/client";
import { Box, Link, Spinner, AspectRatio } from "theme-ui";
import { contractAddress } from "../../utils/config";

import Layout from "../../containers/Layout";
import Feed from "../../containers/Feed";


const LIMIT_PER_PAGE = 2;

const GET_NFTS = gql`
  query ExploreNfts($offset: Int, $limit: Int) {
    nfts(skip: $offset, first: $limit) @connection(key: "root"){
      id
      metadata {
        media
      }
    }
    nftContracts(first: 1, where: { id: "${contractAddress}" }) {
      total_supply
      base_uri
    }
  }
`;

const ExploreToken = () => {
  const { loading, data, error, fetchMore } = useQuery(GET_NFTS, {
    variables: {
      offset: 0,
      limit: LIMIT_PER_PAGE,
    },
  });

  const total_supply = parseInt(data?.nftContracts[0]?.total_supply);
  const base_uri = data?.nftContracts[0]?.base_uri;

  console.log(data);
  return (
    <Layout>
      <Box sx={{ textAlign: "center", my: 30, mx: "auto", maxWidth: 900 }}>
        {loading && <Spinner />}
        {error && <p>Error: check console</p>}
        {!loading && !error && (
          <Feed
              page='explore'
            entries={data?.nfts || []}
            totalSupply={total_supply || 0}
            base_uri={base_uri}
            onLoadMore={() =>
              fetchMore({
                variables: {
                  offset: data.nfts.length,
                },
              })
            }
          />
        )}
      </Box>
    </Layout>
  );
};

export default ExploreToken;
