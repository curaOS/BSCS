// @ts-nocheck
/** @jsxImportSource theme-ui */
import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { Box, Link, Spinner, AspectRatio } from "theme-ui";
import InfiniteScroll from "react-infinite-scroll-component";
import { MediaObject } from "@cura/components";
import NextLink from "next/link";
import { contractAddress } from "../../utils/config";
import {useNearHooksContainer, useNFTContract, useNFTViewMethod} from "@cura/hooks";

import Layout from "../../containers/Layout";

const LIMIT_PER_PAGE = 6;

const GET_NFTS = gql`
  query ExploreNfts($offset: Int, $limit: Int) {
    nfts(skip: $offset, first: $limit) {
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

    const { data :total_supply_for_owner } = useNFTViewMethod(
        contractAddress,
        'nft_supply_for_owner',
        { "account_id": accountId}
    );

    const { data, error, nextPage, loading } = useNFTExplore(
        accountId,
        LIMIT_PER_PAGE
    )

    // const base_uri = data?.nftContracts[0]?.base_uri;

    // console.log(data);
    return (
        <Layout requireAuth={true}>
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
                    <NextLink href={`explore/${item.id}`} key={index} passHref>
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


function useNFTExplore(accountId: string, limitPerPage = 4) {
    const [currentPage, setCurrentPage] = useState(0)
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const from_index = Math.floor(limitPerPage * currentPage)

    async function GetData() {
        const newData = await useNFTViewMethod
        (
            contractAddress,
            'nft_tokens_for_owner',
            {
                "account_id": accountId,
                "from_index": "0",
                "limit": 1
            }
        )
        console.log(newData)
        setData([...data, ...newData.data])
        setError(newData.error)
        setIsLoading(false)
    }

    // Excute function if currentPage change
    useEffect(() => {
        setIsLoading(true)
        GetData()
    }, [currentPage])

    return {
        data: data,
        error: error,
        loading: isLoading,
        nextPage: () => setCurrentPage(currentPage + 1),
    }
}

export default View;
