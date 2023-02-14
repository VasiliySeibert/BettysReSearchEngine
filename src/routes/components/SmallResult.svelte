<script lang="ts">
    import type { Repository } from "$lib/types/githubResults.type";
    import { getContext } from "svelte";
    import DetailedView from "./DetailedView/DetailedView.svelte";

    const { open } = getContext("simple-modal");

    export let result: Repository;

    let repoDetailUrl = "#";

    const showDetailedView = () => {
        open(DetailedView, { currentResult: result });
    };

    //$: console.log(result) // for debugging purposes only

    // Show 0 if amount citations is undefined
    $: amountZenodoCitations = result.amountPublications.get("zenodo")
        ? result.amountPublications.get("zenodo")
        : 0;
    // Show 0 if amount citations is undefined
    $: amountOpenAlexCitations = result.amountPublications.get("openAlex")
        ? result.amountPublications.get("openAlex")
        : 0;
    // Show 0 if amount citations is undefined
    $: amountOpenCitationsCitations = result.amountPublications.get(
        "openCitations"
    )
        ? result.amountPublications.get("openCitations")
        : 0;

    // Show 0 if amount citations is undefined
    $: amountDataCiteCitations = result.amountPublications.get("DataCite")
        ? result.amountPublications.get("DataCite")
        : 0;
    // Show 0 if amount citations is undefined
    $: amountSemanticScholarCitations = result.amountPublications.get(
        "semanticScholar"
    )
        ? result.amountPublications.get("semanticScholar")
        : 0;
    $: amountCitationCff = result.amountPublications.get("citationCff")
        ? result.amountPublications.get("citationCff")
        : 0;
</script>

<div class="bg-gray-100 p-4 rounded-lg shadow space-y-4">
    <div class="flex items-center flex-col space-x-2">
        <div on:click={showDetailedView} on:keypress class="font-bold text-blue-500 hover:text-blue-700 underline hover:cursor-pointer">{result.name}</div>
        <div class="pl-">Language: {result.language}</div>
    </div>
    <div>
        <div>Zenodo Citations: {amountZenodoCitations}</div>
        <div>OpenAlex Citations: {amountOpenAlexCitations}</div>
        <div>OpenCitations Citations: {amountOpenCitationsCitations}</div>
        <div>DataCite Citations: {amountDataCiteCitations}</div>
        <div>S. Scholar Citations: {amountSemanticScholarCitations}</div>
        <div>CitationCff Citations: {amountCitationCff}</div>
    </div>
</div>
