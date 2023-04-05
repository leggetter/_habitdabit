import { HamburgerIcon, DeleteIcon, CopyIcon, AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Heading,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { ISingleHabitTemplate } from "db/models/project";

export type HabitDescriptionChangedEvent = {
  day: string;
  habitIndex: number;
  habitDescription: string;
};

export type HabitDescriptionChanged = (
  event: HabitDescriptionChangedEvent
) => void;

export type HabitValueChangedEvent = {
  day: string;
  habitIndex: number;
  habitValue: number;
};

export type HabitValueChanged = (event: HabitValueChangedEvent) => void;

export enum HabitMoveDirection {
  UP,
  DOWN,
}

export type HabitMoveEvent = {
  day: string;
  habitIndex: number;
  direction: HabitMoveDirection;
};

export type HabitMoveRequest = (event: HabitMoveEvent) => void;

export function DayOfWeekListing({
  day,
  habits,
  addButtonClicked,
  removeButtonClicked,
  copyButtonClicked,
  habitDescriptionChanged,
  habitValueChanged,
  habitMoveRequested,
}: {
  day: string;
  habits: Array<ISingleHabitTemplate>;
  addButtonClicked: (day: string) => void;
  removeButtonClicked: (
    day: string,
    habitIndex: number,
    habitText: string
  ) => void;
  copyButtonClicked: (
    day: string,
    habitIndex: number,
    habitText: string
  ) => void;
  habitDescriptionChanged: HabitDescriptionChanged;
  habitValueChanged: HabitValueChanged;
  habitMoveRequested: HabitMoveRequest;
}) {
  return (
    <Box mb={10} width={{ base: "100%", md: 600 }}>
      <Heading as="h3" size="lg">
        {day}
      </Heading>
      {habits.length === 0 && <Box>No habits defined for {day}</Box>}
      {habits.map((habit, index) => {
        return (
          <HStack
            key={`${day}_habit_${habit.description}`}
            align="left"
            alignContent="left"
            justifyContent="left"
            alignItems="center"
            mt={2}
          >
            <Box width={400} mr={5}>
              <Input
                type="text"
                defaultValue={habit.description}
                onChange={(e) => {
                  habitDescriptionChanged({
                    day,
                    habitIndex: index,
                    habitDescription: e.target.value,
                  });
                }}
              />
            </Box>
            <Box width={200} pr={5} textAlign="right">
              <Input
                type="number"
                defaultValue={habit.value}
                onChange={(e) => {
                  habitValueChanged({
                    day,
                    habitIndex: index,
                    habitValue: Number(e.target.value),
                  });
                }}
              />
            </Box>
            <Box>
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="Options"
                  icon={<HamburgerIcon />}
                  variant="outline"
                />
                <MenuList>
                  <MenuItem
                    title="Remove Habit"
                    onClick={() => {
                      removeButtonClicked(day, index, habit.description!);
                    }}
                    icon={<DeleteIcon />}
                    aria-label={"Remove a habit"}
                  >
                    Delete
                  </MenuItem>
                  <MenuItem
                    title="Copy Habit to all days"
                    onClick={() => {
                      copyButtonClicked(day, index, habit.description!);
                    }}
                    icon={<CopyIcon />}
                    aria-label={"Copy a habit to all other days"}
                  >
                    Copy to all
                  </MenuItem>
                  {index > 0 && (
                    <MenuItem
                      title="Move habit up"
                      onClick={() => {
                        habitMoveRequested({
                          day,
                          habitIndex: index,
                          direction: HabitMoveDirection.UP,
                        });
                      }}
                      icon={<CopyIcon />}
                      aria-label={"Move habit up"}
                    >
                      Move habit up
                    </MenuItem>
                  )}
                  {index < habits.length - 1 && (
                    <MenuItem
                      title="Move habit down"
                      onClick={() => {
                        habitMoveRequested({
                          day,
                          habitIndex: index,
                          direction: HabitMoveDirection.DOWN,
                        });
                      }}
                      icon={<CopyIcon />}
                      aria-label={"Move habit down"}
                    >
                      Move habit down
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            </Box>
          </HStack>
        );
      })}
      <Box width={{ base: "100%", md: "600px" }} mt={2} textAlign="right">
        <IconButton
          title="Add new habit"
          onClick={() => {
            addButtonClicked(day);
          }}
          icon={<AddIcon />}
          aria-label={"add a new habit"}
        />
      </Box>
    </Box>
  );
}
