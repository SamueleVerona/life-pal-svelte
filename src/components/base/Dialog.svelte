<script>
  import Portal from 'svelte-portal'
  import { createEventDispatcher } from 'svelte';

  export let errorMessage = '';
  export let submitText = '';
  export let action;
  export let show, userActive = false, allConfirmed;

  const dispatch = createEventDispatcher();
  
  const classArr = [
  'bg-rose-400',
  'bg-slate-100',
  'bg-indigo-500',

  ]
    let actionClass;

  $: {
    if(action === 'delete'){
      actionClass = classArr[0]
    }else if(action === 'confirm'){
      actionClass = classArr[1]
    }
    else{
      actionClass = classArr[2]
    }
  }
  
</script>


<div >
    <Portal target="main">
        {#if show}
        <dialog
          open
          class="max-w-[60rem] max-h-[60%] rounded-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col z-[200] justify-between shadow-lg w-[40rem] {userActive ? 'h-max w-[60%] overflow-y-auto  scrollbar-thin scrollbar-thumb-indigo-800 scrollbar-track-indigo-800' : ''}"
          
        >
        {#if !userActive}
        <button class="btn absolute top-1 right-1 rounded-full text-lg border w-10 h-10 bg-white font-smibold shadow-md hover:bg-slate-200" 
        on:click={()=> dispatch('close')}>
          &#10006;
        </button>
        {/if}
          <section
            class="overflow-y-auto   scrollbar-thin scrollbar-track-transparent scrollbar-thumb-indigo-600  p-4 {actionClass} {userActive ? 'max-h-[80vh] ': ''}"
          >
            <slot name="content" >
              <p class="dialog__message   text-white text-4xl p-8 text-center">{errorMessage}</p>
            </slot>
          </section>
          <button
            on:click={() => dispatch('confirmAction')}
            disabled="{!allConfirmed}"
            class="btn border-none bg-white btn-xl text-3xl hover:bg-[var(--theme-primary-dark)] hover:text-white disabled:cursor-none  " 
          >
            { submitText || "confirm" }
          </button>
        </dialog>
        {/if}
        {#if show}
        <div class="dialog__underlay flex justify-center items-center fixed top-0 left-0 w-full h-full z-[100] bg-[rgb(200, 200, 200)] backdrop-blur-sm " >       
        </div>
      {/if}
    </Portal>
</div>

<style lang="scss" >
</style>
