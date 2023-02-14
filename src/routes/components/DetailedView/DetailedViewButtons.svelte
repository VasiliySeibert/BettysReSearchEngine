<script lang="ts">
  export let showReadme: boolean;
  export let showDetails: boolean;
  export let showPublications: boolean;

  let toggleReadme = () => (showReadme = !showReadme);
  let toggleDetails = () => (showDetails = !showDetails);
  let togglePublications = () => (showPublications = !showPublications);
</script>

<div class="flex justify-center w-full h-full">
  <div class="flex justify-center w-full h-full">
    <button
      class="{showReadme
        ? 'animate-bounce'
        : ''} mt-16 ml-16 mr-16 mb-8 w-40 btn px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700  focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out flex justify-center"
      on:click={toggleReadme}>{showReadme ? "Hide" : "Show"} Readme</button
    >
    <button
      class="{showDetails
        ? 'animate-bounce'
        : ''} mt-16 ml-16 mr-16 mb-8 w-40 btn px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700  focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out flex justify-center"
      on:click={toggleDetails}>{showDetails ? "Hide" : "Show"} Details</button
    >
    <button
      class="{showPublications
        ? 'animate-bounce'
        : ''} mt-16 ml-16 mr-16 mb-8 w-40 btn px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700  focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out flex justify-center"
      on:click={togglePublications}
      >{showPublications ? "Show" : "Hide"} Publications</button
    >
  </div>
</div>
