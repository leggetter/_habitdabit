import { Heading } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import AccessDenied from "../../../components/access-denied";
import Layout from "../../../components/layout";
import { useRouter } from "next/router";
import ProjectForm from "../../../components/projects/project-form";
import { Project } from "../../../db/models/project";
import { ProjectValues } from "../../../lib/project-helpers";
import { useState } from "react";

export default function CreateProject() {
  const { data: session } = useSession();
  const router = useRouter();

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmissionComplete = async (project: Project): Promise<void> => {
    await router.push(`/dashboard/projects/${project.id}`);
  };

  const handleSubmissionError = async ({ error }: { error: string }) => {
    setErrors((prev) => {
      return [...prev, error];
    });
  };

  if (!session) {
    return (
      <Layout errors={errors}>
        <AccessDenied />
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading as="h1">Create Project</Heading>

      <ProjectForm
        method="POST"
        action="/api/v1/projects"
        project={new ProjectValues({ owner: session.user.email })}
        onSubmitComplete={handleSubmissionComplete}
        onSubmitError={handleSubmissionError}
      />
    </Layout>
  );
}
