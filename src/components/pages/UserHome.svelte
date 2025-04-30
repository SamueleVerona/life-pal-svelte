<script>
  import { auth } from "../../stores/authModule.js";
  import Dashboard from '../../components/layout/Dashboard.svelte'
  import Navbar from '../../components/layout/Navbar.svelte';
  import NewItem from '../../components/layout/NewItem.svelte';
  import User from '../../components/layout/User.svelte';
  import Dialog from "../base/Dialog.svelte";
  import Item from "../base/Item.svelte";
  import { push } from 'svelte-spa-router';
  import { onMount } from "svelte";
  import { userData } from "../../stores/dataModule.js";

  $: userIsAdmin = $auth.userIsAdmin;
  let dashboardView = 'goals';

  function handleView(view){
    dashboardView = view.detail;
  }
  let newItemToggle = false;
  let navbarToggle = true;

  $: expiredGoals = $userData.expiredGoals;

  let hasSomeExpired;
  $: {
      expiredGoals.length > 0 ? hasSomeExpired =  true : hasSomeExpired = false;
  }

  let dialogText = 'Time to be honest'
  let dialogBtnColor = ''

  $:markedGoals = {};

  $:allConfirmed =  Object.keys(markedGoals).length === expiredGoals.length;

  $:{
      if (allConfirmed) {
      dialogText = "Confirm";
      dialogBtnColor = "var(--confirm-change)";
    }
  }

  function handleMarkedGoals(goalObj) {
    const goalId = goalObj.detail.itemId;
    markedGoals[goalId] = goalObj.detail;
  }

  let errorMessage = null;

  async function confirmMarkedGoals() {
    try {
      await  userData.confirmExpired(markedGoals)
    } catch (err) {
      errorMessage = err;
    }
  }

  $:maxItemsReached= false;
  $:{
    if(maxItemsReached) newItemToggle = false;
  }
  $:currTimeSlot = null;


  $:isAuth = $auth.isAuth;
  onMount(()=>{
    auth.autoLogin()
    if(!isAuth)push('/sign')
  })
</script>

<Navbar toggle={navbarToggle} on:dashboardView={handleView}/>
<div class="flex flex-col size-full">
  {#if dashboardView ==='settings'}
    <User/>
  {/if}
  {#if dashboardView === 'goals' || dashboardView === 'requests'}
    <Dashboard bind:maxItemsReached={maxItemsReached} {dashboardView} newItemOpen={newItemToggle} bind:userIsAdmin {currTimeSlot} />
    {#if !userIsAdmin}
      <NewItem {dashboardView} open={newItemToggle} bind:chosenTimeSlot={currTimeSlot} /> 
      <div class="flex m-2 space-x-1">
        <button 
        class="
        btn 
        text-blue-600 
        bg-white 
        hover:bg-blue-600 
        hover:text-white 
        w-1/2 
        self-end 
        text-4xl 
        h-max 
        py-4 
        rounded-xl 
        shadow-lg
        z-10 
        sm:landscape:min-h-max
        " 
        on:click={()=> navbarToggle = !navbarToggle}
        >
          {navbarToggle ? 'Close Sidebar': 'Open Sidebar'}
        </button>
        <button 
        disabled={maxItemsReached} 
        class="
        btn 
        text-blue-600 
        bg-white 
        hover:bg-blue-600 
        hover:text-white 
        w-1/2 
        self-end 
        text-4xl 
        h-max 
        py-4 
        rounded-xl 
        shadow-lg
        z-10 
        sm:landscape:min-h-max
        " 
        on:click={()=> newItemToggle = !newItemToggle}
        >
          {newItemToggle ? 'close': 'New'}
        </button>
      </div>
    {/if}
  {/if}
</div>
<Dialog
show="{hasSomeExpired}"
userActive="{hasSomeExpired}"
submitText="{dialogText}"
allConfirmed="{allConfirmed}"
on:confirmAction="{confirmMarkedGoals}"
action='confirm'
>
  <div  slot=content  class="overflow-visible ">
    {#each expiredGoals as goal}
      <Item item="{goal}" hasExpired="{hasSomeExpired}" on:sendMarkedItem="{handleMarkedGoals}"/>
    {/each}
  </div>
</Dialog>

<style lang="scss"></style>