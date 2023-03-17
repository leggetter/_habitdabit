import { useRouter } from "next/router";
import { useProject } from "lib/project-helpers";
import Layout from "components/layout";
import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  Text,
} from "@chakra-ui/react";
import { DateTime } from "luxon";
import { createWeeklySchedule } from "lib/habit-helpers";
import { IWeeklyHabitSchedule } from "db/models/project";

export default function SchedulePage() {
  const router = useRouter();
  const {
    project,
    error: projectError,
    isLoading,
  } = useProject(router.query.id as string);
  const [errors, setErrors] = useState<string[]>([]);
  const [week, setWeek] = useState<Date | undefined>();
  const [weeklySchedule, setWeeklySchedule] = useState<
    IWeeklyHabitSchedule | undefined
  >();

  useEffect(() => {
    if (router.query.week) {
      const weekBeginning = new Date(router.query.week as string);
      setWeek(weekBeginning);
    }
  }, [router]);

  useEffect(() => {
    if (project) {
      if (!project.weeklySchedules) {
        project.weeklySchedules = [];
      }

      let currentWeek = project.weeklySchedules.find((schedule) => {
        return schedule.weekStartDate === week;
      });
      if (!currentWeek && project.habitsScheduleTemplate) {
        currentWeek = createWeeklySchedule(project.habitsScheduleTemplate);
      }
      if (currentWeek) {
        setWeeklySchedule(currentWeek);
      }
    }
  }, [project]);

  return (
    <Layout>
      {isLoading && <p>⏲️ Loading...</p>}
      {errors.length > 0 && (
        <p>
          {errors.map((e) => {
            return <p>{e}</p>;
          })}
        </p>
      )}
      {errors.length === 0 && !isLoading && !project && (
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
          <BreadcrumbLink href={`/dashboard/projects/${project?.id}/schedule`}>
            schedule
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink
            href={`/dashboard/projects/${project?.id}/schedule/${router.query.week}`}
          >
            {week && DateTime.fromJSDate(week).toFormat("EEEE MM MMMM yyyy")}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Box as="section" mt={10}>
        <Heading as="h1">
          Habits for{" "}
          {week && DateTime.fromJSDate(week).toFormat("EEEE MM MMMM yyyy")}
        </Heading>

        {project && !project.habitsScheduleTemplate && (
          <Text>
            A Habit template must be defined before setting a schedule.
          </Text>
        )}

        <Box>{weeklySchedule && JSON.stringify(weeklySchedule, null, 2)}</Box>
      </Box>
    </Layout>
  );
}
