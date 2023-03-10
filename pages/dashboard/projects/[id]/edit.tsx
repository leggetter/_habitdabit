import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Layout from "../../../../components/layout";
import ProjectForm from "../../../../components/projects/project-form";
import { Project } from "../../../../db/models/project";
import { useProject } from "../../../../lib/project-helpers";

export default function PostPage() {
  const router = useRouter();

  const { project, error, isLoading } = useProject(router.query.id as string);

  const handleSubmissionComplete = (project: Project) => {
    // TODO: handle submission problems. Should this be a success callback only?
    router.push(`/dashboard/projects/${project.id}`);
  };

  return (
    <Layout>
      {isLoading && <p>⏲️ Loading...</p>}
      {error && <p>{error}</p>}
      {!error && !isLoading && !project && (
        /* TODO: this should be a 404 */ <p>No project found</p>
      )}
      {project && (
        <>
          <Breadcrumb mb={5}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">🏠 Dashboard</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard/projects/${project?.id}`}>
                {project?.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/dashboard/projects/${project?.id}/edit`}
                isCurrentPage
              >
                edit
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading as="h1">Edit Project: {project.name}</Heading>

          <ProjectForm
            method="PATCH"
            action={`/api/v1/projects/${project.id}`}
            project={project}
            onSubmitComplete={handleSubmissionComplete}
            championReadonly={true}
          />
        </>
      )}
    </Layout>
  );
}
