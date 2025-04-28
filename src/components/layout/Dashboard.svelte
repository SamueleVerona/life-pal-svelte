<script>
  import Item from "../base/Item.svelte";
  import Dialog from "../base/Dialog.svelte";
  import {userData} from '../../stores/dataModule.js'
  import {onMount, onDestroy} from 'svelte'
  import { createEventDispatcher } from 'svelte';

  export let dashboardView, newItemOpen;
  export let userIsAdmin = false;
  export let maxItemsReached = false;
  export let currTimeSlot; 


  const dispatch = createEventDispatcher();

  $: requestsView = dashboardView === 'requests'

  let primaryFilterToggle = false;
  let primaryOptionSelected = '';

  $:{
    requestsView || userIsAdmin ? primaryOptionSelected = 'pending': primaryOptionSelected = 'all goals';
  }

  const requestsFilterOptions = ["pending", "accepted", "rejected"];
  const goalsFilterOptions = [
    "all goals",
    "month",
    "week",
    "day",
    "completed",
    "failed",
  ];

  $:  primaryFilterOptions = (requestsView || userIsAdmin )? requestsFilterOptions: goalsFilterOptions;

  function setOptions(itemsArr) {
    return itemsArr
      .map((item) => item.itemLabel)
      .reduce((accum, curr) => {
        if (!accum.includes(curr)) accum.push(curr);
        return accum;
      }, []);
  }
  let secondaryOptionSelected = 'all';

  let userGoals;
  
  $: {
    switch (primaryOptionSelected) {
      case "completed":
        userGoals = $userData.completedGoals
        break;

      case "failed":
        userGoals = $userData.failedGoals
        break;

      case "all goals":
        userGoals = $userData.ongoingGoals
        break;

      default:
        userGoals = $userData.ongoingGoals.filter(
          (goal) => goal.type === primaryOptionSelected
        );
        break;
    }
  }
  
  $:{
    if($userData.userGoals.length !== 0 && !timer){
      timer = setInterval(() => {
      itemTimeInc -= 1000;
    }, 1000);
    }
  }
  
  $: secondaryFilterOptions = setOptions(userGoals);

  $: filteredRequests = $userData.allRequests.filter(
    (req) => req.itemLabel === primaryOptionSelected
  );

  $: filteredGoals = (secondaryOptionSelected === "all") ?  
     userGoals : 
     userGoals.filter(
      (goal) => goal.itemLabel === secondaryOptionSelected);



  let secondaryFilterToggle, statsToggled, userIsAdding,userIsDeleting = false;
  let selectedItems = [];
  $:userIsEditing= false;


  $: itemsArray = requestsView || userIsAdmin ? filteredRequests : filteredGoals;
  
  //NEED TO ASSIGN PRIMARY OPTION ONLY IF NEW ITEM CARD EMITS NEW TIME SLOT
  // $:{
  //   if(currTimeSlot !== primaryOptionSelected) primaryOptionSelected = currTimeSlot;
  //   console.log(primaryOptionSelected);
  // }

  $:{
    if(itemsArray.length >= 10) {maxItemsReached = true}else{
      maxItemsReached = false
    }
  }

  function selectFilterOption(target) {
    userIsEditing = false;
    selectedItems = [];
    const isPrimaryOption = target.classList.contains(
      "selector__option--primary"
    );

    const isSecondaryOption = target.classList.contains(
      "selector__option--secondary"
    );
    const optionText = target.textContent.trim();

    if (isPrimaryOption) {
      primaryOptionSelected = optionText;
      secondaryOptionSelected = "all";
    }
    if (isSecondaryOption) secondaryOptionSelected = optionText;
  }

  async function deleteItems() {
    try {
      await userData.deleteData({
        type: requestsView || userIsAdmin ? "request" : "goal",
        items: selectedItems,
      });
      userIsEditing = false;
      userIsDeleting = false;
    } catch (err) {
      errorMessage = err;
    }
    selectedItems = [];
    userIsConfirming = false;
  }

  function handleTopControls(e) {
    const target = e.target;
    const validTarget = target.classList.contains("selector");
    const isPrimFilter = target.classList.contains("selector--primary");
    const isSecFilter = target.classList.contains("selector--secondary");
    const isSelectorOption = target.classList.contains("selector__option");
    const isBtnNewItem = target.classList.contains("btn--new-item");
    const isBtnStats = target.classList.contains("btn--stats");

    const isRequestBtn = target.id.includes("request");

    if (!validTarget) {
      primaryFilterToggle = false;
      secondaryFilterToggle = false;
      userIsEditing = false;
    }

    if (isPrimFilter) {
      primaryFilterToggle = !primaryFilterToggle;
    }
    if (isSecFilter) {
      secondaryFilterToggle = !secondaryFilterToggle;
    }
    if (isSelectorOption) {
      selectFilterOption(target);

    }
    if (isBtnNewItem) {
      dispatch('openNewItem')
    }
    if (isBtnStats) {
      statsToggled = !statsToggled;
    }
    if (isRequestBtn) {
      // addNewItem();
    }
  }

  function computeUserStats (data){
    const totalGoals = data.userGoals.length;
    const totalOngoing = data.ongoingGoals.length;

    const totalCompleted =data.completedGoals.length;
    const totalFailed = data.failedGoals.length;
    const totalExpired = totalCompleted + totalFailed;

    const successRate =
      ((totalCompleted * 100) / (totalExpired ? totalExpired : 1)).toFixed(1) +
      "%";
    const failRate =
      ((totalFailed * 100) / (totalExpired ? totalExpired : 1)).toFixed(1) + "%";

    const ongoingRate =
      (totalOngoing * 100) / (totalGoals ? totalGoals : 1) + "%";

    return {
      stringRate: `${totalOngoing}/${totalGoals}`,
      ongoingRate,
      successRate,
      failRate,
    };
  };

  $: userStats = computeUserStats($userData);



  //  FUNCTION FOR EXPIRED GOALS OR CHANGING REQUEST STATUS (ADMIN ONLY)
  function handleMarkedItems(item) {

  const id = item.itemId;
  const itemIndex = selectedItems.findIndex((itm) => itm.itemId === id);

  itemIndex >= 0
    ? (selectedItems[itemIndex] = item)
    : selectedItems.push(item);
  }

