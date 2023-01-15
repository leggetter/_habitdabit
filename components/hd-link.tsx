import NextLink from "next/link";
import { Link, LinkProps } from "@chakra-ui/react";

export declare type HDLinkProps = LinkProps & {
  children?: React.ReactNode;
};

export default function HDLink(props: HDLinkProps) {
  return (
    <Link as={NextLink} {...props}>
      {props.children}
    </Link>
  );
}
