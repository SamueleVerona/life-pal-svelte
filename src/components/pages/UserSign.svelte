<script>
  import {auth} from '../../stores/authModule';
  import { push } from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import Dialog from '../base/Dialog.svelte';
  import svelteUrl from '$lib/assets/svelte.svg';
  import tailUrl from '$lib/assets/tailwind.svg';

  $:isAuth = $auth.isAuth;

  function authModeSwitch(){
        switchMode === 'login' ? switchMode = 'signup' : switchMode = 'login';
    }

  let switchMode = 'login';
  let userEmail = '' ;
  let userPwd = '';

  async function signAction(){
      try {
        await auth.auth(userEmail, userPwd, switchMode)
        
      } catch (err) {
        errorMessage = err
      }
  }

  let errorMessage = null;
  let passwordVisible = false;




  function loadCredentials(e){
    if(!e.target.dataset.type) return;
    const target= e.target

    if(target.dataset.type === 'email') userEmail = target.textContent.slice(7);
    if(target.dataset.type === 'password') userPwd = target.textContent.slice(10);
  }

  onMount(()=>{
    if(isAuth) push('/home')
  })

</script>

<section class="section-sign flex flex-col flex-1 items-center justify-center relative overflow-hidden bg-theme-bg" >
  <h2 class="
  logo
  text-transparent
  top-8
  left-8
  tracking-tight
  absolute
  text-[8rem]
  sm:text-[12rem]
  text-center
  leading-none
  bg-logo-bg
  bg-clip-text
  ">
  Life<br />Pal
  </h2>
  <div class="ml-8 mb-8 absolute top-8 right-10 ">
    <svg class="translate-y-[2rem] opacity-50 p-6 w-[8rem] h-[8rem] sm:w-[10rem] sm:h-[10rem]  rounded-full border-2 border-orange-500">
      <image class="w-full h-full"  href="{svelteUrl}" />
    </svg>
    <svg class=" p-6 6 w-[8rem] h-[8rem] sm:w-[10rem] sm:h-[10rem] rounded-full border-2 border-cyan-500  opacity-50">
      <image class="w-full h-full"  href="{tailUrl}" />
    </svg>
  </div>
  <section
    class=" section__form-container relative overflow-visible duration-500 z-6 rounded-2xl bg-transparent 
    {switchMode === 'signup' ? 'shadow-[0rem_.6rem_0rem_rgba(0,0,0,0.16)]' : 'shadow-[0rem_8rem_0rem_var(--theme-primary-light)]'}
   "
  >
  <fieldset class="fieldset rounded-2xl w-xs flex flex-col p-4 w-[80vw] max-w-3xl border-2 transition duration-300 ease form__card  
  {switchMode === 'signup' ? 'border-[var(--theme-secondary-mid)]' : 'border-[var(--theme-primary-mid)]'}
  
  ">
    <legend class="fieldset-legend w-max text-8xl pb-4 
     {switchMode === 'signup' ? 'text-[var(--theme-secondary-mid)]' : 'text-[var(--theme-primary-mid)]'}
    
    ">
    {switchMode[0].toUpperCase() + switchMode .slice(1)}
    </legend>
    <label class="label text-4xl text-gray-500" for="email">Email</label>
    <input type="email" name="email" 
    class="form__input 
    input block
    text-4xl
    text-black 
    w-full 
    h-20
    rounded-xl 
    border-2
    focus:outline-none  
    focus:invalid:border-red-400  
    focus:valid:border-sky-500
    valid:border-sky-500  
    focus:border-gray-400
    valid:shadow-md valid:shadow-sky-300/50   
   " required placeholder="user@email.com"  minlength="11"   bind:value={userEmail}/>
    <label class="label text-4xl text-gray-500" for="password">Password</label>
    <input type="{passwordVisible ? 'text' : 'password'}" name="password" class="text-security-none form__input input block text-4xl rounded-xl border-2  text-black w-full h-20 focus:outline-none
    border-2
    focus:outline-none  
    focus:invalid:border-red-400  
    focus:valid:border-sky-500
    valid:border-sky-500  
    focus:border-gray-400
    valid:shadow-md valid:shadow-sky-300/50   " required placeholder="Password"  minlength="6"
    bind:value={userPwd} />
    <label for="pwdtoggle" class=" align middle mt-2 self-center overflow-visible min-w-max">
      <span class="text-3xl text-zinc-500 font-semibold align-middle mr-2 " inert>Show/Hide</span>
      <input
      type="checkbox"
      name="pwdtoggle"
      on:click={()=> passwordVisible = !passwordVisible}
      class=" toggle w-20 h-12 bg-white text-transparent border-gray-300 rounded-full border-2 before:bg-zinc-400 before:rounded-full checked:before:bg-zinc-600 "
      />
    </label>
    <button class="
    btn
    btn--action-submit
    border-none
    text-5xl
    shadow-md 
    mt-4 
    h-20
    py-4 
    bg-white hover:text-white 
    rounded-xl
    {switchMode === 'login' ? 'text-[var(--theme-primary-dark)] shadow-indigo-600/50 hover:shadow-indigo-600/40 hover:bg-[var(--theme-primary-dark)] ': ' text-[var(--theme-secondary-dark)] shadow-green-600/50 hover:shadow-green-600/40 hover:bg-[var(--theme-secondary-dark)] '}"
    data-button-id="sign-submit"  on:mousedown={signAction}
    >
    {switchMode[0].toUpperCase() + switchMode .slice(1)}
    </button>
    <div class="toggle-container mt-8 h-16 w-24  sm:w-20 sm:h-12 self-center " >
      <input type="checkbox" checked 
      class="
      bg-white
      border-1
      border-gray-300
      rounded-full
      p-0
      w-full 
      h-full 
      toggle 
      before:rounded-full 
      before:bg-emerald-300 
      checked:before:bg-[var(--theme-primary-dark)]" 
      on:click={()=> authModeSwitch()} />
    </div>
  </fieldset>
    <section
      class="
      pt-2
      flex
      flex-col
      z-7 
      justify-start
      leading-normal
      items-center
      self-center
      absolute
      w-full
      max-w-[50rem]
      aspect-square
      text-2xl
      opacity-1
      bg-transparent
      transition-all
      duration-[300ms]
      {switchMode === 'signup' ? '-translate-y-3 opacity-0' : ''}"
      on:click={loadCredentials}
      on:keydown={loadCredentials}
    >
      <div class="px-4 mb-2 overflow-visible" >
        <span data-type="email" class="badge rounded-2xl text-2xl h-10 w-block tracking-wide font-semibold cursor-pointer select-none shadow-sm shadow-slate-200 hover:shadow-slate-300 hover:text-sky-500 font-normal hover:font-bold " >Email: john.smith@email.com
        </span>
        <span data-type="password" class=" badge rounded-2xl text-2xl h-10 w-block font-semibold tracking-wide cursor-pointer select-none shadow-sm shadow-slate-200 hover:shadow-slate-300 hover:text-sky-500 font-normal hover:font-bold">Password: password</span>
      </div>
      <div class="px-4 overflow-visible">
        <span data-type="email" class=" badge rounded-2xl text-2xl h-10 w-block  font-semibold tracking-wide cursor-pointer select-none shadow-sm shadow-slate-200 hover:shadow-slate-300 hover:text-sky-500 font-normal hover:font-bold">Email: jane.doe@email.com</span>
        <span data-type="password" class="  badge rounded-2xl text-2xl h-10 w-block  font-semibold tracking-wide cursor-pointer select-none shadow-sm shadow-slate-200 hover:shadow-slate-300 hover:text-sky-500 font-normal hover:font-bold">Password: passphrase</span>
      </div>
    </section>
  </section>
</section>
<Dialog 
errorMessage="{errorMessage}"
show="{!!errorMessage}"
on:close="{()=> errorMessage = null}"
action={errorMessage ? 'sign' :''}
/>

<style lang="scss">
  * {
    font-family: var(--font-stack);
  }
</style>
  
    