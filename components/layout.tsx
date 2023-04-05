import Header from "./header";
import Footer from "./footer";
import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";

export default function Layout({
  children,
  errors,
}: {
  children: ReactNode;
  errors?: string[];
}) {
  return (
    <>
      <Header />
      {errors && errors.length > 0 && (
        <Box as="section" backgroundColor="red" color="white" p={5} m={10}>
          {errors.map((e, i) => {
            return <p key={`error_${i}`}>{e}</p>;
          })}
        </Box>
      )}
      <main>{children}</main>
      <Footer />
    </>
  );
}
