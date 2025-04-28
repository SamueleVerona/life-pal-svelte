export function checkExpiration(goal) {
  const now = new Date();
  const todayMS = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const startedMS = new Date(goal.started).getTime();
  const compDateParts = goal.compDate.split("-");
  const compMS = new Date(
    compDateParts[0],
    compDateParts[1] - 1,
    compDateParts[2]
  ).getTime();

  const totalTime = compMS - startedMS;
  const elapsedTime = todayMS - startedMS;
  const timeLeftS = (totalTime - elapsedTime) / 1000;

  if (timeLeftS <= 0) return true;
  return false;
}
export function generateId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";

  for (let i = 0; i < 22; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length - 1);
    id += characters[randomIndex];
  }
  return id;
}
export function setDatabaseId(dataObject) {
  const parsedArray = Object.entries(dataObject).map((item) => {
    if (!item[1].databaseId) item[1].databaseId = item[0];
    return item[1];
  });

  return parsedArray;
}
export function extractRequests(dataObject) {
  const parsedArray = Object.entries(dataObject).flatMap((item) => {
    return item[1].requests
      ? Object.entries(item[1].requests).map((req) => {
          return { ...req[1], databaseId: req[0] };
        })
      : [];
  });
  return parsedArray;
}
export function checkCompletion(goalsArr) {
  const checked = {
    completed: [],
    failed: [],
    ongoing: [],
    past: [],
  };

  goalsArr.forEach((goal) => {
    if (goal.isCompleted) checked.completed.push(goal);
    if (goal.isFailed) checked.failed.push(goal);
    if (goal.isCompleted || goal.isFailed) checked.past.push(goal);
    if (!goal.isCompleted && !goal.isFailed) checked.ongoing.push(goal);
  });

  return checked;
}
