<script lang="ts">
  import type { Repository } from "$lib/types/githubResults.type";

  export let repository: Repository;
</script>

<div
  class="visible break-all bg-gray-100 overflow-hidden object-contain rounded-lg border-solid border-4 w-full h-full"
>
  <div class="base text-gray-900 font-serif m-8 ">
    <h1>Repository Details:</h1>
    <p>NAME : {repository.name}</p>
    <p>URL : <a href="{repository.url}" target="_blank" rel="noreferrer">{repository.url}</a></p>
    <p>STARS : {repository.stars}</p>
    <p>FORKS : {repository.forks}</p>
    <p>CREATED AT : {repository.createdAt}</p>
    <p>UPDATED AT : {repository.updatedAt}</p>
    <p>LANGUAGE : {repository.language}</p>
    <p>HOMEPAGE : {repository.homepage}</p>
    <p>
      AMOUNT PUBLICATIONS ON ZENODO : {repository.amountPublications.get(
        "zenodo"
      )}
    </p>
    <p>
      AMOUNT PUBLICATIONS ON SEMANTIC SCHOLAR : {repository.amountPublications.get(
        "semanticScholar"
      )}
    </p>
    <p>PAPER ID ON SEMANTIC : {repository.semanticPaperId}</p>
    <p>DOI : {repository.mainPaper?.doi}</p>
    <p>TITLE : {repository.mainPaper?.title}</p>
    <p>JOURNAL : {repository.mainPaper?.journal}</p>
    <p>DATE RELEASED : {repository.mainPaper?.dateReleased}</p>
    <p>ABSTRACT : {@html repository.mainPaper?.abstract}</p>
  </div>
</div>
