let timeSlot = "";

const today = new Date();

const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

function dateParser(incomingDate) {
  const date = new Date(incomingDate);
  const chosenDateYear = date.getFullYear();
  const chosenDateMonth = date.getMonth() + 1;

  const chosenDate = {
    year: chosenDateYear,
    month: chosenDateMonth,
    fulldate: date,
  };

  chosenDate.year > currentYear
    ? (timeSlot = "year")
    : selectTimeSLot(chosenDate);

  return timeSlot;
}

function selectTimeSLot(chosenDate) {
  if (chosenDate.month !== currentMonth && chosenDate.month >= currentMonth) {
    timeSlot = "month";
  } else {
    isDayOfThisWeek(chosenDate.fulldate)
      ? (timeSlot = "day")
      : (timeSlot = "week");
  }
}

function isDayOfThisWeek(chosenDate) {
  const date = new Date(chosenDate);
  const dayOfWeek = today.getDay();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek + 1);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  startOfWeek.setHours(0, 0, 0, 0);
  endOfWeek.setHours(23, 59, 59, 999);
  date.setHours(0, 0, 0, 0);

  return date >= startOfWeek && date <= endOfWeek;
}

export default dateParser;
