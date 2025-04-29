import { writable, get } from "svelte/store";
import { userData } from "./dataModule.js";
import { push } from "svelte-spa-router";

const initialAuth = {
  sessionToken: null,
  userToken: null,
  userIsAdmin: false,
  userIsLocked: true,
  isAuth: false,
};
let timer;

function createAuthStore() {
  const store = writable(initialAuth);
  const { subscribe, update, set } = store;

  return {
    subscribe,
    async auth(email, password, mode) {
      let url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBBOAHr41imvdiIj9qPxRR0Ek2AZr_iTHk";

      if (mode === "signup") {
        url =
          "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBBOAHr41imvdiIj9qPxRR0Ek2AZr_iTHk";
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        const resError = resData.error.message.replaceAll("_", " ");
        console.warn(resData.error);

        throw new Error(
          resError[0] + resError.toLowerCase().slice(1) ||
            "Something is wrong with your credentials.\nCheck and try again"
        );
      }

      const isLockedUser =
        resData.localId === "BFQ0zvsDfFN3nZs8i9BHECOCSiH3" ||
        resData.localId === "55ZyLPwfc0UUdoBTJHgWAWQ9WIc2"
          ? true
          : false;

      const isAdmin = resData.localId === "2h8Fu1qGD5aF6ZUgzy7uD1ZVJB93";

      const tokenExpMS = +resData.expiresIn * 1000;
      const tokenExp = new Date().getTime() + tokenExpMS;

      timer = setTimeout(() => {
        this.logout();
        return;
      }, tokenExpMS);

      localStorage.setItem("sessionToken", resData.idToken);
      localStorage.setItem("userToken", resData.localId);
      localStorage.setItem("tokenExp", "" + tokenExp);
      localStorage.setItem("isAdmin", "" + isAdmin);
      localStorage.setItem("isLockedUser", "" + isLockedUser);

      const authState = {
        sessionToken: resData.idToken,
        userToken: resData.localId,
        userIsAdmin: isAdmin,
        userIsLocked: isLockedUser,
        isAuth: true,
      };

      update((state) => ({ ...state, ...authState }));

      userData.getData("all");
      push("/home");
    },
    autoLogin() {
      const sessionToken = localStorage.getItem("sessionToken");
      const userToken = localStorage.getItem("userToken");
      const tokenExp = localStorage.getItem("tokenExp");
      const isAdmin = localStorage.getItem("isAdmin");
      const isLockedUser = localStorage.getItem("isLockedUser");

      const newTokenExp = +tokenExp - new Date().getTime();
      if (newTokenExp < 1000) {
        this.logout();
      }

      timer = setTimeout(() => {
        this.logout();
      }, newTokenExp);

      if (sessionToken && userToken) {
        const authState = {
          sessionToken,
          userToken,
          userIsAdmin: JSON.parse(isAdmin),
          userIsLocked: JSON.parse(isLockedUser),
          isAuth: true,
        };

        update((state) => ({ ...state, ...authState }));
        userData.getData("all");
        push("/home");
      }
    },
    logout() {
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("userToken");
      localStorage.removeItem("tokenExp");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("isLockedUser");

      clearTimeout(timer);
      push("/");
      store.set(initialAuth);
      userData.resetData();
    },
    async deleteAccount() {
      const token = get(store).sessionToken;
      console.log("trigger delete");

      const dataDeleted = await userData.deleteData({ type: "account" });

      if (dataDeleted) {
        const delRequest = await fetch(
          "https://identitytoolkit.googleapis.com/v1/accounts:delete?key=AIzaSyBBOAHr41imvdiIj9qPxRR0Ek2AZr_iTHk",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken: token }),
          }
        );

        const resData = await delRequest.json();

        if (!delRequest.ok) {
          console.warn(resData.error.code, resData.error.message);
          throw new Error(
            resData.error.message || "Couldn't delete your account.\nTry again"
          );
        }

        this.logout();
      }
    },
  };
}

export const auth = createAuthStore();
