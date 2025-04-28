<script>
  import  Router from 'svelte-spa-router';
  import routes from './router.js';
</script>

<main>
  <Router {routes}/>
</main>

<style lang="scss">
  main{
    display: flex;
    height: 100dvh;
    width: 100vw;
    background: whitesmoke;
  }
</style>


