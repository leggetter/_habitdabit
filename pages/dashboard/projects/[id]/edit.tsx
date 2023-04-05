import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../../../components/layout";
import ProjectForm from "../../../../components/projects/project-form";
import { Project } from "../../../../db/models/project";
import { useProject } from "../../../../lib/project-helpers";

export default function PostPage() {
  const router = useRouter();

  const { project, error, isLoading } = useProject(router.query.id as string);

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (error) {
      setErrors((prev) => {
        return [...prev, error];
      });
    }
  }, [error]);

  const handleSubmissionComplete = async (project: Project) => {
    // TODO: handle submission problems. Should this be a success callback only?
    await router.push(`/dashboard/projects/${project.id}`);
  };

  const handleSubmissionError = async ({ error }: { error: string }) => {
    error;
  };

  return (
    <Layout errors={errors}>
      {isLoading && <p>⏲️ Loading...</p>}
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
            onSubmitError={handleSubmissionError}
            championReadonly={true}
          />
        </>
      )}
    </Layout>
  );
}
