// @ts-nocheck
/** @jsxImportSource theme-ui */
import { useQuery, gql } from "@apollo/client";
import { Link, Spinner } from "theme-ui";
import InfiniteScroll from "react-infinite-scroll-component";
import { MediaObject } from "@cura/components";

import Layout from "../../containers/Layout";

const LIMIT_PER_PAGE = 2;

const GET_NFTS = gql`
  query nfts($offset: Int, $limit: Int) {
    nfts(skip: $offset, first: $limit) {
      id
      metadata {
        media
      }
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

  return (
    <Layout>
      {loading && <Spinner />}
      {error && <p>Error: check console</p>}
      {!loading && !error && (
        <Feed
          entries={data.nfts || []}
          onLoadMore={() =>
            fetchMore({
              variables: {
                offset: data.nfts.length,
              },
            })
          }
        />
      )}
    </Layout>
  );
};

const Feed = ({ entries, onLoadMore }) => {
  return (
    <>
      <button onClick={onLoadMore}>load more</button>

      <InfiniteScroll dataLength={entries.length} next={onLoadMore}>
        {entries.map((item, index) => {
          return (
            <Link
              key={index}
              href={`explore/${item.id}`}
              sx={{
                m: 10,
              }}
            >
              <MediaObject
                mediaURI={`${item.metadata.media}`}
                width={"100%"}
                height={"100%"}
                type={"image"}
              />
            </Link>
          );
        })}
      </InfiniteScroll>
    </>
  );
};

export default ExploreToken;
