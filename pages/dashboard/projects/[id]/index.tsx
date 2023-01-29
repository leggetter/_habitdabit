import { Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Layout from "../../../../components/layout";

import { Table, Tbody, Tr, Td, TableContainer } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Project } from "../../../../db/models/project";
import { useProject } from "../../../../lib/project-helpers";

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

export default function ProjectPage() {
  const router = useRouter();

  const { project, error, isLoading } = useProject(router.query.id as string);

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
