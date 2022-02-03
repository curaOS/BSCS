// @ts-nocheck
/** @jsxImportSource theme-ui */
import { useLazyQuery, gql } from "@apollo/client";
import { Box, Link, Spinner, AspectRatio } from "theme-ui";
import InfiniteScroll from "react-infinite-scroll-component";
import { MediaObject } from "@cura/components";
import NextLink from "next/link";
import { contractAddress } from "../../utils/config";

import Layout from "../../containers/Layout";
import { useEffect } from "react";

const LIMIT_PER_PAGE = 4;

const GET_NFTS = gql`
  query getNfts($offset: Int, $limit: Int) {
    nfts(skip: $offset, first: $limit) {
      id
      metadata {
        media
      }
    }
    nftContracts(first: 1, where: { id: "${contractAddress}" }) {
      total_supply
    }
  }
`;

const ExploreToken = () => {
  const [getNfts, { loading, data, error, fetchMore }] = useLazyQuery(
    GET_NFTS,
    {
      variables: {
        offset: 0,
        limit: LIMIT_PER_PAGE,
      },
    }
  );

  useEffect(() => {
    getNfts();
  }, []);

  const total_supply = parseInt(data?.nftContracts[0]?.total_supply);

  return (
    <Layout>
      <Box sx={{ textAlign: "center", my: 30, mx: "auto", maxWidth: 900 }}>
        {loading && <Spinner />}
        {error && <p>Error: check console</p>}
        {!loading && !error && (
          <Feed
            entries={data?.nfts || []}
            totalSupply={total_supply || 0}
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

const Feed = ({ entries, onLoadMore, totalSupply }) => {
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
                  mediaURI={`${item.metadata.media}`}
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

export default ExploreToken;
