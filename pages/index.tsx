import { Heading, Icon } from "@chakra-ui/react";
import Link from "next/link";
import Layout from "../components/layout";
import { FaGithub } from "react-icons/fa";

export default function IndexPage() {
  return (
    <Layout>
      <Heading as="h1">HabitDabit 🧘</Heading>
      <p>
        HabitDabit aims to help people create positive habits through repetition
        and reward.
      </p>

      <Heading as="h2" mt={10}>
        Open source
      </Heading>
      <p>
        <Link href="https://github.com/leggetter/habitdabit">
          <Icon as={FaGithub} mr={1} />
          HabitDabit is open source
        </Link>
        .
      </p>
      <p>
        HabitDabit is built with <Link href="https://nextjs.org/">Next.js</Link>
        , <Link href="https://next-auth.js.org/">NextAuth.js</Link>,{" "}
        <Link href="https://chakra-ui.com/">Chakra UI</Link>, and{" "}
        <Link href="https://www.tigrisdata.com">Tigris</Link>.
      </p>
    </Layout>
  );
}
