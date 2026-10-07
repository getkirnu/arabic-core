/** A calendar date without time or time zone. `month` is 1-based. */
export interface SimpleDate {
  year: number;
  month: number;
  day: number;
}

/** Minimal calendar interface used by the shared date arithmetic. */
export interface Calendar {
  monthLength(year: number, month: number): number;
  /** Days since 1970-01-01 (Gregorian, UTC). */
  toDayNumber(date: SimpleDate): number;
  fromDayNumber(dayNumber: number): SimpleDate;
  isValid(date: SimpleDate): boolean;
}
