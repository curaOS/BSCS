// @ts-nocheck
import { Box, AspectRatio, Button } from 'theme-ui'
import { CreatorShare } from '@cura/components'
import { combineHTML } from '../utils/combine-html'
import { useNFTContract, useNearHooksContainer } from '@cura/hooks'
import { utils } from 'near-api-js'
import { useSetRecoilState } from 'recoil'
import axios from 'axios'
import { useState, createRef } from 'react'
import { alpha } from '@theme-ui/color'
import sha256 from 'js-sha256';

import Layout from '../containers/Layout'
import { contractAddress } from '../utils/config'
import { alertMessageState, indexLoaderState } from '../state/recoil'
import { gql, useQuery } from '@apollo/client'
import { generate, randomNumber } from '../utils/generate'

const CONTRACT_CLAIM_GAS = utils.format.parseNearAmount(`0.00000000029`) // 300 Tgas

const arweaveLambda = process.env.NEXT_PUBLIC_ARWEAVE_LAMBDA

const GET_CONTRACT_METADATA = gql`
    query { 
        nftContracts (first: 1, where: { id: "${contractAddress}" }) {
            id
            metadata {
                mint_royalty_id {
                    id
                }
                mint_royalty_amount
                mint_price
                packages_script
                render_script
                style_css
                parameters
            }
        }
    }
`

const delay = time => new Promise((res) => setTimeout(res, time))


const Create = () => {
    const { contract } = useNFTContract(contractAddress)
    const { accountId } = useNearHooksContainer();


    const setIndexLoader = useSetRecoilState(indexLoaderState)
    const setAlertMessage = useSetRecoilState(alertMessageState)

    const [seed, setSeed] = useState()
    const [creativeCode, setCreativeCode] = useState(``)

    const iframeRef = createRef(null)
    const aspectRatioRef = createRef(null)


    const { loading, data, error } = useQuery(GET_CONTRACT_METADATA)
    let metadata = data?.nftContracts[0]?.metadata

    setIndexLoader(loading)

    if (error) {
        console.error(error)
        setAlertMessage(error)
    }

    const generatePreview = async () => {
        aspectRatioRef.current.style.width = `${1400/window.devicePixelRatio}px`;
        aspectRatioRef.current.style.height = `${1400/window.devicePixelRatio}px`;

        const canvas = iframeRef.current.contentWindow.document.getElementById('defaultCanvas0');

        // Without this millisecond delay the iFrame doesn't resize and image stays small
        await delay(1);

        return canvas.toDataURL('image/png');
    }

    async function retrieveData() {
        setIndexLoader(true)

        try {
            const randomSeed = randomNumber(0, 4096)
            const result = generate(randomSeed)

            setSeed(randomSeed)

            const arweaveHTML = combineHTML(
                `<script>let INSTRUCTIONS = ${JSON.stringify(
                    result
                )};</script>`,
                metadata.packages_script,
                metadata.render_script,
                metadata.style_css
            )

            setCreativeCode(arweaveHTML)

            setTimeout(() => setIndexLoader(false), 200)
        } catch (e) {
            console.error(e)
            setIndexLoader(false)
            setAlertMessage(e.toString())
        }
    }

    async function claimDesign() {
        const preview = await generatePreview()

        setIndexLoader(true)

        try {
            const liveResponse = await axios.post(
                arweaveLambda,
                JSON.stringify({
                    contentType: `text/html`,
                    data: creativeCode,
                })
            )

            const previewResponse = await axios.post(
                arweaveLambda,
                JSON.stringify({
                    contentType: `image/jpeg`,
                    data: preview,
                })
            )

            console.log(`live`, liveResponse.data.transaction.id)
            console.log(`preview `, previewResponse.data.transaction.id)

            const token_royalty = {
                split_between: {
                    [metadata?.mint_royalty_id?.id]: Number(
                        metadata?.mint_royalty_amount
                    ),
                },
                percentage: Number(metadata?.mint_royalty_amount),
            }

            await contract.nft_mint(
                {
                    tokenMetadata: {
                        title: `${accountId[0]}-${seed}`,
                        media: `https://arweave.net/${previewResponse.data.transaction.id}`,
                        media_hash: sha256(preview),
                        description: new Date().toISOString(),
                        media_animation: liveResponse.data.transaction.id,
                        extra: Buffer.from(
                            JSON.stringify({
                                seed: seed,
                            })
                        ).toString(`base64`),
                    },
                    token_royalty: token_royalty,
                    receiver_id: accountId,
                },
                CONTRACT_CLAIM_GAS,
                metadata?.mint_price
            )
        } catch (error) {
            console.error(error)
            setIndexLoader(false)
            setAlertMessage(error.toString())
        }
    }

    return (
        <Layout requireAuth={true}>
            <Box
                sx={{
                    mt: 50,
                }}
            >
                <Box
                    sx={{
                        display: ['block', 'block', 'block', 'inline-block'],
                        width: ['100%', '70%', '70%', '50%'],
                        mr: [0, 'auto', 'auto', 6],
                        ml: [0, 'auto', 'auto', 0],
                        mb: [2, 0],
                        textAlign: 'center',
                        boxShadow: theme => `${alpha(theme.rawColors.primary, 0.1)(theme)} 0px 0px 40px`,
                    }}
                >
                    <AspectRatio
                        ratio={1}
                        ref={aspectRatioRef}
                        sx={{
                            bg: 'gray.3',
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            maxHeight: '100%',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}
                    >
                        {creativeCode && (
                            <iframe
                                srcDoc={creativeCode}
                                ref={iframeRef}
                                width={`100%`}
                                height={`100%`}
                                frameBorder="0"
                                scrolling="no"
                            ></iframe>
                        )}
                    </AspectRatio>
                </Box>
                <Box
                    sx={{
                        mt: 0,
                        display: ['block', 'block', 'block', 'inline-block'],
                        verticalAlign: 'top',
                        margin: 'auto',
                        width: ['100%', '70%', '70%', '30%'],
                        mb: [50, 0],
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: ['row', 'row', 'row', 'column'],
                            alignItems: 'start',
                            rowGap: 18,
                            mb: [0, 30, 30, 30],
                        }}
                    >
                        <Button
                            onClick={retrieveData}
                            variant="borderless"
                            mr={3}
                        >
                            DESIGN
                        </Button>
                        <Button
                            onClick={
                                creativeCode == `` ? () => void 0 : claimDesign
                            }
                            variant="borderless"
                        >
                            CLAIM
                        </Button>
                    </Box>
                    {metadata && (
                        <CreatorShare
                            address={metadata?.mint_royalty_id?.id}
                            share={metadata?.mint_royalty_amount}
                        />
                    )}
                </Box>
            </Box>
        </Layout>
    )
}

export default Create
