import {
  IDailyHabitSchedule,
  ISingleHabitTemplate,
  ISingleScheduledHabit,
  IWeeklyHabitSchedule,
  IWeeklyHabitTemplate,
} from "db/models/project";

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const createWeeklyTemplate = (): IWeeklyHabitTemplate => {
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

export const ensureWeekOfHabits = (schedule: IWeeklyHabitTemplate) => {
  for (let i = 0; i < 7; ++i) {
    if (schedule.days[i] === undefined) {
      schedule.days[i] = { habits: [] };
    }
  }
  return schedule;
};

const singleHabitTemplatesToSingleHabitScheduledHabits = (
  habitTemplates: ISingleHabitTemplate[]
) => {
  const scheduledHabits: ISingleScheduledHabit[] = [];
  habitTemplates.forEach((habit) => {
    scheduledHabits.push({
      description: habit.description,
      value: habit.value,
      completed: false,
    });
  });
  return scheduledHabits;
};

export const createWeeklySchedule = (
  week: Date,
  habitsScheduleTemplate: IWeeklyHabitTemplate
): IWeeklyHabitSchedule => {
  const schedule: IWeeklyHabitSchedule = {
    weekStartDate: week,
    days: new Array<IDailyHabitSchedule>(7),
  };

  habitsScheduleTemplate = ensureWeekOfHabits(habitsScheduleTemplate);

  habitsScheduleTemplate.days?.forEach((dayTemplate, index) => {
    schedule.days![index] = {
      habits: singleHabitTemplatesToSingleHabitScheduledHabits(
        dayTemplate.habits
      ),
    };
  });
  return schedule;
};
