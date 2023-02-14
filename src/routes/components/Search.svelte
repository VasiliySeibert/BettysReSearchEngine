<script lang="ts">
    import Manager from "$lib/controller/Manager";
    import { extendedSearch, page_shown, searchTerm } from "../ViewController";
    import { getContext } from "svelte";
    import GithubResults from "./GithubResults.svelte";
    import Info from "./Info.svelte";
    import SetToken from "./SetToken.svelte";
  import type { Modal } from "svelte-simple-modal";


    const { open } = getContext<Modal>("simple-modal");

    function navigateToLanding() {
        page_shown.set("/");
    }

    const showInfo = () => {
        open(Info);
    };

    const showSetToken = () => {
        open(SetToken);
    };

    let showResultsFlag = false;
    const showResults = () => {
        showResultsFlag = true;
    }
    import Select, { Option } from '@smui/select';
    let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];

    let value = 'Orange';
</script>

<div class="hidden sm:flex flex-col sm:flex-row justify-between">
    <div class="w-1/4 p-4 pt-8 xl:w-1/6 xl:ml-16">
        <img class="object-scale-down m-0" src="/images/TUC_Logo.png" alt="TUC Logo">
    </div>
    <div class="w-2/4 p-4 xl:w-2/6">
        <img class="object-scale-down m-0" src="/images/Bettys_Logo_White.png" alt="BETTY Logo">
    </div>
    <div class="w-1/4 p-4 pt-8 xl:w-1/6 xl:mr-16">
        <img class="object-scale-down m-0" src="/images/NFDI4Ing_Logo.png" alt="NFDI Logo">
    </div>
</div>

<div class="flex sm:hidden flex-col sm:flex-row justify between">
    <div class="flex flex-row justify-between">
        <div class="w-1/2 pt-3">
            <img class="object-scale-down m-0" src="/images/TUC_Logo.png" alt="TUC Logo">
        </div>
        <div class="w-1/2">
            <img class="object-scale-down m-0" src="/images/NFDI4Ing_Logo.png" alt="NFDI Logo">
        </div>
    </div>
    <div class="w-full -z-10 -mt-12 ">
        <img class="object-scale-down m-0" src="/images/Bettys_Logo_White.png" alt="BETTY Logo">
    </div>
</div>

<form
    class="flex items-center ml-5 mr-5 md:ml-20 md:mr-20 xl:ml-80 xl:mr-80 mt-4 sm:-mt-10 mb-8"
    on:submit|preventDefault={Manager.search($searchTerm, $extendedSearch)}
    on:submit|preventDefault={showResults}
>
    <label for="voice-search" class="sr-only">Search</label>
    <div class="relative w-full">
        <div
            class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none"
        >
            <svg
                aria-hidden="true"
                class="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                    fill-rule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clip-rule="evenodd"
                /></svg
            >
        </div>
        <input
            type="text"
            id="voice-search"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:white dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search"
            required
            bind:value={$searchTerm}
        />
        <label for="" class="absolute inset-y-0 right-6 items-center pr-3 text-sm hidden sm:flex">Extended Search</label>
        <input
            type="checkbox"
            class="absolute inset-y-0 right-4 items-center pr-3 flex"
            title="Extended search"
            bind:checked={$extendedSearch}
        />
    </div>
    <button
        type="submit"
        class="inline-flex items-center py-2.5 px-3 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
        <svg
        aria-hidden="true"
        class="sm:mr-2 sm:-ml-1 w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        /></svg
        ><span class="hidden sm:inline">Search</span>
    </button>
    <button
        type="button"
        on:click={Manager.setGlobalStop}
        class="flex items-center py-2.5 px-3 ml-2 text-sm font-medium text-white bg-red-600 rounded-lg border border-red-800 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
        >
        <!-- class="flex ml-5 mt-2 px-6 py-2.5 bg-red-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700  focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out items-center" -->
        <svg
        aria-hidden="true"
        class="sm:hidden sm:mr-2 sm:-ml-1 w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        >
            <line stroke-linecap="round" stroke-width="3" x1="3" y1="3" x2="21" y2="21" />
            <line stroke-linecap="round" stroke-width="3" x1="3" y1="21" x2="21" y2="3" />
        </svg>

        <span class="hidden sm:inline whitespace-nowrap">Stop Search</span>
    </button>


</form>

