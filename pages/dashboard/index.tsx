import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Flex,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import HDLinkButton from "../../components/hd-link-button";
import Layout from "../../components/layout";

const ProjectCard = ({
  id,
  name,
  goalDescription: description,
  showEditButton,
}: {
  id: string;
  name: string;
  goalDescription: string;
  showEditButton: boolean;
}) => {
  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      mt={5}
      mr={5}
      maxW={400}
    >
      <Stack>
        <CardBody>
          <Heading as="h3" size="md">
            {name}
          </Heading>

          <Text py="2">{description}</Text>
        </CardBody>

        <CardFooter>
          <HDLinkButton
            href={`/dashboard/projects/${id}`}
            variant="solid"
            colorScheme="green"
            mr={2}
          >
            View
          </HDLinkButton>
          {showEditButton && (
            <HDLinkButton
              href={`/dashboard/projects/${id}/edit`}
              variant="solid"
              colorScheme="blue"
            >
              Edit
            </HDLinkButton>
          )}
        </CardFooter>
      </Stack>
    </Card>
  );
};

export default function Dashboard() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "admin";

  return (
    <Layout>
      <Heading as="h1">Dashboard</Heading>

      <Box as="section" mt={10}>
        <Heading as="h2">Projects</Heading>

        <HDLinkButton
          href={`/dashboard/projects/create`}
          variant="solid"
          colorScheme="blue"
        >
          Create
        </HDLinkButton>

        <Flex>
          <ProjectCard
            id="1"
            name={"Max's good habits"}
            goalDescription={
              "A set of tasks and activities to promote good habits."
            }
            showEditButton={isAdmin}
          />
          <ProjectCard
            id="2"
            name={"Finn's good habits"}
            goalDescription={
              "A set of tasks and activities to promote good habits."
            }
            showEditButton={isAdmin}
          />
        </Flex>
      </Box>
    </Layout>
  );
}
