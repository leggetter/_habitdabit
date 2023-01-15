import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import Layout from "../../components/layout";

const ProjectCard = () => {
  const { data: session } = useSession();

  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      mt={5}
      maxW={400}
    >
      <Stack>
        <CardBody>
          <Heading as="h3" size="md">
            Max's good habits
          </Heading>

          <Text py="2">
            A schedule of tasks and actions that create good habits and are
            rewarded.
          </Text>
        </CardBody>

        <CardFooter>
          <Button variant="solid" colorScheme="green" mr={2}>
            View
          </Button>
          {session?.user.role === "admin" && (
            <Button variant="solid" colorScheme="blue">
              Edit
            </Button>
          )}
        </CardFooter>
      </Stack>
    </Card>
  );
};

export default function Page() {
  return (
    <Layout>
      <Heading as="h1">Dashboard</Heading>

      <Box as="section" mt={10}>
        <Heading as="h2">Projects</Heading>
        <Button colorScheme="blue">Create</Button>

        <SimpleGrid columns={4} spacing={5}>
          <ProjectCard />
          <ProjectCard />
        </SimpleGrid>
      </Box>
    </Layout>
  );
}
