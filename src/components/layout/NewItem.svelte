<script>
  import Card from '../../components/base/Card.svelte';
  import dateParser from '../../utils/utilities';
  import "cally";
  import arrowUrl from '$lib/assets/play.png';
  export let dashboardView, open, goalSaved = false;
  export let chosenTimeSlot = '';

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const lowestDate = tomorrow.toISOString().slice(0,10);
  let chosenDate='';
  let chosenDateLabel = '';
  
  function handleSelection(e){
    chosenDate = e.target.value;
    chosenDateLabel = new Date(chosenDate).toDateString()
    chosenTimeSlot =  dateParser(chosenDate);
  }

</script>

<div 
class="
flex
flex-col
items-center 
justify-center 
w-full
p-6
md:flex-row
md:items-center
md:max-w-[90rem]
md:self-center
md:p-6
sm:landscape:flex-row
sm:landscape:items-center
sm:landscape:max-w-[90rem]
sm:landscape:self-center
sm:landscape:p-6
duration-700
origin-bottom
overflow-auto
visible
{!open ? 'h-0 opacity-0 invisible':'grow flex-1 '} "
>
  {#if dashboardView === 'goals'}
    <calendar-date 
    class="
    cally 
    border 
    max-w-[50rem] 
    h-1/2
    bg-white 
    rounded-t-2xl 
    shadow-lg 
    shadow-zinc-500 
    text-7xl 
    sm:text-8xl 
    w-[80%] 
    md:w-1/2 
    pt-6 
    md:rounded-s-2xl 
    md:rounded-e-none 
    md:h-[60%] 
    md:shadow-[-.5rem_0rem_2rem_rgba(0,0,0,0.2)] 
    sm:landscape:w-1/2 pt-6 
    sm:landscape:rounded-s-2xl
    sm:landscape:rounded-e-none
    sm:landscape:h-[90%]
    sm:landscape:shadow-[-.5rem_0rem_1rem_rgba(0,0,0,0.2)]" 
    min={lowestDate} 
    on:change={handleSelection} 
    >
      <div slot="previous" >
        <img src="{arrowUrl}" class="rotate-[180deg] size-full" alt="">
      </div>
      <div slot="next">
        <img src="{arrowUrl}" class=" size-full" alt="">
      </div>
      <calendar-month class="cally-month" ></calendar-month>
    </calendar-date>
  {/if}
  <Card timeSlot={chosenTimeSlot} {chosenDate} displayedDate={chosenDateLabel} isRequest={dashboardView === 'requests'} on:goalSaved={()=> goalSaved = true}/>
</div>

<style lang='scss'>

  calendar-date{

    &::part(header){
      width: 30rem;
      align-self: center;
    }
    
    &::part(button) {
      width:3rem;
      height: 3rem;
      border: 1px solid #adb5bd;
      background-color: #fff;
      border-radius: 3px;
      font-size: 2rem;
    }

    &::part(container){
      display: flex;
      flex-direction: column;
      width: 100%;


      // gap: 10rem;
      gap:1;

      @media screen and (min-width:640px){
        gap: 1rem;
      }

      @media screen and (min-width:730px){
        gap: 10rem;
      }
    }

    calendar-month{
      max-width: 28rem;
      align-self: center;
      font-size: 5rem;

      &::part(heading){
      font-size: 4.5rem;
      margin-bottom: 2.5rem;
      }
      &::part(selected){
      background-color: #7048e8;
      }
      &::part(day){
      font-size: 2rem;

      }
      &::part(head){
        font-size: 2rem;
      }

      &::part(button) {
        border-radius: 3px;
        width: 3rem;
        height: 3rem;
        font-size: 2.2rem;
      }
    }
  }
</style>