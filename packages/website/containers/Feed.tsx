// @ts-nocheck
import {Link, AspectRatio} from "theme-ui";
import InfiniteScroll from "react-infinite-scroll-component";
import NextLink from "next/link";
import {MediaObject} from "@cura/components";


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
