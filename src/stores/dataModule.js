import { writable, get } from "svelte/store";
import { auth } from "./authModule.js";
import * as helpers from "./helpers/dataHelpers.js";

const initialData = {
  username: null,
  userGoals: [],
  expiredGoals: [],
  ongoingGoals: [],
  pastGoals: [],
  failedGoals: [],
  completedGoals: [],
  allRequests: [],
};

function createDataStore() {
  const store = writable(initialData);
  const { subscribe, update, set } = store;

  return {
    subscribe,
    async getData(dataType) {
      const credentials = get(auth);

      try {
        const UID = credentials.userToken;
        const token = credentials.sessionToken;
        const isAdmin = credentials.userIsAdmin;

        let urlMod;

        if (!isAdmin) {
          if (dataType === "all") {
            urlMod = UID;
          } else if (dataType === "goal") {
            urlMod = UID + "/goals";
          } else {
            urlMod = UID + "/requests";
          }
        } else {
          urlMod = "";
        }

        const res = await fetch(
          `https://life-pal-89067-default-rtdb.europe-west1.firebasedatabase.app/users/${urlMod}.json?auth=${token}`
        );

        const resData = await res.json();

        if (!res.ok) throw new Error("Couldn't retrieve data.\n Try again");

        if (!isAdmin) {
          if (dataType === "all") {
            if (!resData) {
              return set(initialData);
            }

            const requests = resData.requests
              ? helpers.setDatabaseId(resData.requests)
              : [];

            const goals = resData.goals
              ? await this.checkGoals(helpers.setDatabaseId(resData.goals))
              : [];

            const checked = helpers.checkCompletion(goals);

            update((state) => ({
              ...state,
              password: resData.password,
              email: resData.email,
              username: resData.username,
              userGoals: goals,
              ongoingGoals: checked.ongoing,
              pastGoals: checked.past,
              failedGoals: checked.failed,
              completedGoals: checked.completed,
              allRequests: requests,
            }));
          } else if (dataType === "goal") {
            const goals = resData
              ? await this.checkGoals(helpers.setDatabaseId(resData))
              : [];

            const checked = helpers.checkCompletion(goals);
            update((state) => ({
              ...state,
              userGoals: goals,
              ongoingGoals: checked.ongoing,
              pastGoals: checked.past,
              failedGoals: checked.failed,
              completedGoals: checked.completed,
            }));
          } else {
            const requests = resData ? helpers.setDatabaseId(resData) : [];
            update((state) => ({ ...state, allRequests: requests }));
          }
        } else {
          let allUsersRequests = resData
            ? helpers.extractRequests(resData)
            : [];

          update((state) => ({ ...state, allRequests: [...allUsersRequests] }));
        }
      } catch (err) {
        throw err.message;
      }
    },
    checkGoals(goals) {
      const expired = [];

      const checkedGoals = goals.map((goal) => {
        if (!goal.isCompleted && !goal.isFailed) {
          const isExpired = helpers.checkExpiration(goal);
          if (isExpired) {
            expired.push(goal);
          }
        }
        return goal;
      });

      update((state) => ({ ...state, expiredGoals: expired }));
      return checkedGoals;
    },
    async deleteData(payload) {
      const credentials = get(auth);

      const sessionToken = credentials.sessionToken;
      const UID = credentials.userToken;
      let urlMod;
      let itemMod;

      const deletionType = payload.type;
      let itemsToDelete = payload.items;

      if (deletionType === "account") itemsToDelete = [0];

      const deletePromises = itemsToDelete.map((item) => {
        if (deletionType === "goal") {
          urlMod = UID + "/goals";
          itemMod = item.id;
        } else if (deletionType === "request") {
          urlMod = item.userId + "/requests";
          itemMod = item.id;
        } else {
          urlMod = UID;
          itemMod = "";
        }

        return fetch(
          `https://life-pal-89067-default-rtdb.europe-west1.firebasedatabase.app/users/${urlMod}/${itemMod}.json?auth=${sessionToken}`,
          {
            method: "DELETE",
          }
        );
      });

      const resData = await Promise.allSettled(deletePromises);

      const resStatuses = resData.map((res) => {
        return { status: res.value.status, message: res.value.statusText };
      });
      const someRejected = resStatuses.some((res) => res.status != 200);

      if (someRejected) {
        const error = resStatuses.reduce((accum, curr) => {
          accum.push(curr.status);
          return "errors: (" + accum + ")";
        }, []);
        console.warn(error);
        throw new Error("Couldn't delete your data.\nTry again");
      } else {
        if (deletionType !== "account") {
          this.getData(payload.type);
        } else {
          return true;
        }
      }
    },
    async sendData(payload) {
      const credentials = get(auth);
      try {
        const sessionToken = credentials.sessionToken;
        const UID = credentials.userToken;
        const curGoals = get(userData).userGoals;
        const curReq = get(userData).allRequests;

        let urlMod = UID;
        let method;
        let body;
        let itemsArr;

        if (payload.type === "request") {
          urlMod += "/requests";
          itemsArr = curReq;
        } else {
          urlMod += "/goals";
          itemsArr = curGoals;
        }

        if (itemsArr.length > 0) {
          method = "POST";
          body = JSON.stringify({ ...payload.data, userId: UID });
        } else {
          const id = helpers.generateId();
          method = "PUT";
          body = JSON.stringify({ [id]: { ...payload.data, userId: UID } });
        }

        const res = await fetch(
          `https://life-pal-89067-default-rtdb.europe-west1.firebasedatabase.app/users/${urlMod}.json?auth=${sessionToken}`,
          {
            method,
            headers: {
              "Content-Type": "application/json",
            },
            body,
          }
        );

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(
            resData.message || "Failed to load new goal.\nTry again"
          );
        }

        this.getData(payload.type);
      } catch (err) {
        throw err.message;
      }
    },
    resetData() {
      store.set(initialData);
    },
    async confirmExpired(goalsToPatch) {
      const credentials = get(auth);

      const sessionToken = credentials.sessionToken;
      const UID = credentials.userToken;

      const goalsToArray = Object.values(goalsToPatch);

      try {
        const deletePromises = goalsToArray.map((goal) => {
          return fetch(
            `https://life-pal-89067-default-rtdb.europe-west1.firebasedatabase.app/users/${UID}/goals/${goal.itemId}.json?auth=${sessionToken}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                isCompleted: goal.isCompleted,
                isFailed: goal.isFailed,
              }),
            }
          );
        });

        const patched = await Promise.allSettled(deletePromises);

        const someRejected = patched.some((res) => res.status === "rejected");

        if (someRejected) {
          throw new Error("Couldn't set goals status.\nTry again");
        } else {
          this.getData("goal");
        }
      } catch (err) {
        throw err.message;
      }
    },
    async changeReqState(reqsToPatch) {
      console.log(reqsToPatch);

      const credentials = get(auth);
      const sessionToken = credentials.sessionToken;

      try {
        const patchPromises = reqsToPatch.map((req) => {
          console.log(req);
          return fetch(
            `https://life-pal-89067-default-rtdb.europe-west1.firebasedatabase.app/users/${req.userId}/requests/${req.itemId}.json?auth=${sessionToken}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                itemLabel: req.itemLabel,
                reply: req.reply,
              }),
            }
          );
        });

        const patched = await Promise.allSettled(patchPromises);

        console.log(patched);

        const someRejected = patched.some((res) => res.status === "rejected");

        if (someRejected) {
          throw new Error("Couldn't change requests status.\nTry again");
        } else {
          this.getData("request");
        }
      } catch (err) {
        throw err.message;
      }
    },
  };
}

export const userData = createDataStore();