let itemsBoolArr= [];

  function handleSelected(item){
    const id = item.id;
    const itemExists = selectedItems.some(item=> item.id === id)

    const itemIndex = selectedItems.findIndex((itm) => itm.itemId === id);


    if(itemExists) { selectedItems = selectedItems.filter(item => item.id !== id);
      itemsBoolArr[itemIndex] = false
     }else{
      selectedItems.push(item);
      itemsBoolArr.push(true)

    } 
  }

let userIsConfirming = false;

function toggleListEdit() {
  userIsEditing = !userIsEditing;
  selectedItems = [];
  itemsBoolArr = [];
  if (!userIsAdmin) userIsDeleting = true;
}

let allSelectedFlag = false;


function selectAll() {
  const allSelected = itemsArray.map((item) => {
    return { userId: item.userId, id: item.databaseId };
  });

  const newBoolArr = new Array(itemsArray.length).fill(true)

  if (!allSelectedFlag && selectedItems.length === 0) {
    itemsBoolArr = newBoolArr;
    selectedItems = allSelected;
    allSelectedFlag = true;
  } else {
    itemsBoolArr = [];
    selectedItems = [];
    allSelectedFlag = false;
  }
}

function sendMarkedReqs() {
  userData.changeReqState(selectedItems)
  userIsEditing = false;
}
  
