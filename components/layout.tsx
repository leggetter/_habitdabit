import Header from "./header";
import Footer from "./footer";
import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import Head from "next/head";

export default function Layout({
  children,
  title,
  errors,
}: {
  children: ReactNode;
  title?: string;
  errors?: string[];
}) {
  let displayTitle = title
    ? `${title} - HabitDabit`
    : "HabitDabit - create positive habits through repetition and reward";

  return (
    <>
      <Head>
        <title>{displayTitle}</title>
      </Head>
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
