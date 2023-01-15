import { Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Layout from "../../../../components/layout";

export default function PostPage() {
  const router = useRouter();
  const id = router.query.id as string;

  return (
    <Layout>
      <Heading>Edit</Heading>
      <div>{id}</div>
    </Layout>
  );
}
