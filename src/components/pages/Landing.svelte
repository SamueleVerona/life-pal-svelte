<script>
  import { onMount } from 'svelte';
  import {push}  from 'svelte-spa-router';
  import { auth } from "../../stores/authModule.js";
  import svelteUrl from '$lib/assets/svelte.svg';
  import tailUrl from '$lib/assets/tailwind.svg';

  $: isAuth = $auth.isAuth;

  onMount(() => {
    auth.autoLogin();

    if (!isAuth) {
      push('/'); 
    }else{
        push('/home')
    }
  });
</script>

<section class="section relative size-full bg-theme-bg">
  <section class="section-hero flex flex-col items-center justify-center size-full relative "
  >
    <div class="ml-4 absolute top-4 left-1">
      <svg class=" opacity-50 p-6 w-[10rem] h-[10rem] rounded-full border-2 border-orange-500">
        <image class="size-full"  href="{svelteUrl}" />
      </svg>
      <svg class=" p-6 w-[10rem] h-[10rem] -translate-y-10 rounded-full border-2 border-cyan-500 opacity-50">
        <image class="size-full"  href="{tailUrl}" />
      </svg>
    </div>
    <h2 class="text-transparent bg-logo-bg animate-slide-in-top relative mb-4 leading-none text-[20rem] text-center opacity-100 bg-clip-text 
    drop-shadow-[0_-0.3rem_0.3rem_rgb(162,162,162)] tracking-tight">
      Life<br />Pal
    </h2>
    <h4 class="text-6xl text- leading-normal text-indigo-800/50 font-semibold">
      Project migration from 
      <a href="https://lifepal.netlify.app/landing" class="text-shadow-lg text-shadow-zinc-500 text-emerald-400/80 hover:text-emerald-600 duration-300">
        Vue.js
      </a>
    </h4>
    <a class="leading-normal absolute bottom-[10%] cursor-pointer text-9xl animate-slide-in-bottom text-white duration-100 drop-shadow-[0_-0.2rem_0.3rem_rgb(162,162,162)]
    hover:drop-shadow-[0_-0.1rem_0.2rem_rgb(162,162,162)]
    " 
    role="link"
    on:click|preventDefault={()=> push('/sign')} on:keyup|preventDefault={()=> push('/sign') }
    >
      Sign In
    </a>
  </section>
</section>

<style lang="scss"></style>
