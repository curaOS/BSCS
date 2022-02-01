// @ts-nocheck
/** @jsxImportSource theme-ui */
import { useQuery, gql } from "@apollo/client";

import { Link } from "theme-ui";
import InfiniteScroll from "react-infinite-scroll-component";
import { MediaObject } from "@cura/components";

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

  if (loading) return <p>Loading...</p>;

  if (error) {
    console.error(error);
    return <p>Error :(</p>;
  }

  return (
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
              href={`view/${item.id}`}
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
