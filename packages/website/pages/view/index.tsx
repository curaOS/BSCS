// @ts-nocheck
/** @jsxImportSource theme-ui */
import { useQuery, gql } from "@apollo/client";
import { Box, Link, Spinner, AspectRatio } from "theme-ui";
import InfiniteScroll from "react-infinite-scroll-component";
import { MediaObject } from "@cura/components";
import NextLink from "next/link";
import {useNearHooksContainer, useNFTViewMethod} from "@cura/hooks";

import Layout from "../../containers/Layout";
import { contractAddress } from "../../utils/config";

const LIMIT_PER_PAGE = 4;

const GET_OWNER_NFTS = gql`
  query ExploreNfts($offset: Int, $limit: Int, $owner_id: String) {
    nfts(skip: $offset, first: $limit, where: { owner: $owner_id } ) {
      id
      metadata {
        media
      }
    }
    nftContracts(first: 1, where: { id: "${contractAddress}" }) {
      base_uri
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

    const base_uri = data?.nftContracts[0]?.base_uri;

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

const Feed = ({ entries, onLoadMore, totalSupply, base_uri }) => {
    return (
        <InfiniteScroll
            dataLength={entries.length}
            next={onLoadMore}
            hasMore={totalSupply > entries.length}
        >
            {entries.map((item, index) => {
                return (
                    <NextLink href={`view/${item.id}`} key={index} passHref>
                        <Link
                            m={[21, 21, 21, 30]}
                            sx={{
                                display: "inline-block",
                                width: [225, 340],
                                position: "relative",
                                ":hover": {
                                    opacity: "0.8",
                                },
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
                                    height: "100%",
                                    cursor: "pointer",
                                }}
                            >
                                <MediaObject
                                    mediaURI={`${base_uri}${item.metadata.media}`}
                                    width={"100%"}
                                    height={"100%"}
                                    type={"image"}
                                />
                            </AspectRatio>
                        </Link>
                    </NextLink>
                );
            })}
        </InfiniteScroll>
    );
};

export default ViewTokens;
