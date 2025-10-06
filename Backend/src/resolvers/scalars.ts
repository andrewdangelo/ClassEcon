import { DateTimeResolver, JSONResolver } from "graphql-scalars";

export const scalars = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
};
