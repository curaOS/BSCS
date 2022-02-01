// @ts-nocheck
/** @jsxImportSource theme-ui */

import { Menu } from "@cura/components";

export default function MenuContainer({
  base,
  nextLinkWrapper,
  activeLink,
}: {
  base: string;
  nextLinkWrapper: (link: string, children: JSX.Element) => JSX.Element;
  activeLink: string;
}) {
  return (
    <Menu
      base={base}
      nextLinkWrapper={nextLinkWrapper}
      activeLink={activeLink}
      isDisconnected={false}
    />
  );
}
