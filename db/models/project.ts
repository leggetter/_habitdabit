import {
  Field,
  PrimaryKey,
  TigrisCollection,
  TigrisDataTypes,
} from "@tigrisdata/core";

export interface ISingleHabitTemplate {
  description?: string;

  value?: number;
}

class SingleHabitTemplate implements ISingleHabitTemplate {
  @Field()
  public description?: string;

  @Field()
  public value?: number;
}

export interface ISingleScheduledHabit extends ISingleHabitTemplate {
  completed?: boolean;
}

class SingleScheduledHabit
  extends SingleHabitTemplate
  implements ISingleScheduledHabit
{
  @Field({ default: false })
  public completed?: boolean;
}

class DailyHabitTemplate {
  @Field(TigrisDataTypes.ARRAY, { elements: SingleHabitTemplate })
  habits: Array<SingleHabitTemplate> = [];
}

export interface IDailyHabitSchedule {
  habits?: Array<ISingleScheduledHabit>;
}

class DailyHabitSchedule implements IDailyHabitSchedule {
  @Field(TigrisDataTypes.ARRAY, { elements: SingleScheduledHabit })
  habits?: Array<SingleScheduledHabit>;
}

export interface IWeeklyHabitTemplate {
  days: Array<DailyHabitTemplate>;
}

class WeeklyHabitTemplate implements IWeeklyHabitTemplate {
  @Field(TigrisDataTypes.ARRAY, { elements: DailyHabitTemplate })
  days: Array<DailyHabitTemplate> = [];
}

export interface IWeeklyHabitSchedule {
  weekStartDate?: Date;

  /*
   * An Array that should have 7 elements (0 - 6) for each day of the week.
   * Each element should be an Array<IDailyHabitSchedule>
   */
  days?: Array<IDailyHabitSchedule>;
}

class WeeklyHabitSchedule implements IWeeklyHabitSchedule {
  @Field()
  weekStartDate?: Date;

  @Field({ elements: Array<DailyHabitSchedule> })
  days?: Array<DailyHabitSchedule>;
}

@TigrisCollection("projects")
export class Project {
  @PrimaryKey(TigrisDataTypes.INT32, { order: 1, autoGenerate: true })
  id?: number | string;

  @Field()
  name!: string;

  @Field({ maxLength: 128 })
  goalDescription!: string;

  @Field(TigrisDataTypes.INT32)
  ownerId!: number | string;

  @Field(TigrisDataTypes.ARRAY, { elements: TigrisDataTypes.INT32 })
  adminIds!: Array<number> | Array<string>;

  @Field(TigrisDataTypes.INT32)
  championId!: number | string;

  @Field(TigrisDataTypes.DATE_TIME, { timestamp: "createdAt" })
  createdAt?: Date;

  @Field(TigrisDataTypes.DATE_TIME)
  startDate!: Date;

  @Field()
  habitsScheduleTemplate?: WeeklyHabitTemplate;

  @Field({ elements: WeeklyHabitSchedule })
  weeklyHabitSchedules?: WeeklyHabitSchedule[];
}
