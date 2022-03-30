// @ts-nocheck
import {Link, AspectRatio, Box} from "theme-ui";
import InfiniteScroll from "react-infinite-scroll-component";
import NextLink from "next/link";
import {MediaObject, Metadata} from "@cura/components";


export default function Feed({ entries, onLoadMore, totalSupply, base_uri, page }) {
    return (
        <InfiniteScroll
            dataLength={entries.length}
            next={onLoadMore}
            hasMore={totalSupply > entries.length}
        >
            {entries.map((item, index) => {
                return (
                    <NextLink href={`${page}/${item.id}`} key={index} passHref>
                        <Link
                            m={[21, 21, 21, 30]}
                            sx={{
                                display: "inline-block",
                                width: ['80%', 300, 340],
                                maxWidth: [260, 300, 340],
                                position: "relative",
                                boxShadow: "0px 0px 20px 5px rgb(176, 176, 176, 0.2)",
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
                                    flexDirection: "column"
                                }}
                            >
                                <MediaObject
                                    mediaURI={`${base_uri}${item.metadata.media}`}
                                    width={"100%"}
                                    height={"100%"}
                                    type={"image"}
                                />
                            </AspectRatio>
                            <Box
                                sx={{
                                    padding: "15px 10px",
                                    background: "#CCC",
                                    fontSize: 16,
                                    padding:0,
                                    marginTop: -3,
                                    textAlign: 'left'
                                }}
                            >
                                {item.owner &&
                                    <Metadata
                                        data={{
                                            owner_id: item.owner.id,
                                            metadata: {}
                                        }}
                                        loading={false}
                                    />
                                }
                            </Box>
                        </Link>
                    </NextLink>
                );
            })}
        </InfiniteScroll>
    );
}
