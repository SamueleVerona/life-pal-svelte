import Landing from "./components/pages/Landing.svelte";
import UserSign from "./components/pages/UserSign.svelte";
import UserHome from "./components/pages/UserHome.svelte";

export default {
  "/": Landing,
  "/sign": UserSign,
  "/home": UserHome,
  "*": Landing,
};
