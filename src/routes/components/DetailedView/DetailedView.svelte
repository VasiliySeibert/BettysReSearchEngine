<script lang="ts">
    import type { Repository } from "$lib/types/githubResults.type";
    import { onMount } from "svelte";
    import Manager from "$lib/controller/Manager";
    import DetailedViewHeader from "./DetailedViewHeader.svelte";
    import GitLink from "./GitLink.svelte";
    import GitReadme from "./GitReadme.svelte";
    import GitDetails from "./GitDetails.svelte";
    import Publications from "./Publications.svelte";
    import DetailedViewButtons from "./DetailedViewButtons.svelte";

    export let currentResult: Repository;

    let showReadme = false;
    let showDetails = false;
    let showPublications = false;

    $: publications = currentResult.publications;
    // Variable to show spinner if not all publications have been loaded
    let stillLoading = true;

    /**
     * Refresh the publications array until all publications are displayed
     *
     * Sometimes not all publications are retrieved, so the while loop has a
     * maximum amount of attemps
     */
    async function refreshPublicationsOpenCitations() {
        // Get the amount of publications (Independent from source)
        let amountAllPublications = 0;
        for (const [key, value] of currentResult.amountPublications.entries()) {
            amountAllPublications += value;
        }
        let attemps = 0;
        let threshold = 1.5 * amountAllPublications;
        // Try to get all publications
        while (
            publications.length < amountAllPublications &&
            attemps < threshold
        ) {
            publications = currentResult.publications;
            attemps += 1;
            await new Promise((r) => setTimeout(r, 5000));
        }
        stillLoading = false;
    }

    /**
     * When detailed view is loaded get the full papers
     */
    onMount(async () => {
        // Start the semantic scholar agent
        Manager.getRepoSemanticPublications(currentResult);

        // Start the open citations agent
        Manager.getRepoOpenCitationsPublications(currentResult);

        // Start the data cite agent
        Manager.getRepoDataCitePublications(currentResult);

        // Start refreshing the publications
        refreshPublicationsOpenCitations();
    });
</script>

<DetailedViewHeader repository={currentResult} />

<GitLink url={currentResult.url} />

<DetailedViewButtons bind:showReadme bind:showDetails bind:showPublications />

{#if showReadme}
    <GitReadme repository={currentResult} />
{/if}

{#if showDetails}
    <GitDetails repository={currentResult} />
{/if}

<!-- Dieser Teil hier verursacht den Fehler BUG -->
{#if showPublications}
    <Publications repository={currentResult} {publications} {stillLoading} />
{/if}
