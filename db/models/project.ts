import { Field, PrimaryKey, TigrisCollection, TigrisDataTypes } from "@tigrisdata/core";
import { User } from "./user";

@TigrisCollection("projects")
export class Project {
  @PrimaryKey(TigrisDataTypes.INT32, { order: 1, autoGenerate: true })
  id?: number;

  @Field()
  name!: string;

  @Field({ maxLength: 128, })
  goalDescription!: string;

  @Field()
  owner!: User;

  @Field(TigrisDataTypes.ARRAY, { elements: User })
  admins: Array<User> = new Array<User>();

  @Field()
  champion!: User;

  @Field({ timestamp: "createdAt" })
  createdAt!: Date;

  @Field()
  startDate!: Date;
}
