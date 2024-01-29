import { match } from "ts-pattern";

const rtf = new Intl.RelativeTimeFormat("en", {
  style: "long",
  numeric: "auto",
});

export const getRelativeTimeDifference = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diff = then.getTime() - now.getTime();
  const diffIn = {
    minutes: Math.round(diff / 1000 / 60),
    hours: Math.round(diff / 1000 / 60 / 60),
    days: Math.round(diff / 1000 / 60 / 60 / 24),
    weeks: Math.round(diff / 1000 / 60 / 60 / 24 / 7),
    months: Math.round(diff / 1000 / 60 / 60 / 24 / 30),
    years: Math.round(diff / 1000 / 60 / 60 / 24 / 365),
  };
  return match(diffIn)
    .with({ minutes: 0 }, () => "just now")
    .when(
      ({ minutes }) => minutes > -60,
      ({ minutes }) => rtf.format(minutes, "minutes")
    )
    .when(
      ({ hours }) => hours > -24,
      ({ hours }) => rtf.format(hours, "hours")
    )
    .when(
      ({ days }) => days > -7,
      ({ days }) => rtf.format(days, "days")
    )
    .when(
      ({ weeks }) => weeks > -4,
      ({ weeks }) => rtf.format(weeks, "weeks")
    )
    .when(
      ({ months }) => months > -12,
      ({ months }) => rtf.format(months, "months")
    )
    .when(
      ({ years }) => years > -100,
      ({ years }) => rtf.format(years, "years")
    )
    .otherwise(() => "long time ago");
};
