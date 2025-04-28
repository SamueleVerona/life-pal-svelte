import Landing from "./components/pages/Landing.svelte";
import UserSign from "./components/pages/UserSign.svelte";
import UserHome from "./components/pages/UserHome.svelte";
// import UserHome from "./components/pages/UserHome";

export default {
  "/": Landing,
  "/sign": UserSign,
  "/home": UserHome,
  "*": Landing, // fallback tipo 404
};