{#if showResultsFlag}
<github-results>
    <GithubResults />
</github-results>
{/if}

<div class="flex flex-col space-y-20 py-8">
    <div class="flex justify-center">
        <div class="md:my-6 md:w-3/4">
            <div class="flex flex-col space-y-4 md:space-y-0 md:flex-row">
                <button class="text-sky-400 flex-1">Link to our Paper</button>
                <button class="text-sky-400 flex-1" on:click={showInfo}>What is this tool about?</button>
                <button class="text-sky-400 flex-1">Meet the Team behind this ...</button>
            </div>
        </div>
    </div>

    <div class="flex justify-center">
        <button on:click={showSetToken}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="40"
                height="40"
                viewBox="0 0 50 50"
            >
                <path
                    d="M 22.205078 2 A 1.0001 1.0001 0 0 0 21.21875 2.8378906 L 20.246094 8.7929688 C 19.076509 9.1331971 17.961243 9.5922728 16.910156 10.164062 L 11.996094 6.6542969 A 1.0001 1.0001 0 0 0 10.708984 6.7597656 L 6.8183594 10.646484 A 1.0001 1.0001 0 0 0 6.7070312 11.927734 L 10.164062 16.873047 C 9.583454 17.930271 9.1142098 19.051824 8.765625 20.232422 L 2.8359375 21.21875 A 1.0001 1.0001 0 0 0 2.0019531 22.205078 L 2.0019531 27.705078 A 1.0001 1.0001 0 0 0 2.8261719 28.691406 L 8.7597656 29.742188 C 9.1064607 30.920739 9.5727226 32.043065 10.154297 33.101562 L 6.6542969 37.998047 A 1.0001 1.0001 0 0 0 6.7597656 39.285156 L 10.648438 43.175781 A 1.0001 1.0001 0 0 0 11.927734 43.289062 L 16.882812 39.820312 C 17.936999 40.39548 19.054994 40.857928 20.228516 41.201172 L 21.21875 47.164062 A 1.0001 1.0001 0 0 0 22.205078 48 L 27.705078 48 A 1.0001 1.0001 0 0 0 28.691406 47.173828 L 29.751953 41.1875 C 30.920633 40.838997 32.033372 40.369697 33.082031 39.791016 L 38.070312 43.291016 A 1.0001 1.0001 0 0 0 39.351562 43.179688 L 43.240234 39.287109 A 1.0001 1.0001 0 0 0 43.34375 37.996094 L 39.787109 33.058594 C 40.355783 32.014958 40.813915 30.908875 41.154297 29.748047 L 47.171875 28.693359 A 1.0001 1.0001 0 0 0 47.998047 27.707031 L 47.998047 22.207031 A 1.0001 1.0001 0 0 0 47.160156 21.220703 L 41.152344 20.238281 C 40.80968 19.078827 40.350281 17.974723 39.78125 16.931641 L 43.289062 11.933594 A 1.0001 1.0001 0 0 0 43.177734 10.652344 L 39.287109 6.7636719 A 1.0001 1.0001 0 0 0 37.996094 6.6601562 L 33.072266 10.201172 C 32.023186 9.6248101 30.909713 9.1579916 29.738281 8.8125 L 28.691406 2.828125 A 1.0001 1.0001 0 0 0 27.705078 2 L 22.205078 2 z M 23.056641 4 L 26.865234 4 L 27.861328 9.6855469 A 1.0001 1.0001 0 0 0 28.603516 10.484375 C 30.066026 10.848832 31.439607 11.426549 32.693359 12.185547 A 1.0001 1.0001 0 0 0 33.794922 12.142578 L 38.474609 8.7792969 L 41.167969 11.472656 L 37.835938 16.220703 A 1.0001 1.0001 0 0 0 37.796875 17.310547 C 38.548366 18.561471 39.118333 19.926379 39.482422 21.380859 A 1.0001 1.0001 0 0 0 40.291016 22.125 L 45.998047 23.058594 L 45.998047 26.867188 L 40.279297 27.871094 A 1.0001 1.0001 0 0 0 39.482422 28.617188 C 39.122545 30.069817 38.552234 31.434687 37.800781 32.685547 A 1.0001 1.0001 0 0 0 37.845703 33.785156 L 41.224609 38.474609 L 38.53125 41.169922 L 33.791016 37.84375 A 1.0001 1.0001 0 0 0 32.697266 37.808594 C 31.44975 38.567585 30.074755 39.148028 28.617188 39.517578 A 1.0001 1.0001 0 0 0 27.876953 40.3125 L 26.867188 46 L 23.052734 46 L 22.111328 40.337891 A 1.0001 1.0001 0 0 0 21.365234 39.53125 C 19.90185 39.170557 18.522094 38.59371 17.259766 37.835938 A 1.0001 1.0001 0 0 0 16.171875 37.875 L 11.46875 41.169922 L 8.7734375 38.470703 L 12.097656 33.824219 A 1.0001 1.0001 0 0 0 12.138672 32.724609 C 11.372652 31.458855 10.793319 30.079213 10.427734 28.609375 A 1.0001 1.0001 0 0 0 9.6328125 27.867188 L 4.0019531 26.867188 L 4.0019531 23.052734 L 9.6289062 22.117188 A 1.0001 1.0001 0 0 0 10.435547 21.373047 C 10.804273 19.898143 11.383325 18.518729 12.146484 17.255859 A 1.0001 1.0001 0 0 0 12.111328 16.164062 L 8.8261719 11.46875 L 11.523438 8.7734375 L 16.185547 12.105469 A 1.0001 1.0001 0 0 0 17.28125 12.148438 C 18.536908 11.394293 19.919867 10.822081 21.384766 10.462891 A 1.0001 1.0001 0 0 0 22.132812 9.6523438 L 23.056641 4 z M 25 17 C 20.593567 17 17 20.593567 17 25 C 17 29.406433 20.593567 33 25 33 C 29.406433 33 33 29.406433 33 25 C 33 20.593567 29.406433 17 25 17 z M 25 19 C 28.325553 19 31 21.674447 31 25 C 31 28.325553 28.325553 31 25 31 C 21.674447 31 19 28.325553 19 25 C 19 21.674447 21.674447 19 25 19 z"
                />
            </svg>
        </button>
    </div>
</div>

