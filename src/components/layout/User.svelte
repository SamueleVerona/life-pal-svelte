<script>
  import {userData} from '../../stores/dataModule.js'
  import {auth} from '../../stores/authModule.js'
  import {push} from 'svelte-spa-router'
  import Dialog from '../base/Dialog.svelte';
  import avatarUrl from '$lib/assets/avatar.webp';

  $:username = $userData.username;
  $:email = $userData.email;
  $:password = $userData.password;
  $:userIsLocked = $auth.userIsLocked;

  let errorMessage, unsubText, dialogBkgColor;
  let unsubFlag = false;

  function unsub() {
    dialogBkgColor = "var(--danger-light)";
    errorMessage = `Thanks for using this app!\n Come back anytime`;
    unsubFlag = true;   
  }

  async function deleteAccount() {
    if (unsubFlag) {
      try {
        await auth.deleteAccount();
        push("/landing");

        errorMessage = false;
      } catch (err) {
        errorMessage = err;
      }
    }
    unsubFlag = false;
  }

</script>

<div class=" flex flex-col flex-1 rounded-lg m-2 ">
  <div class="leading-normal self-start ml-4 text-5xl pb-2">
    <h2>Profile Settings</h2>
  </div>
  <section class="user-metabox flex-1 overflow-y-auto ">
    <ul class="metadata overflow-visible text-4xl p-4 font-semibold grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
      <li class="metadata__meta shadow-zinc-400 shadow-lg rounded-xl p-4 bg-white metadata__meta--username"
      >
        <span class="metadata__meta-heading ml-4">User Name</span>
        <h3 class="text-3xl w-max mt-4 ml-4 py-2 px-3 rounded-xl text-zinc-800 bg-zinc-200"
        >
          {username}
        </h3>
      </li>
      <li class="metadata__meta shadow-zinc-400 shadow-lg rounded-xl p-4 bg-white metadata__meta--avatar"
      >
        <span class="metadata__meta-heading ml-4">Proile Image</span>
        <div class="flex items-center justify-center gap-4">
          <div class="inner-box flex flex-col mt-4 p-4">
            <div class="avatar overflow-visible">
              <div class="ring-accent ring-offset-base-100 w-32 rounded-full ring ring-offset-2"
              >
                <img src="{avatarUrl}" alt="profile" />
              </div>
            </div>
            <span class="mt-4 text-center font-normal">Current</span>
          </div>
          <div class="inner-box flex flex-col mt-4 p-4">
            <div class="avatar overflow-visible ">
              <div class="ring-offset-base-100 w-32 rounded-full ring ring-offset-2 flex items-center justify-center"
              >
                <span class="text-8xl block m-auto w-full h-full text-center text-zinc-600">
                  &plus;
                </span>
              </div>
            </div>
            <span class="mt-4 text-center  font-normal">New</span>
          </div>
        </div>
      </li>
      <li class="metadata__meta shadow-zinc-400 shadow-lg rounded-xl p-4 bg-white metadata__meta--email">
        <span class="metadata__meta-heading ml-4">Email</span>
        <h3 class="text-3xl w-max mt-4 ml-4 py-2 px-3 rounded-xl text-zinc-800 bg-zinc-200">
          {email}
        </h3>
      </li>
      <li class="metadata__meta shadow-zinc-400 shadow-lg rounded-xl p-4 bg-white metadata__meta--password">
        <span class="metadata__meta-heading ml-4">Password</span>
        <h3 class="text-3xl w-max mt-4 ml-4 py-2 px-3 rounded-xl text-zinc-800 bg-zinc-200">
          {password}
        </h3>
      </li>
      <li class="metadata__meta shadow-zinc-400 shadow-lg rounded-xl p-0 bg-white metadata__meta--unsubscribe">
        <button class="btn btn-error text-4xl py-4 w-full h-full hover:text-white " data-button-id="unsub" on:click={unsub} disabled={userIsLocked}>
          Delete Account
        </button>
      </li>
    </ul>
  </section>
</div>
<Dialog 
errorMessage="{errorMessage}"
show="{!!errorMessage}"
submitText="{unsubText}"
allConfirmed="{unsubFlag}"
action={errorMessage ? 'delete' : ''}
on:close="{()=> errorMessage = false}"
on:confirmAction="{deleteAccount}" 
/>

<style lang="scss">
  *{
      font-family: var(--font-stack);
  }
</style>