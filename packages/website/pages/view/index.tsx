// @ts-nocheck
/** @jsxImportSource theme-ui */
import { useQuery, gql } from "@apollo/client";
import { Box, Link, Spinner, AspectRatio } from "theme-ui";
import InfiniteScroll from "react-infinite-scroll-component";
import { MediaObject } from "@cura/components";
import NextLink from "next/link";
import {useNearHooksContainer, useNFTViewMethod} from "@cura/hooks";

import Layout from "../../containers/Layout";
import Feed from "../../containers/Feed";
import { contractAddress } from "../../utils/config";

const LIMIT_PER_PAGE = 6;

const GET_OWNER_NFTS = gql`
  query ExploreNfts($offset: Int, $limit: Int, $owner_id: String) {
    nfts(skip: $offset, first: $limit, where: { owner: $owner_id } ) @connection(key: $owner_id) {
      id
      metadata {
        media
      }
    }
    nftContracts(first: 1, where: { id: "${contractAddress}" }) {
      metadata{
        base_uri
      }
    }
  }
`;

const ViewTokens = () => {

    const { accountId } = useNearHooksContainer();

    const { loading, data, error, fetchMore } = useQuery(GET_OWNER_NFTS, {
        variables: {
            offset: 0,
            limit: LIMIT_PER_PAGE,
            owner_id: accountId
        },
    });

    const base_uri = data?.nftContracts[0]?.metadata?.base_uri;

    const { data :total_supply_for_owner } = useNFTViewMethod(
        contractAddress,
        'nft_supply_for_owner',
        { "account_id": accountId}
    );

    return (
        <Layout requireAuth={true} >
            <Box sx={{ textAlign: "center", my: 30, mx: "auto", maxWidth: 900 }}>
                {loading && <Spinner />}
                {error && <p>Error: check console</p>}
                {!loading && !error && (
                    <Feed
                        page='view'
                        entries={data?.nfts || []}
                        totalSupply={total_supply_for_owner || 0}
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


export default ViewTokens;
