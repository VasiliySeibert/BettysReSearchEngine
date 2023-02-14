<script lang="ts">
  import type { Publication, Repository } from "$lib/types/githubResults.type";
  import Spinner from "../Spinner.svelte";

  export let repository: Repository;
  export let publications: Publication[];
  export let stillLoading: boolean;
</script>

<div
  class="visible break-all bg-gray-100 overflow-hidden object-contain rounded-lg border-solid border-4 w-full h-full"
>
  <div class="base text-gray-900 font-serif m-8 ">
    {#if repository.publications[0] === undefined}
      <p>NAME DER PUBLIKATION : {repository.publications[0]}</p>
    {/if}
    {#if repository.publications[0] !== undefined}
      <!-- Hier muss eine Funktion kommen welche die Publications nochmal sortiert -->
      <ul class="m-8">
        {#each publications as { name, doi, source, authorNames, externalIds, abstract, venue, year, referenceCount, citationCount, fieldsOfStudy, publicationTypes, publicationDate, journal, url }, i}
          <li>
            <p class="text-justify break-normal">
              [{i + 1}]: {authorNames} , "{@html name}" , {journal}, {year}, Available
              : <a href={doi} target="_blank" rel="noreferrer">{doi}</a>
            </p>
          </li>
          <br />
        {/each}
        {#if stillLoading}
          <li>
            <div class="flex justify-center">
              <Spinner />
            </div>
          </li>
        {/if}
      </ul>
    {/if}
  </div>
</div>
