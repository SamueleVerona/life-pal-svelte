<script >
  import Dialog from './Dialog.svelte';
  import {userData} from '../../stores/dataModule.js'
  import { createEventDispatcher } from 'svelte';
  export let chosenDate, displayedDate, timeSlot, isRequest;

  const dispatch = createEventDispatcher();
  $:inputDesc = "";
  $:inputTitle = ''
  $: completionDate = chosenDate;
  let errorMessage = '';

  function handleActions() {
      if (!inputTitle) {
          return errorMessage = "You need a title first";
      }
      if (isRequest){ 
          addRequest();
      }else {
          completionDate
          ? addGoal()
          : (errorMessage = "You also need a time slot");
      }
  }

  function closeDialog() {
  errorMessage = "";
  }

  const id =  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

  async function addRequest() {
      try {
          await userData.sendData({
          type: "request",
          data: {
              id: id,
              title: inputTitle.toUpperCase(),
              desc: inputDesc ? inputDesc : "",
              itemLabel: "pending",
          },
          })
          inputTitle = '';
          inputDesc = '';

          dispatch("goalSaved", true);
      } catch (err) {
          console.log(err);
      }
  }

  async function addGoal() {
      try {
          await userData.sendData({
              type: "goal",
              data: {
                  id: id,
                  title: inputTitle.toUpperCase(),
                  desc: inputDesc ? inputDesc : "",
                  type: timeSlot,
                  isCompleted: false,
                  isFailed: false,
                  started: Date.now(),
                  compDate: completionDate,
                  itemLabel: displayedDate,
              },
          })

          inputTitle = '';
          inputDesc = '';

          dispatch("goalSaved", true);
      } catch (err) {
          console.warn(err);
      }
  }

  $:bgColor = timeSlot ? `bg-theme-${timeSlot}`: 'bg-violet-400'

</script>

<section 
class="
component-box 
relative h-1/2
max-w-[50rem]
md:w-1/2
sm:landscape:w-1/2
sm:landscape:h-[90%]
md:h-[60%]
flex
flex-col
justify-between
overflow-visible 
{isRequest ? 'h-[70%] w-[70%] max-w-[35rem]':'w-[80%]'}
">
    <div 
    class="
    flex
    flex-col
    h-full
    {isRequest ? 'bg-violet-400 rounded-2xl mb-2 md:rounded-2xl mb-2    sm:landscape:rounded-2xl rounded-br-2xl mb-2 shadow-[.5rem_0rem_2rem_rgba(0,0,0,0.25)]': `${bgColor} shadow-lg shadow-zinc-500 rounded-b-2xl    md:rounded-s-none  rounded-s-none mb-0 sm:landscape:rounded-tr-2xl rounded-s-none rounded-br-none mb-0`
    }
    " on:submit|preventDefault>
        <input
        name="title"
        class="
        block 
        h-28 
        text-center 
        text-white 
        text-5xl 
        font-semibold
        bg-slate-100/30
        rounded-none 
        placeholder:text-gray-200 
        focus:bg-slate-100/10 
        focus:border-violet-600 
        outline-none 
        shadow-md 
        shadow-white/50"
        type="text"
        placeholder="{ isRequest ? "My request Title" : "My Goal Title" }"
        bind:value={inputTitle}
        maxlength="25"
        required
        />
        <textarea
        name="description"
        class="
        h-min 
        pt-8 
        text-center 
        text-5xl 
        text-white 
        font-semibold
        bg-slate-100/30
        rounded-none 
        focus:bg-slate-100/10 outline-none
        placeholder:text-gray-200  
        "
        placeholder=
            {isRequest ? 'Request description...' : 'Goal description...'}
        rows="3"
        cols="1"
        bind:value={inputDesc}
        required
        ></textarea>
        {#if !isRequest}
        <section class="flex flex-col w-full min-h-max grow items-center align-center justify-center pt-4 self-end">
            <span class="leading-normal min-h-max text-4xl text-white mb-6 w-max self-center font-semibold  ">Set a completion for:</span>
            <span class="min-h-max mb-8 font-semibold rounded-3xl text-4xl border-2 border-white text-white px-5 py-2">
                {displayedDate}
            </span>
            <progress class="progress text-white mb-4 min-h-4 w-56" value="2" max="100"></progress>
            <span class="badge border-2 border-white text-blue-500 font-semibold min-h-max h-12 rounded-2xl text-3xl mb-6  px-8 ">{ timeSlot }</span>
        </section>
        {/if}
    </div>
    <button
    type="button"
    class="btn w-full 
    border-none
    bg-white  
    shadow-md
    shadow-zinc-400
    hover:shadow-md
    text-4xl
    h-20
    pr-2
    pl-2
    self-center
    hover:text-white
    hover:bg-indigo-500
    {!isRequest ? ' rounded-b-2xl md:w-[200%] sm:landscape:w-[200%]  md:-translate-x-[25%] sm:landscape:-translate-x-[25%]' : 'rounded-2xl  md:rounded-2xl    md:shadow-[0rem_.8rem_2rem_rgba(0,0,0,0.25)]    md:hover:shadow-[0rem_.5rem_1.5rem_rgba(0,0,0,0.25)] md:ml-0.5 sm:landscape:ml-0.5  sm:landscape:rounded-none   sm:landscape:rounded-2xl sm:landscape:shadow-[0rem_.8rem_2rem_rgba(0,0,0,0.25)] sm:landscape:hover:shadow-[0rem_.5rem_1.5rem_rgba(0,0,0,0.25)]'}"
    on:mousedown="{handleActions}"
    >
    { isRequest ? "send" : "save" }
    </button>
</section>
<Dialog
show="{errorMessage}"
errorMessage="{errorMessage}"
on:close="{closeDialog}"
action={errorMessage ? 'add':''}
>
</Dialog>
  
<style lang="scss" >
</style>
  