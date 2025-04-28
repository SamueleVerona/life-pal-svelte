<script>
  import { createEventDispatcher } from 'svelte';
  export let item = {};
  export let hasExpired = false, isRequest, userIsEditing, timeInc, isAdmin;
    
  const dispatch = createEventDispatcher();

  $: isProgressVisible = !hasExpired && !item.isCompleted && !item.isFailed;
  $: requestReply = item.reply;

  function compRate(start, comp) {
    const totalTime = new Date(comp).getTime() - new Date(start).getTime();
    const elapsedTime = Date.now() - new Date(start).getTime();
    const rate = (elapsedTime / totalTime) * 100;
    if (new Date(comp).getTime() <= Date.now()) return "100%";
    else {
      return Math.min(rate, 100).toFixed(0) + "%";
    }
  }
  
  const goalStartMs = new Date(item.started).getTime();
  const goalCompMs = new Date(item.compDate).getTime();
  const totalTime = goalCompMs - goalStartMs;
  const elapsedTime = Date.now() - goalStartMs;

  let timeLeft = '';

  $:{
    const timeLeftS = (totalTime - elapsedTime + timeInc) / 1000;
    const seconds = Math.floor(timeLeftS % 60);
    const mins = Math.floor((timeLeftS / 60) % 60);
    const hours = Math.floor(timeLeftS / 3600);
  
    if (timeLeftS <= 0) {
      timeLeft = "expired";
    }
    timeLeft =  `left: ${hours}H ${mins}M ${seconds}S `;
  }


  let goalStatus = false;
  let markFlag = false;
  let reqStatus = item.itemLabel;
  let adminIsReplying = false;
  
  function markAs(e) {

    const isButtonComp = e.target.dataset.buttonId ==='completed';
    const isButtonFail = e.target.dataset.buttonId ==='failed';
    const itemId = item.databaseId;
    const userId = item.userId;
  
    if (isButtonComp) {
      markFlag = true;
      goalStatus = true;
      reqStatus = "accepted";
    }
    if (isButtonFail) {
      markFlag = true;
      goalStatus = false;
      reqStatus = "rejected";
    }
  
    const markedGoal = {
      itemId,
      isCompleted: goalStatus,
      isFailed: !goalStatus,
    };
    const markedRequest = {
      userId,
      itemId,
      itemLabel: reqStatus,
      reply: requestReply,
    };

    if (reqStatus !== item.itemLabel)
      dispatch('sendMarkedItem', (isAdmin ? markedRequest : markedGoal))
  };

  $: {if(requestReply) sendReply()} ;

  function sendReply() {
    if (requestReply && requestReply.length > 5) 

    dispatch('sendReply', {
      isReply: true,
      request: {
        itemId: item.databaseId,
        userId: item.userId,
        itemLabel: reqStatus,
        reply: requestReply,
      }
    })
  }

  const bgColor = `bg-theme-${item.type}`
  console.log(bgColor)

</script>

<div class=" flex flex-col relative w-full max-h-max my-2  p-2 rounded-3xl shadow-md shadow-zinc-400/80 bg-[var(--theme-primary-light)] card {bgColor}" >
    <section class="card-title">
      <h2 class=" px-6 pb-2 my-2 text-white text-5xl leading-tight " >
        {
          item.title[0].toUpperCase() +
          item.title.slice(1).toLowerCase()
        }
      </h2>
      {#if item.type}
      <div class="badge badge-primary self-center absolute right-2 top-2 text-xl p-4 tracking-wide rounded-2xl">{item.type}</div>
      {/if}
    </section>
    <section class="flex flex-col text-5xl text-clip">
      {#if item.desc}
      <p class="text-4xl font-semibold border-b border-b-slate-100 self-center w-[90%] py-2 pt-4 pb-4 text-gray-200" >
        {
          item.desc[0].toUpperCase() +
          item.desc.slice(1).toLowerCase()
        }
      </p>
      {/if}
      <div class=" flex self-center relative w-max my-2 pt-2 text-center bg-transparent">
        <h3 class="text-3xl font-bold leading-normal">
          <span class=" text-white">{
            isRequest ? "Status: " : ""
          }</span>
          <span class=" text-violet-600 badge text-2xl h-8">
            {item.itemLabel }
          </span>
        </h3>
      </div>
      {#if isRequest}
      <div class="self-center w-max overflow-visible border-t-2 border-t-white mb-4 text-center relative text-3xl " >
        <span class=" text-blue-600 text-3xl font-semibold block mt-4 relative">Admin says:</span>
        {#if isAdmin && userIsEditing }
          <button
            type="button"
            class="absolute bottom-8 translate-x-full right-[-1] w-max font-bold leading-normal text-2xl  underline  decoration-white duration-200 hover:text-white  text-fuchsia-600 bg-transparent"
            on:mousedown="{() => (adminIsReplying = !adminIsReplying)}"
          >
            {item.reply ? "change reply" : "add reply" }
          </button>
        {/if}
        <p class=" text-3xl font-semibold text-white">{ item.reply || "no reply yet" }</p>
      </div>
      {/if}

      {#if isAdmin && userIsEditing && adminIsReplying}
        <textarea
          name="amdin-reply"
          class="text-center w-full mb-2 text-3xl font-semibold bg-transparent text-white rounded-xl border-2 border-white focus:border-fuchsia-600 focus:outline-none
          resize-none"
          rows="3"
          cols="60"
          bind:value={requestReply}
        ></textarea>
      {/if}
      {#if isProgressVisible && !isRequest }
      <progress class="progress text-white self-center  w-56 " value="{+compRate(item.started, item.compDate).slice(0,-1)}" max="100"> 
      </progress>
      <span class="text-white self-center mt-2 text-3xl font-semibold ">
        { timeLeft }
      </span>
      {/if}
    </section>
    {#if hasExpired  || (isAdmin && userIsEditing) }
    <section
      class="items-center"
    >
      <div
        class="group flex items-center justify-evenly self-center text-center text-2xl text-white font-bold"
      >
        <div class="space-x-2 flex justify-evenly">
          <button
            type="button"
            data-button-id="completed"
            class=" flex-auto w-max  border-2 rounded-lg px-4 p-1 shadow-lg duration-200 hover:bg-emerald-600 hover:border-emerald-600 {goalStatus && markFlag ? 'bg-emerald-400 border-emerald-400' : ''} "
            on:click="{markAs}"
          >
          {isAdmin ? "accepted" : "completed"}

        </button>
          <button
            type="button"
            data-button-id="failed"
            class="flex-auto w-max border-2 rounded-lg px-4 p-1 duration-200 hover:bg-rose-700 hover:border-rose-700 {!goalStatus && markFlag ? 'bg-rose-600 border-rose-600' : ''}"
            on:click="{markAs}"
          >
          {isAdmin ? "rejected" : "failed"}
        </button>
        </div>
      </div>
    </section>
    {/if}
    <div>
      <slot name="selector"></slot>
    </div>
</div>

<style lang="scss" >
</style>
