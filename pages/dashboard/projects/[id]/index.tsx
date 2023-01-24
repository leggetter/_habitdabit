import { Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Layout from "../../../../components/layout";

import { Table, Tbody, Tr, Td, TableContainer } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Project } from "../../../../db/models/project";

const ProjectTable = ({ project }: { project: Project }) => {
  return (
    <>
      <Heading>Project: {project?.name}</Heading>

      <TableContainer maxW={800}>
        <Table variant="striped" colorScheme="teal">
          <Tbody>
            <Tr>
              <Td>
                <b>Goal</b>
              </Td>
              <Td>{project?.goalDescription}</Td>
            </Tr>
            <Tr>
              <Td>
                <b>Champion</b>
              </Td>
              <Td>{project?.championId}</Td>
            </Tr>
            <Tr>
              <Td>
                <b>Admins</b>
              </Td>
              <Td>
                {project?.adminIds.map((adminId) => {
                  return (
                    <span key={adminId.toString()}>{adminId.toString()}</span>
                  );
                })}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export default function PostPage() {
  const router = useRouter();

  const [project, setProject] = useState<Project>();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const getProject = async () => {
      setLoading(true);

      const id = parseInt(router.query.id as string) as number;
      if (!id) return;

      try {
        const result = await fetch(`/api/v1/projects/${id}`);

        const projectResult = await result.json();
        if (projectResult.status === 200) {
          setProject(projectResult);
        } else {
          setError(projectResult.error);
        }
      } catch (ex) {
        console.error(ex);
        setError("An error occurred when fetching the project information.");
      }

      setLoading(false);
    };

    getProject();
  }, [router]);

  return (
    <Layout>
      {isLoading && <p>⏲️ Loading...</p>}
      {error && <p>{error}</p>}
      {!error && !isLoading && !project && (
        /* TODO: this should be a 404 */ <p>No project found</p>
      )}
      {project && <ProjectTable project={project} />}
    </Layout>
  );
}
