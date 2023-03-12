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
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  FormControl,
  FormLabel,
  Input,
  Flex,
} from "@chakra-ui/react";
import { deepCopy, ProjectValues, useProject } from "lib/project-helpers";
import {
  ISingleHabitTemplate,
  IWeeklyHabitTemplate,
  Project,
} from "db/models/project";
import { useState } from "react";
import { create } from "domain";

function DayOfWeekListing({
  day,
  habits,
  addButtonClicked,
}: {
  day: string;
  habits: Array<ISingleHabitTemplate>;
  addButtonClicked: (day: string) => void;
}) {
  return (
    <Box mb={10}>
      <Heading as="h3" size="lg">
        <Box as="span" display="inline-block" width={200}>
          {day}
        </Box>{" "}
        <Button
          title="Add new habit"
          onClick={() => {
            addButtonClicked(day);
          }}
        >
          +
        </Button>
      </Heading>
      {habits.length === 0 && <Box>No habits defined for {day}</Box>}
      {habits.map((habit) => {
        return (
          <Flex direction="row">
            <Box width={200} mr={5}>
              {habit.description}
            </Box>
            <Box>{habit.value}</Box>
          </Flex>
        );
      })}
    </Box>
  );
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const createWeeklyTemplate = (): IWeeklyHabitTemplate => {
  const template: IWeeklyHabitTemplate = {
    days: [
      // monday
      {
        habits: [],
      },
      // tuesday
      {
        habits: [],
      },
      // wednesday
      {
        habits: [],
      },
      // thursday
      {
        habits: [],
      },
      // friday
      {
        habits: [],
      },
      // saturday
      {
        habits: [],
      },
      // sunday
      {
        habits: [],
      },
    ],
  };
  return template;
};

export default function TemplatePage() {
  const router = useRouter();

  const { project, error, isLoading } = useProject(router.query.id as string);

  const [weeklySchedule, setWeeklySchedule] = useState<IWeeklyHabitTemplate>(
    project?.habitsScheduleTemplate || createWeeklyTemplate()
  );
  const [edited, setEdited] = useState<boolean>(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isCancelDialogOpen,
    onOpen: cancelDialogOnOpen,
    onClose: cancelDialogOnClose,
  } = useDisclosure();
  const [editingHabitDay, setEditingHabitDay] = useState<string | null>(null);
  const [habitDescription, setHabitDescription] = useState<string>("");
  const [habitValue, setHabitValue] = useState<number>(0);

  const handleAddButtonClick = (day: string) => {
    setEditingHabitDay(day);
    onOpen();
  };

  const handleHabitCancel = () => {
    if (habitDescription.length > 0 || habitValue > 0) {
      cancelDialogOnOpen();
    } else {
      onClose();
    }
  };

  const clearHabitEditing = () => {
    setHabitDescription("");
    setHabitValue(0);
    setEditingHabitDay(null);
  };

  const confirmCancellingHabitCreation = () => {
    onClose();
    cancelDialogOnClose();
    clearHabitEditing();
  };

  const handleHabitSave = () => {
    if (editingHabitDay === null) {
      throw Error("editingHabitDay must be set");
    }
    const dayIndex = DAYS_OF_WEEK.indexOf(editingHabitDay);
    const scheduleDay = weeklySchedule.days[dayIndex];
    scheduleDay.habits.push({
      description: habitDescription,
      value: habitValue,
    });
    const updatedWeeklySchedule = deepCopy(weeklySchedule);
    setWeeklySchedule(updatedWeeklySchedule);
    setEdited(true);
    onClose();
    clearHabitEditing();
  };

  const calculateTotalValue = (weeklySchedule: IWeeklyHabitTemplate) => {
    let totalValue = 0;
    weeklySchedule.days.forEach((day) => {
      day.habits.forEach((habit) => {
        totalValue += habit.value || 0;
      });
    });
    return totalValue;
  };

  const saveWeeklyScheduleTemplate = async () => {
    const projectValues = new ProjectValues({
      habitsScheduleTemplate: weeklySchedule,
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
      const body = (await response.json()) as Project;
      // onSubmitComplete(body);
    } catch (err) {
      // TODO: have some form-level errors
      console.error(err);
    }
  };

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

      <Modal
        closeOnOverlayClick={false}
        isOpen={isCancelDialogOpen}
        onClose={handleHabitCancel}
        isCentered
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody pb={6}>
            Are you sure you with to cancel creating the habit?
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={confirmCancellingHabitCreation}
            >
              Yes
            </Button>
            <Button onClick={cancelDialogOnClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={handleHabitCancel}
        isCentered
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a new Habit</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Habit description</FormLabel>
              <Input
                name="habit_description"
                onChange={(ev) => {
                  setHabitDescription(ev.target.value);
                }}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Value</FormLabel>
              <Input
                type="number"
                name="habit_value"
                onChange={(ev) => {
                  setHabitValue(Number(ev.target.value));
                }}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleHabitSave}>
              Save
            </Button>
            <Button onClick={handleHabitCancel}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {weeklySchedule && (
        <>
          <Box mt={5}>
            {DAYS_OF_WEEK.map((day, index) => (
              <DayOfWeekListing
                day={day}
                habits={weeklySchedule.days[index].habits}
                addButtonClicked={handleAddButtonClick}
              />
            ))}
          </Box>
          <Box mb={5}>
            Total potential value: {calculateTotalValue(weeklySchedule)}
          </Box>
          <Box>
            <Button
              colorScheme="blue"
              isDisabled={!edited}
              onClick={saveWeeklyScheduleTemplate}
            >
              Save
            </Button>
          </Box>
        </>
      )}
      {!weeklySchedule && <Text>No weekly schedule defined</Text>}
    </Layout>
  );
}
