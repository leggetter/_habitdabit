import { Button, ButtonProps } from "@chakra-ui/react";
import HDLink, { HDLinkProps } from "./hd-link";

declare type HDLinkButtonProps = HDLinkProps &
  ButtonProps & {
    children?: React.ReactNode;
  };

export default function HDLinkButton(props: HDLinkButtonProps) {
  return (
    <HDLink _hover={{ textDecoration: "none" }} {...props}>
      <Button {...props}>{props.children}</Button>
    </HDLink>
  );
}
