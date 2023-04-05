import { useRouter } from "next/router";
import Layout from "components/layout";

import {
  Heading,
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
} from "@chakra-ui/react";
import { deepCopy, ProjectValues, useProject } from "lib/project-helpers";
import { IWeeklyHabitTemplate, Project } from "db/models/project";
import React, { useEffect, useState } from "react";
import { ConfirmDialog } from "components/confirm-dialog";
import {
  createWeeklyTemplate,
  DAYS_OF_WEEK,
  ensureWeekOfHabits,
} from "lib/habit-helpers";
import {
  HabitDescriptionChangedEvent,
  HabitValueChangedEvent,
  DayOfWeekListing,
  HabitMoveEvent,
  HabitMoveDirection,
} from "components/days-of-week-listing";

export default function TemplatePage() {
  const router = useRouter();

  const [errors, setErrors] = useState<string[]>([]);
  const [savingButtonText, setSavingButtonText] = useState<string>("Save");
  const {
    project,
    error: projectError,
    isLoading,
  } = useProject(router.query.id as string);
  const [weeklySchedule, setWeeklySchedule] = useState<IWeeklyHabitTemplate>(
    project?.habitsScheduleTemplate
      ? ensureWeekOfHabits(project?.habitsScheduleTemplate)
      : createWeeklyTemplate()
  );

  useEffect(() => {
    if (project?.habitsScheduleTemplate) {
      setWeeklySchedule(project.habitsScheduleTemplate);
    }
  }, [project]);

  useEffect(() => {
    if (projectError) {
      setErrors((prev) => {
        return [...prev, projectError];
      });
    }
  }, [projectError]);

  const [edited, setEdited] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (saving) {
      setSavingButtonText("Saving");
    } else if (edited) {
      setSavingButtonText("Save");
    } else {
      setSavingButtonText("Saved");
    }
  }, [saving, edited]);

  const leavePageHandler = () => {
    return (
      "You have unsaved changes.\n" +
      "If you leave the page your changes will be lost.\n" +
      "Are you sure you wish to leave the page?"
    );
  };

  useEffect(() => {
    if (edited) {
      window.onbeforeunload = leavePageHandler;
    }
    return () => {
      window.onbeforeunload = null;
    };
  }, [edited]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [confirmDialogText, setConfirmDialogText] = useState<string>("");
  const [confirmDialogAction, setConfirmDialogAction] = useState<string>("");

  const [editingHabit, setEditingHabit] = useState<{
    day: string;
    habitIndex?: number;
  } | null>(null);
  const [habitDescription, setHabitDescription] = useState<string>("");
  const [habitValue, setHabitValue] = useState<number>(0);

  const handleAddButtonClick = (day: string) => {
    setEditingHabit({ day });
    onOpen();
  };

  const handleRemoveButtonClick = (
    day: string,
    habitIndex: number,
    habitText: string
  ) => {
    setEditingHabit({ day, habitIndex });
    setConfirmDialogText(
      `Are you sure you want to delete the habit "${habitText}"`
    );
    setShowConfirmDialog(true);
    setConfirmDialogAction("DELETE_HABIT");
  };

  const handleCopyButtonClick = (
    day: string,
    habitIndex: number,
    habitText: string
  ) => {
    setEditingHabit({ day, habitIndex });
    setConfirmDialogText(
      `Are you sure you want to copy the habit "${habitText}" to all days`
    );
    setShowConfirmDialog(true);
    setConfirmDialogAction("COPY_HABIT");
  };

  const handleConfirm = (action: string) => {
    switch (action) {
      case "CANCEL_CREATE_HABIT":
        confirmCancellingHabitCreation();
        break;
      case "DELETE_HABIT":
        handleHabitDelete();
        break;
      case "COPY_HABIT":
        handleHabitCopy();
        break;
    }
  };

  const handleHabitCancel = () => {
    if (habitDescription.length > 0 || habitValue > 0) {
      setConfirmDialogAction("CANCEL_CREATE_HABIT");
      setConfirmDialogText(
        "Are you sure you with to cancel creating the habit?"
      );
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const clearHabitEditing = () => {
    setHabitDescription("");
    setHabitValue(0);
    setEditingHabit(null);
  };

  const confirmCancellingHabitCreation = () => {
    onClose();
    setShowConfirmDialog(false);
    clearHabitEditing();
  };

  const handleHabitAdd = () => {
    if (editingHabit === null) {
      throw Error("editingHabitDay must be set");
    }
    const dayIndex = DAYS_OF_WEEK.indexOf(editingHabit.day);
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

  const handleHabitDelete = () => {
    const dayIndex = DAYS_OF_WEEK.indexOf(editingHabit!.day);
    const scheduleDay = weeklySchedule.days[dayIndex];
    scheduleDay.habits.splice(editingHabit?.habitIndex!, 1);

    const updatedWeeklySchedule = deepCopy(weeklySchedule);
    setWeeklySchedule(updatedWeeklySchedule);
    setEdited(true);
    setShowConfirmDialog(false);
    clearHabitEditing();
  };

  const handleHabitCopy = () => {
    const scheduleDay =
      weeklySchedule.days[DAYS_OF_WEEK.indexOf(editingHabit!.day)];
    const habitIndex = editingHabit!.habitIndex!;
    const habitToCopy = deepCopy(scheduleDay.habits[habitIndex]);
    for (let dayIndex = 0; dayIndex < weeklySchedule.days.length; ++dayIndex) {
      if (dayIndex === DAYS_OF_WEEK.indexOf(editingHabit!.day)) {
        continue;
      }

      if (
        weeklySchedule.days[dayIndex].habits.length > editingHabit!.habitIndex!
      ) {
        weeklySchedule.days[dayIndex].habits.splice(habitIndex, 0, habitToCopy);
      } else {
        scheduleDay.habits.push(habitToCopy);
      }
    }

    const updatedWeeklySchedule = deepCopy(weeklySchedule);
    setWeeklySchedule(updatedWeeklySchedule);
    setEdited(true);
    setShowConfirmDialog(false);
    clearHabitEditing();
  };

  function handleDescriptionChange({
    day,
    habitIndex,
    habitDescription,
  }: HabitDescriptionChangedEvent): void {
    const dayIndex = DAYS_OF_WEEK.indexOf(day);
    const scheduleDay = weeklySchedule.days[dayIndex];
    scheduleDay.habits[habitIndex].description = habitDescription;
    const updatedWeeklySchedule = deepCopy(weeklySchedule);
    setWeeklySchedule(updatedWeeklySchedule);
    setEdited(true);
  }

  const handleValueChange = ({
    day,
    habitIndex,
    habitValue,
  }: HabitValueChangedEvent) => {
    const dayIndex = DAYS_OF_WEEK.indexOf(day);
    const scheduleDay = weeklySchedule.days[dayIndex];
    scheduleDay.habits[habitIndex].value = habitValue;
    const updatedWeeklySchedule = deepCopy(weeklySchedule);
    setWeeklySchedule(updatedWeeklySchedule);
    setEdited(true);
  };

  const handleMoveRequest = ({
    day,
    habitIndex,
    direction,
  }: HabitMoveEvent) => {
    const dayIndex = DAYS_OF_WEEK.indexOf(day);
    const updatedWeeklySchedule = deepCopy(
      weeklySchedule
    ) as IWeeklyHabitTemplate;
    const scheduleDay = updatedWeeklySchedule.days[dayIndex];
    const toIndex = habitIndex + (direction === HabitMoveDirection.UP ? -1 : 1);

    if (toIndex < 0 || toIndex > scheduleDay.habits.length) {
      const errorMessage = `Cannot move habit to index ${toIndex}`;
      console.error(errorMessage);
      setErrors((prev) => [...prev, errorMessage]);
      return;
    }

    // Get a copy of the habit that is being moved
    const habitToMove = scheduleDay.habits[habitIndex];

    // Move the habit to the desired index and get the remove habit
    const habitToSwapWith = scheduleDay.habits.splice(
      toIndex,
      1,
      habitToMove
    )[0];

    // Replace the habit being moved with the previously moved one
    scheduleDay.habits.splice(habitIndex, 1, habitToSwapWith);

    setWeeklySchedule(updatedWeeklySchedule);
    setEdited(true);
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
    setSaving(true);
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
      if (response.status === 200) {
        const body = (await response.json()) as Project;
        setEdited(false);
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

  if (isLoading) {
    return (
      <Layout errors={errors}>
        <p>⏲️ Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout errors={errors}>
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
          <BreadcrumbLink href={`/dashboard/projects/${project?.id}/template`}>
            template
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        body={confirmDialogText}
        action={confirmDialogAction}
        onConfirm={handleConfirm}
        onCancel={() => {
          setShowConfirmDialog(false);
        }}
      />

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
            <Button colorScheme="blue" mr={3} onClick={handleHabitAdd}>
              Add
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
                key={`day_of_week_${day}`}
                day={day}
                habits={weeklySchedule.days[index].habits}
                addButtonClicked={handleAddButtonClick}
                removeButtonClicked={handleRemoveButtonClick}
                copyButtonClicked={handleCopyButtonClick}
                habitDescriptionChanged={handleDescriptionChange}
                habitValueChanged={handleValueChange}
                habitMoveRequested={handleMoveRequest}
              />
            ))}
          </Box>
          <Box mb={5}>
            Total potential value: {calculateTotalValue(weeklySchedule)}
          </Box>
          <Box>
            <Button
              colorScheme="blue"
              isDisabled={!edited || saving}
              onClick={saveWeeklyScheduleTemplate}
            >
              {savingButtonText}
            </Button>
          </Box>
        </>
      )}
      {!weeklySchedule && <Text>No weekly schedule defined</Text>}
    </Layout>
  );
}
