export const ms = {
  seconds(time: number) {
    return Math.round(time * 1e3);
  },
  minutes(time: number) {
    return Math.round(time * 6e4);
  },
  hours(time: number) {
    return Math.round(time * 36e5);
  },
  days(time: number) {
    return Math.round(time * 864e5);
  },
  weeks(time: number) {
    return Math.round(time * 6048e5);
  },
  months(time: number) {
    return Math.round(time * 26298e5);
  },
  years(time: number) {
    return Math.round(time * 315576e5);
  },
};
