import { useRouter } from "next/router";
import Layout from "components/layout";

import {
  Heading,
  Table,
  Tbody,
  Tr,
  Td,
  TableContainer,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Box,
} from "@chakra-ui/react";
import { ProjectValues, useProject } from "lib/project-helpers";
import EditButton from "components/projects/edit-button";
import HDLinkButton from "components/hd-link-button";
import { ISingleHabitTemplate } from "db/models/project";

function DayOfWeekListing({
  day,
  habits,
}: {
  day: string;
  habits: Array<ISingleHabitTemplate>;
}) {
  return (
    <Box>
      <Heading as="h3">{day}</Heading>
      {habits.length === 0 && <Box>No habits defined for {day}</Box>}
      {habits.map((habit) => {
        return <Box>{habit.description}</Box>;
      })}
    </Box>
  );
}

export default function TemplatePage() {
  const router = useRouter();

  const { project, error, isLoading } = useProject(router.query.id as string);

  return (
    <Layout>
      {isLoading && <p>⏲️ Loading...</p>}
      {error && <p>{error}</p>}
      {!error && !isLoading && !project && (
        /* TODO: this should be a 404 */ <p>No project found</p>
      )}
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
          <BreadcrumbLink href={`/dashboard/projects/${project?.id}/template`}>
            template
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {project && (
        <>
          <Box mt={5}>
            {project.habitsScheduleTemplate.days.length === 0 && (
              <Box>No habits defined.</Box>
            )}
            {project.habitsScheduleTemplate.days.length > 0 && (
              <DayOfWeekListing
                day="Monday"
                habits={project.habitsScheduleTemplate.days[0].habits}
              />
            )}
          </Box>
        </>
      )}
    </Layout>
  );
}
