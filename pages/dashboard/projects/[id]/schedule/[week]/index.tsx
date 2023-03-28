import { useRouter } from "next/router";
import { deepCopy, ProjectValues, useProject } from "lib/project-helpers";
import Layout from "components/layout";
import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Checkbox,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { DateTime } from "luxon";
import { createWeeklySchedule, DAYS_OF_WEEK } from "lib/habit-helpers";
import {
  ISingleScheduledHabit,
  IWeeklyHabitSchedule,
  Project,
} from "db/models/project";
import { useSession } from "next-auth/react";

const calculateTotalValue = (weeklySchedule: IWeeklyHabitSchedule) => {
  let totalValue = 0;
  let completedValue = 0;
  weeklySchedule.days!.forEach((day) => {
    day.habits!.forEach((habit) => {
      totalValue += habit.value || 0;
      completedValue += habit.completed === true ? habit.value! : 0;
    });
  });
  return { totalValue, completedValue };
};

function DayOfWeekListing({
  day,
  habits,
  habitCompletedChanged,
  canEdit,
}: {
  day: string;
  habits: Array<ISingleScheduledHabit>;
  habitCompletedChanged: (
    day: string,
    habitIndex: number,
    habitCompleted: boolean
  ) => void;
  canEdit: boolean;
}) {
  return (
    <Box mb={10} width={{ md: "100%", lg: 600 }}>
      <Heading as="h3" size="lg">
        {day}
      </Heading>
      {habits.length === 0 && <Box>No habits defined for {day}</Box>}
      {habits.map((habit, index) => {
        return (
          <HStack
            key={`${day}_habit_${index}`}
            align="stretch"
            alignContent="center"
            justifyContent="center"
            mt={2}
          >
            <Box width={400} mr={5}>
              {habit.description}
            </Box>
            <Box width={200} pr={5} textAlign="right">
              {habit.value}
            </Box>
            {canEdit && (
              <Box>
                <Checkbox
                  isChecked={habit.completed}
                  onChange={(event) => {
                    habitCompletedChanged(day, index, event.target.checked);
                  }}
                />
              </Box>
            )}
          </HStack>
        );
      })}
    </Box>
  );
}

const findWeeklyScheduleIndex = (
  project: ProjectValues,
  week: Date
): number => {
  const weekIndex = project?.weeklySchedules?.findIndex((schedule) => {
    if (typeof schedule.weekStartDate === "string") {
      // workaround https://github.com/tigrisdata/tigris-client-ts/issues/227
      schedule.weekStartDate = new Date(schedule.weekStartDate);
    }
    return schedule.weekStartDate?.getTime() === week?.getTime();
  });

  return weekIndex !== undefined ? weekIndex : -1;
};

const findWeeklySchedule = (
  project: ProjectValues,
  week: Date
): undefined | IWeeklyHabitSchedule => {
  if (!project.weeklySchedules) {
    return undefined;
  }
  let currentWeek = project.weeklySchedules.find((schedule) => {
    if (typeof schedule.weekStartDate === "string") {
      // workaround https://github.com/tigrisdata/tigris-client-ts/issues/227
      schedule.weekStartDate = new Date(schedule.weekStartDate);
    }
    return (
      schedule.weekStartDate &&
      schedule.weekStartDate.getTime() === week.getTime()
    );
  });
  return currentWeek;
};

