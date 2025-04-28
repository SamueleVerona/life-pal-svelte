<script>
    import {auth} from '../../stores/authModule.js'
    import { userData } from '../../stores/dataModule.js';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let toggleProfile = false;

    function handleNavigation(e){
        const target = e.target.dataset.buttonId;
        if(target === 'profile')toggleProfile = !toggleProfile;
        if(target === 'requests')dispatch('dashboardView', 'requests');
        if(target === 'goals')dispatch('dashboardView', 'goals');
        if(target === 'settings')dispatch('dashboardView', 'settings');
        if(target === 'logout') auth.logout()
    }


</script>
    
<nav class="nav min-w-max w-max relative rounded-2xl p-6 m-2 mr-0 bg-white shadow-lg shadow-zinc-500/80">
    <h3 class="nav__section-id mb-3 text-center text-zinc-600  text-4xl">Dashboard</h3>
    <ul class="flex flex-col style-none  mb-6 " on:click={handleNavigation} on:keydown={handleNavigation}>
        <li>
            {#if !$auth.userIsAdmin}
          <button
            type="button"
            data-button-id="goals"
            class="btn btn-block btn-outline btn-primary h-20 mb-2 text-3xl rounded-xl shadow-md "
          >
            goals
          </button>
          {/if}
        </li>
        <li>
            <button
              type="button"
              data-button-id="requests"
              class="btn btn-block btn-outline btn-primary h-20  rounded-xl text-3xl shadow-md"
            >
              requests
            </button>
          </li>
    </ul>
    <h3 class="nav__section-id mb-3 text-center text-zinc-600  text-4xl ">Profile</h3>
    <ul class="flex flex-col style-none" on:click={handleNavigation} on:keypress={handleNavigation}>
        <li>
            <div
                class="mb-3 text-center overflow-visible"
            >
                <div class="avatar">
                    <div class="ring-accent m-4 ring-offset-base-100 w-24 rounded-full ring ring-offset-2 ">
                    <img src="src\assets\avatar.webp" alt="profile image" />
                    </div>
                </div>
            </div>
            <h4 class="badge badge-accent font-semibold text-white text-4xl border w-full mb-4 p-6">{$userData.username}</h4>
        </li>
        <li>
            <button type="button" data-button-id="settings" class="btn btn-block btn--settings btn-outline btn btn-accent h-20 text-3xl hover:text-white rounded-xl mb-2 shadow-md" >
                settings
            </button>
        </li>
        <li>
            <button type="button" data-button-id="logout" class="btn btn-block btn--logout btn-outline outline-6 btn btn-secondary h-20 text-3xl rounded-xl shadow-md">
                log out
            </button>
        </li>
    </ul>
</nav>
  
<style lang="scss">
    * {
        font-family: var(--font-stack);
    }
</style>
  