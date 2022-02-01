// @ts-nocheck
/** @jsxImportSource theme-ui */
import { useQuery, gql } from "@apollo/client";

const NFTS_QUERY = gql`
  query GetNfts {
    nfts() {
        id
    }
  }
`;

const ExploreToken = () => {
  const { loading, error, data } = useQuery(NFTS_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.nfts.map(({ id }) => (
    <div key={id}>
      <p>{id}</p>
    </div>
  ));
};

export default ExploreToken;
