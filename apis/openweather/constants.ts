import { Day, TimeOfDay } from './enums';

export const dayOfWeek = [Day.Sunday, Day.Monday, Day.Tuesday, Day.Wednesday, Day.Thursday, Day.Friday, Day.Saturday];

export const timeOfDay = new Map([
  ['00:00:00', TimeOfDay.Midnight],
  ['03:00:00', TimeOfDay.Overnight],
  ['06:00:00', TimeOfDay.Overnight],
  ['09:00:00', TimeOfDay.Morning],
  ['12:00:00', TimeOfDay.Noon],
  ['15:00:00', TimeOfDay.Afternoon],
  ['18:00:00', TimeOfDay.Evening],
  ['21:00:00', TimeOfDay.Night],
]);
