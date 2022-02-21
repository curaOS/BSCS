// @ts-nocheck
/** @jsxImportSource theme-ui */
import { useQuery, gql } from "@apollo/client";
import { Box, Link, Spinner, AspectRatio } from "theme-ui";
import InfiniteScroll from "react-infinite-scroll-component";
import { MediaObject } from "@cura/components";
import NextLink from "next/link";
import { useNearHooksContainer } from "@cura/hooks";

import Layout from "../../containers/Layout";
import { contractAddress } from "../../utils/config";

const LIMIT_PER_PAGE = 6;

const GET_NFTS = gql`
  query ExploreNfts($offset: Int, $limit: Int, $owner_id: String) {
    nfts(skip: $offset, first: $limit, where: { owner: $owner_id } ) {
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

const View = () => {

    const { accountId } = useNearHooksContainer();

    const { loading, data, error, fetchMore } = useQuery(GET_NFTS, {
        variables: {
            offset: 0,
            limit: LIMIT_PER_PAGE,
            owner_id: accountId
        },
    });

    const total_supply_for_owner = parseInt(data?.nfts?.length);
    const base_uri = data?.nftContracts[0]?.base_uri;

    console.log(error);
    return (
        <Layout>
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


export default View;