function handleListEdit(e) {
  const targetButton = e.target.dataset.buttonId;
  switch (targetButton) {
    case "edit":
      toggleListEdit();
      break;
    case "remove":
      userIsDeleting = !userIsDeleting;
      break;
    case "select-all":
      selectAll();
      break;
    case "confirm":
      userIsConfirming = true;
      break;
    case "save-change":
      sendMarkedReqs();
      break;
    default:
      userIsEditing = false;
      return;
  }
}

  let errorMessage = '';

  let timer;
  let itemTimeInc = 0;

 onMount(() => {

  requestsView || userIsAdmin
    ? (primaryOptionSelected = "pending")
    : (primaryOptionSelected = "all goals");

  });

  onDestroy(() => {
    clearInterval(timer)});

</script>

<section class="flex relative 
origin-top duration-700 {newItemOpen ? 'h-0':'grow flex-1'} " >
  <div class=" flex flex-col w-full h-full justify-between p-2">
    <section class=" flex items-center relative mb-4 z-10 overflow-visible " role="" aria-label="filters"  on:click={handleTopControls} on:keydown={handleTopControls}>
      <div class="flex items-center overflow-visible">
        <div class="selector cursor-pointer rounded-lg  bg-white  overflow-visible flex justify-center items-center relative shadow-lg  selector--primary dropdown dropdown-start" >
          <button class="text-3xl py-3 px-4 font-semibold bg-white selector__option selector__option--selected rounded-lg" inert 
          >
          {primaryOptionSelected}
          </button>
          <img class=" {primaryFilterToggle ? 'rotate-180' : ''} transition duration-300 block self-center w-8 h-8 mx-2" src="/src/assets/imgs/down-arrow.png" alt="" inert>
          {#if primaryFilterToggle}
            <ul 
              class="selector__list selector__list--primary absolute top-16 w-max left-0 mt-1 bg-transparent  divide-y shadow-2xl shadow-stone-800/80 rounded-lg"
            >
              {#each primaryFilterOptions as option }
              <li
                class="text-3xl font-normal text-zinc-800 pb-4 p-2 cursor-pointer text-center bg-white transition-all hover:text-white hover:bg-indigo-500 hover:shadow-lg  last:hover:shadow-[0rem_-.5rem_1rem_rgba(0,0,0,0.1)] shadow-stone-800 hover:rounded-lg selector__option selector__option--primary  "
              >
                {option}
              </li>
              {/each}
            </ul>
          {/if}
    
        </div>
        {#if secondaryFilterOptions.length >1 }
        <div
          class="selector  cursor-pointer rounded-lg bg-white  ml-2 overflow-visible flex justify-center items-center relative shadow-lg selector--secondary dropdown dropdown-start"
        >
        <button class="selector__option selector__option--selected text-3xl py-3 px-4 font-semibold  hover:border-indigo-600 rounded-lg" inert> 
          {secondaryOptionSelected}
        </button>
        <img class="{secondaryFilterToggle ? 'rotate-180' : ''} transition duration-300 block self-center w-8 h-8 mx-2" src="/src/assets/imgs/down-arrow.png" alt="" inert>
        {#if secondaryFilterToggle}
          <ul
            class="selector__list selector__list--secondary absolute top-16 w-max left-0 mt-1 bg-transparent  divide-y shadow-2xl shadow-stone-800/80 rounded-lg max-h-[24rem] overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(98, 37, 253,1)] scrollbar-track-[rgba(95, 3, 255, 0)] {secondaryFilterOptions.length > 6 ? 'overflowing': ''}"
            
          >
            <li class="selector__option selector__option--secondary text-3xl font-normal text-zinc-800 pb-4 p-2 cursor-pointer text-center bg-white transition-all hover:text-white hover:bg-indigo-500 hover:shadow-lg  last:hover:shadow-[0rem_-.5rem_1rem_rgba(0,0,0,0.1)] shadow-stone-800 hover:rounded-lg ">all</li>
            {#each secondaryFilterOptions as option}
              <li
                class="selector__option selector__option--secondary text-3xl font-normal text-zinc-800 pb-4 p-2 cursor-pointer text-center bg-white transition-all hover:text-white hover:bg-indigo-500 hover:shadow-lg  last:hover:shadow-[0rem_-.5rem_1rem_rgba(0,0,0,0.1)] shadow-stone-800 hover:rounded-lg"
              >
                {option}
              </li>
            {/each}
          </ul>
        {/if}

        </div>
        {/if}
      </div>
      {#if !userIsAdmin && !requestsView}
        <button
          type="button"
          class="btn text-3xl text-white btn-xl btn-accent btn--stats ml-2 shadow-lg hadow-stone-800/80  "
        >
          stats
        </button>
      {/if}
    </section>
    <section class="dashboard__list scrollbar-gutter bg-white rounded-3xl shadow-xl
    overflow-y-scroll  scrollbar-thin  md:pt-4 pt-8 p-2 h-full relative scrollbar-thumb-[rgba(0,0,0,0)] scrollbar-track-[rgba(0,0,0,0)]  ">
      {#if !itemsArray.length}
        <div class="flex flex-col justify-center align-center h-full  ">
          {#if !userIsAdding}
            <h2 class="text-6xl leading-normal vertical-center m-auto">
            {requestsView || userIsAdmin ? "No requests here!"
                  : "No goals here!" }
            </h2>
          {/if}
        </div>
        {:else if itemsArray}
          <ul class="relative z-0 gap-4 overflow-visible grid md:grid-cols-2 lg:grid-cols-3 
          xl:grid-cols-4 duration-700 {statsToggled && !requestsView ? 'brightness-50 blur-3':'brightness-100'} " >
            {#each itemsArray as item,idx}
              <li  class="overflow-visible">
                <Item
                  item="{item}"
                  isAdmin={userIsAdmin}
                  isRequest="{requestsView || userIsAdmin}"
                  userIsEditing="{userIsEditing}"
                  timeInc="{itemTimeInc}"
                  on:sendMarkedItem="{(e) => handleMarkedItems(e.detail)}"
                  on:sendReply="{(e) => {
                    userIsEditing = e.detail.isReply;
                    handleMarkedItems(e.detail.request);
                  }}"
                >
                <div slot="selector" >
                    {#if userIsEditing && userIsDeleting}
                    <input
                      class="absolute bottom-0 right-0 w-full h-full z-200 rounded-xl brightness-90 
                      appearance-none cursor-pointer duration-200
                      bg-slate-600/30
                      checked:bg-checkbox-checked
                      checked:brightness-150
                      "
                     
                      type="checkbox"
                      name="{item.id}"
                      checked={itemsBoolArr[idx]}
                      on:click={()=>handleSelected({ userId: item.userId,
                        id: item.databaseId})}
                    />
                    {/if}
                  </div>
                </Item>
              </li>
            {/each}
          </ul>
      {/if}
    </section>
    <section
    class="flex flex-col items-center justify-center absolute z-100 right-2 md:right-4 top-1/2 -translate-y-[50.5%] bg-white rounded-2xl transition-all duration-700 transform-origin-right {statsToggled && !requestsView ? 'w-[98%]':'w-0'} h-[87%] md:h-[83%] shadow-xl shadow-[0rem_0rem_3rem_rgba(0,0,0,0.5)] "
  >
    <h2 class="text-left w-full ml-16 mt-8 text-7xl text-teal-900 leading-normal">My progress</h2>
    <div class=" content-center items-center justify-center max-w-[90%] w-full grid grid-cols-1 md:grid-cols-2 md:grid-rows-[repeat(2, minmax(0, max-content))]  gap-4 align-center overflow-visible flex-1 h-[60%] px-6">

      <div class="stat border m-auto  h-full w-full max-w-lg bg-indigo-400 shadow-xl text-white rounded-lg">
        <div class="stat-title leading-normal text-5xl text-inherit font-semibold ">All time goals</div>
        <div class="stat-value">{itemsArray.length}</div>
        <div class="stat-desc text-3xl text-inherit font-semibold">21% more than last month</div>
      </div>
      <div class="stat m-auto h-full w-full max-w-lg bg-fuchsia-300 shadow-xl rounded-lg ">
        <div class="stat-title leading-normal text-5xl font-semibold">Ongoing goals</div>
        <div class="stat-value text-purple-900">{userStats.stringRate}</div>
        <progress class="progress progress-primary w-56" value="{userStats.ongoingRate.slice(0,-1)}" max="100"></progress>
        <div class="stat-desc text-2xl font-semibold text-purple-900">15% more than last month</div>
      </div>
      <div class="stat m-auto h-full w-full max-w-lg shadow-xl bg-emerald-300 text-teal-800  rounded-lg ">
        <div class="stat-title leading-normal text-5xl text-inherit font-semibold">Completed goals</div>
        <div class="stat-value">{userStats.successRate}</div>
        <progress class="progress progress-primary w-56" value="{userStats.successRate.slice(0,-1)}" max="100"></progress>
        <div class="stat-desc text-2xl font-semibold">15% more than last month</div>
      </div>
      <div class="stat m-auto  h-full w-full max-w-lg bg-rose-400 shadow-xl rounded-lg">
        <div class="stat-title leading-normal text-5xl font-semibold">Failed goals</div>
        <div class="stat-value text-rose-900">{userStats.failRate}</div>
        <progress class="progress progress-primary w-56" value="{userStats.failRate.slice(0,-1)}" max="100"></progress>
        <div class="stat-desc text-2xl text-rose-900 font-semibold">15% more than last month</div>
      </div>
    </div>
    </section>
  
    <section class="flex relative justify-end w-full p-4 overflow-visible" role="" aria-label="list controls" on:click={handleListEdit} on:keydown={handleListEdit} >
      {#if userIsEditing && userIsAdmin && !userIsDeleting}
         <button
          type="button"
          data-button-id="save-change"
          class="btn btn-xl mr-1 text-4xl h-20 rounded-xl shadow-md"
        >
          save
        </button>
      {/if}
      {#if userIsEditing  && userIsDeleting && selectedItems}
        <button
          type="button"
          data-button-id="confirm"
          class="btn btn-xl text-4xl h-20 shadow-md mr-1 rounded-xl"
        >
          confirm
        </button>
      {/if}
      {#if userIsEditing && userIsDeleting && itemsArray}
        <button
          type="button"
          data-button-id="select-all"
          class="btn bt--action-select-all btn-xl text-4xl h-20 shadow-md mr-1 rounded-xl"
        >
          select all
        </button>
      {/if}
      {#if userIsEditing && userIsAdmin}
        <button
          type="button"
          data-button-id="remove"
          class="btn btn--action-remove shadow-md btn-xl text-4xl h-20 rounded-xl mr-1 "
        >
          delete
        </button>
      {/if}
      {#if !userIsAdding && itemsArray.length}
        <button
          type="button"
          data-button-id="edit"
          class="btn btn-xl text-white text-4xl h-20 bg-indigo-600 btn--action-edit rounded-xl shadow-md {userIsEditing ? ' btn--action-edit-active' : ''}"
        >
          {userIsAdmin ? userIsEditing ? 'close':'edit' : !userIsEditing ? 'delete' : 'close'}
        </button>
      {/if}
    </section>
    
  </div>
  <Dialog
    show={userIsConfirming || errorMessage}
    errorMessage=
    {  errorMessage ||
      (selectedItems.length >= 1
        ? `Once they're gone,\nthey're gone`
        : `You need to have at least one selected`)}
    
    submitText={errorMessage ? 'click outside' : `delete`}
    allConfirmed={selectedItems.length}
    action={userIsConfirming ? 'delete' : ''}
    on:confirmAction={deleteItems}
    on:close={() => {errorMessage = '';userIsConfirming = false; }}
  >
  </Dialog>
</section>


<style lang="scss">
  .scrollbar-gutter{
    scrollbar-gutter: stable both-edges;
  }
</style>
  