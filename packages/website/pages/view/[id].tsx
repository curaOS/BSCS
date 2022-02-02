// @ts-nocheck
import { Box, AspectRatio } from "theme-ui";
import { utils } from 'near-api-js'
import { useRouter } from 'next/router'
import { useSetRecoilState } from "recoil";
import {
    useNFTContract,
    useNFTViewMethod,
    useNearHooksContainer,
} from '@cura/hooks'
import {
    CreatorShare,
    Metadata,
    MediaObject,
    BidCreate,
} from '@cura/components'

import Layout from "../../containers/Layout";
import { project } from "../../utils/project";
import { alertMessageState, indexLoaderState } from "../../state/recoil";

const MARKET_SET_BID_GAS = utils.format.parseNearAmount(`0.00000000020`) // 200 Tgas

const HARDCODED_ROYALTY_ADDRESS = 'sample.address'
const HARDCODED_ROYALTY_SHARE = `2500`


const SingleView = () => {

  const router = useRouter();

  const setAlertMessage = useSetRecoilState(alertMessageState)
  const setIndexLoader = useSetRecoilState(indexLoaderState)

  const { contract } = useNFTContract(project)
  const { accountId } = useNearHooksContainer()

  const { data: media } = useNFTViewMethod(
      project,
      `nft_token`,
      {
          token_id: router.query.id,
      },
      null
  )


  async function setBid(amount, resale) {
      setIndexLoader(true)
      try {
          await contract.set_bid(
              {
                  token_id: media.id,
                  amount: utils.format.parseNearAmount(amount),
                  bidder: accountId,
                  recipient: media.owner_id,
                  sell_on_share: parseInt(resale) * 100,
                  currency: `near`,
              },
              MARKET_SET_BID_GAS,
              utils.format.parseNearAmount(amount)
          )
      } catch (e) {
          console.error(e)
          setIndexLoader(false)
          setAlertMessage(e.toString())
      }
  }

  return (
    <>
      <Layout>
        <Box
            sx={{
                mt: 50,
            }}
        >
            <Box
                sx={{
                    display: ["block", "block", "block", "inline-block"],
                    width: ["100%", "70%", "70%", "50%"],
                    mr: [0, "auto", "auto", '110px'],
                    ml: [0, "auto", "auto", 0],
                    mb: [2, 0],
                    textAlign: "center",
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
                        maxHeight: "100%",
                        marginLeft: "auto",
                        marginRight: "auto",
                    }}
                >
                    {media && (
                        <MediaObject
                            mediaURI={`https://arweave.net/${media?.metadata?.media}`}
                            width={`100%`}
                            height={`100%`}
                        />
                    )}
                </AspectRatio>
            </Box>
            <Box
                sx={{
                    mt: 0,
                    display: ["block", "block", "block", "inline-block"],
                    verticalAlign: "top",
                    margin: "auto",
                    width: ["100%", "70%", "70%", "30%"],
                    mb: [50, 0],
                }}
            >
                <Box>
                    {media && (
                        <Metadata
                            data={media}
                            loading={false}
                            width={`100%`}
                            variant={1}
                        />
                    )}
                </Box>
                
                <Box mt={2}>
                  <CreatorShare
                    address={HARDCODED_ROYALTY_ADDRESS}
                    share={HARDCODED_ROYALTY_SHARE}
                  />
                </Box>

                <BidCreate
                    title={media?.metadata.title}
                    creator={media?.owner_id}
                    onBid={setBid}
                />

            </Box>
        </Box>
      </Layout>
    </>
  );
};

export default SingleView;