export default function SchedulePage() {
  const router = useRouter();
  const {
    project,
    error: projectError,
    isLoading,
  } = useProject(router.query.id as string);
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [week, setWeek] = useState<Date | undefined>();
  const [weeklySchedule, setWeeklySchedule] = useState<
    IWeeklyHabitSchedule | undefined
  >();
  const { data: session } = useSession();

  useEffect(() => {
    if (router.query.week) {
      const weekBeginning = new Date(router.query.week as string);
      setWeek(weekBeginning);
    }
  }, [router]);

  useEffect(() => {
    if (week && project) {
      if (project.weeklySchedules === undefined) {
        console.log("Creating weekly schedules Array", project.weeklySchedules);
        project.weeklySchedules = [];
      }

      let currentWeek = findWeeklySchedule(project, week);

      if (!currentWeek && project.habitsScheduleTemplate) {
        console.log("Creating weekly schedule");
        currentWeek = createWeeklySchedule(
          week,
          project.habitsScheduleTemplate
        );
        project.weeklySchedules.push(currentWeek);
      }
      if (currentWeek) {
        setWeeklySchedule(currentWeek);
      }
    }
  }, [project, week]);

  const saveWeeklySchedules = async (
    weeklySchedules: IWeeklyHabitSchedule[]
  ) => {
    setSaving(true);
    const projectValues = new ProjectValues({
      weeklySchedules: weeklySchedules,
    });
    const params: RequestInit = {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(projectValues),
    };

    try {
      const response = await fetch(`/api/v1/projects/${project!.id}`, params);
      if (response.status === 200) {
        const body = (await response.json()) as Project;
      } else {
        const body = await response.json();
        setErrors((prev) => {
          return [...prev, body.error];
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrors((prev) => [...prev, err.toString()]);
    }
    setSaving(false);
  };

  const handleHabitCompletedChange = (
    day: string,
    habitIndex: number,
    habitCompleted: boolean
  ) => {
    const dayIndex = DAYS_OF_WEEK.indexOf(day);
    const habitDay = weeklySchedule!.days![dayIndex];
    habitDay.habits![habitIndex].completed = habitCompleted;
    const updatedWeeklySchedule: IWeeklyHabitSchedule =
      deepCopy(weeklySchedule);
    setWeeklySchedule(updatedWeeklySchedule);

    const weekIndex = findWeeklyScheduleIndex(project!, week!);

    if (weekIndex === -1) {
      setErrors((prev) => [
        ...prev,
        "Error saving: could not find current week in weekly schedules for the project",
      ]);
    } else {
      project!.weeklySchedules![weekIndex!] = updatedWeeklySchedule;

      try {
        saveWeeklySchedules(project!.weeklySchedules!);
      } catch (err: any) {
        setErrors((prev) => [...prev, `Error saving: ${err.toString()}`]);
      }
    }
  };

  const resetSchedule = () => {
    const currentWeek = createWeeklySchedule(
      week!,
      project!.habitsScheduleTemplate!
    );
    const weekIndex = findWeeklyScheduleIndex(project!, week!);
    project!.weeklySchedules![weekIndex] = currentWeek;
    setWeeklySchedule(currentWeek);

    saveWeeklySchedules(project!.weeklySchedules!);
  };

  if (isLoading) {
    return (
      <Layout>
        <p>⏲️ Loading...</p>
      </Layout>
    );
  }

  /*
  TODOs

  1. ✅ Display the current schedule
  2. Depending on the permission the current user has, allow them to edit the weekly schedule
    a. Mark habits as complete
    b. Reset the weekly schedule base on the current template
  */
  const { totalValue, completedValue } = weeklySchedule
    ? calculateTotalValue(weeklySchedule)
    : { totalValue: 0, completedValue: 0 };

  return (
    <Layout>
      {errors.length > 0 && (
        <Box backgroundColor="red" color="white" p={5} m={10}>
          {errors.map((e, i) => {
            return <p key={`error_${i}`}>{e}</p>;
          })}
        </Box>
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
            {week && DateTime.fromJSDate(week).toFormat("EEEE dd MMMM yyyy")}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Box as="section" mt={10}>
        <Heading as="h1">
          Habits for{" "}
          {week && DateTime.fromJSDate(week).toFormat("EEEE dd MMMM yyyy")}
        </Heading>

        {project && !project.habitsScheduleTemplate && (
          <Text>
            A Habit template must be defined before setting a schedule.
          </Text>
        )}

        {weeklySchedule && (
          <>
            {saving && (
              <Box
                position="absolute"
                width="100%"
                height="100%"
                bg="blackAlpha.300"
                backdropFilter="blur(1px) hue-rotate(90deg)"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Text>⏳ Saving...</Text>
              </Box>
            )}
            <Box mt={5}>
              {DAYS_OF_WEEK.map((day, index) => (
                <DayOfWeekListing
                  key={`day_of_week_${day}`}
                  day={day}
                  habits={weeklySchedule.days![index].habits!}
                  habitCompletedChanged={handleHabitCompletedChange}
                  canEdit={
                    project?.adminEmails?.includes(session?.user!.email!) ===
                    true
                  }
                />
              ))}
            </Box>
            <Box mb={5}>Total potential value: {totalValue}</Box>
            <Box mb={5}>Total completed value: {completedValue}</Box>
            <Box>
              <Button colorScheme="red" onClick={resetSchedule}>
                Reset schedule
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Layout>
  );
}
