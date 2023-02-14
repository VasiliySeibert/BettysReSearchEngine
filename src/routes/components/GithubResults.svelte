<script lang="ts">
    // TODO if there are not repos found, show it
    import { githubResults } from "$lib/stores/githubResults.store";
    import Manager from "$lib/controller/Manager";
    import type { Repository, Search } from "$lib/types/githubResults.type";
    import { blur } from "svelte/transition";
    import Spinner from "./Spinner.svelte";
    import Result from "./Result.svelte";
    import SmallResult from "./SmallResult.svelte";
    import { searchTerm } from "../ViewController";
    import exportFromJSON from "export-from-json";
    import { page_shown } from "../ViewController.js";
    import Select, { Option } from "@smui/select";
    import { Menu, Button, List, ListItem } from "svelte-materialify";

    // Reactive variable for the amount of done Zenodo searchs
    $: amountZenodoSearchs = Manager.amountDoneZenodoRepo;

    let showLanguageDropdown = false;

    let currentSelectedLanguage: string | undefined = undefined;
    let sortKey: string | undefined = undefined;
    $: filteredAndSortedRepositories = filterAndSort(
        Array.from($githubResults.repositories.values()),
        currentSelectedLanguage,
        sortKey
    );

    $: programmingLanguages = countLanguages($githubResults);

    function countLanguages(search: Search) {
        const repositories = Array.from(search.repositories.values());
        const languages = new Map<string, number>();
        repositories
            .map((repository) => repository.language)
            .forEach((language) => {
                // set language to Unknown when it is not a valid language
                if (language === undefined || language === null) {
                    language = "Unknown";
                }
                const count = languages.get(language);
                if (count === undefined) {
                    languages.set(language, 1);
                } else {
                    languages.set(language, count + 1);
                }
            });
        // sort alphabetically before returning
        return [...languages.entries()].sort((a, b) => {
            // Unknown is "greater" than every other language so that it is at the end of the list
            if (a[0] === "Unknown") return 1;
            if (a[0] < b[0]) return -1;
            else if (a[0] > b[0]) return 1;
            return 0;
        });
    }

    function toggleLanguageDropdown() {
        showLanguageDropdown = !showLanguageDropdown;
    }

    function filterAndSort(
        repositories: Repository[],
        filterBy: string | undefined,
        sortBy: string | undefined
    ) {
        if (filterBy === "Unknown") {
            repositories = repositories.filter(
                (repository) =>
                    repository.language === undefined ||
                    repository.language === null
            );
        } else if (filterBy !== undefined) {
            repositories = repositories.filter(
                (repository) => repository.language === filterBy
            );
        }

        if (sortBy !== undefined) {
            repositories.sort((a, b) => {
                const countB = b.amountPublications.get(sortBy);
                const countA = a.amountPublications.get(sortBy);
                if (countB === undefined || countA === undefined) return 0; // cannot compare, assume equal
                return countB - countA;
            });
        }

        // count total citations
        repositories.forEach((repository) => {
            repository.amountPublications.set(
                "total",
                [...repository.amountPublications.entries()]
                    .filter((publications) => publications[0] !== "total")
                    .reduce(
                        (publicationSum, currentValue) =>
                            publicationSum + currentValue[1],
                        0
                    )
            );
        });

        return repositories;
    }
    function triggerCsvDownload() {
        const data = Array.from($githubResults.repositories.values());
        const fileName = $searchTerm;
        const exportType = exportFromJSON.types.csv;
        exportFromJSON({ data, fileName, exportType });
    }

    $: bibTexUrl = createBibTexUrl($githubResults.repositories.values());
    // Don't change the string format
    function createBibTexUrl(repositories: IterableIterator<Repository>) {
        let bibTexString = "";
        for (let repo of repositories) {
            bibTexString += `@misc{${repo.name},
            title = "${repo.name}",
            doi = "${repo.mainPaper?.doi}",
            month = ${repo.createdAt.getMonth()},
            year = ${repo.createdAt.getFullYear()},
            url  = "${repo.url}",
            note = "Stars: ${repo.stars}; Forks: ${repo.forks};
                    Language: ${repo.language}"
}
`;
        }

        return (
            "data:text/bib;charset=utf-8," + encodeURIComponent(bibTexString)
        );
    }
    $: bibTexFileName = `${$searchTerm}.bib`;
</script>

{#if $githubResults.repositories.size > 0}
    <div class="flex justify-center m-8">
        <div
            class="flex flex-col justify-center "
            in:blur={{ delay: 0, duration: 600 }}
        >
            <div
                style="display:flex; flex-direction: row; justify-content: space-between; gap: 30px"
            >
                <div style="display: flex; flex-direction: column">
                    Your Search Query corresponds with {$githubResults.totalRepos}
                    Repositories on GitHub, we have loaded {$githubResults
                        .repositories.size} of them:
                    <div class="w-full bg-gray-200 mb-2">
                        <div
                            class="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none"
                            style:width="{($githubResults.repositories.size /
                                $githubResults.totalRepos) *
                                100}%"
                        >
                            {$githubResults.repositories
                                .size}/{$githubResults.totalRepos}
                        </div>
                    </div>
                    We have searched {$amountZenodoSearchs} Repositories on Zenodo
                    so far:
                    <div class="w-full bg-gray-200">
                        <div
                            class="bg-green-600 text-xs font-medium text-green-100 text-center p-0.5 leading-none"
                            style:width="{($amountZenodoSearchs /
                                $githubResults.totalRepos) *
                                100}%"
                        >
                            {$amountZenodoSearchs}/{$githubResults.totalRepos}
                        </div>
                    </div>
                </div>
                <div
                    style="display: flex; flex-direction: column; justify-content: center; align-items: flex-end; gap: 15px"
                >
                    <div class="d-flex justify-center">
                        <Menu style="background: rgba(255,255,255,1)">
                            <div slot="activator">
                                <Button
                                    ><svg
                                        width="20px"
                                        height="20px"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M16 11L12 15M12 15L8 11M12 15V3M21 15V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V15"
                                            stroke="#000000"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg></Button
                                >
                            </div>
                            <List>
                                <ListItem
                                    --background="rgba(0,0,0, 1)"
                                    on:click={() => {
                                        const data = Array.from(
                                            $githubResults.repositories.values()
                                        );
                                        const fileName =
                                            "BettysResult_" + $searchTerm;
                                        const exportType =
                                            exportFromJSON.types.json;
                                        console.log(exportType);
                                        exportFromJSON({
                                            data,
                                            fileName,
                                            exportType,
                                        });
                                    }}>JSON</ListItem
                                >
                                <ListItem
                                    on:click={() => {
                                        const data = Array.from(
                                            $githubResults.repositories.values()
                                        );
                                        const fileName =
                                            "BettysResult_" + $searchTerm;
                                        const exportType =
                                            exportFromJSON.types.csv;
                                        console.log(exportType);
                                        exportFromJSON({
                                            data,
                                            fileName,
                                            exportType,
                                        });
                                    }}>CSV</ListItem
                                >
                                <ListItem>
                                    <a
                                        href={bibTexUrl}
                                        download={bibTexFileName}
                                        style="text-decoration: none; color: black"
                                        >BIB
                                    </a>
                                </ListItem>
                            </List>
                        </Menu>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex justify-center">
            <p in:blur={{ delay: 0, duration: 600 }} />
        </div>
    </div>

    <div class="m-4 overflow-auto rounded-lg shadow hidden md:block">
        <table class="w-full">
            <thead class="bg-gray-100 border-b-2 border-gray-200">
                <tr class="text-gray-700">
                    <th />
                    <th class="bg-gray-200 p-3" colspan="7"
                        >Citations (Click to Sort)</th
                    >
                    <th />
                </tr>
                <tr class="text-gray-700">
                    <th
                        class="w-96 p-3 text-m font-semibold tracking-wide text-left"
                        >Repository Name (Click to show Details)</th
                    >
                    <th
                        on:click={() => (sortKey = "zenodo")}
                        class="hover:cursor-pointer hover:underline hover:text-gray-900 p-3 text-center border-l-2 text-m font-semibold tracking-wide"
                        >Zenodo</th
                    >
                    <th
                        on:click={() => (sortKey = "openAlex")}
                        class="hover:cursor-pointer hover:underline hover:text-gray-900 p-3 text-center text-m font-semibold tracking-wide"
                        >OpenAlex</th
                    >
                    <th
                        on:click={() => (sortKey = "openCitations")}
                        class="hover:cursor-pointer hover:underline hover:text-gray-900 p-3 text-center text-m font-semibold tracking-wide"
                        >OpenCitations</th
                    >
                    <th
                        on:click={() => (sortKey = "DataCite")}
                        class="hover:cursor-pointer hover:underline hover:text-gray-900 p-3 text-center text-m font-semibold tracking-wide"
                        >DataCite</th
                    >
                    <th
                        on:click={() => (sortKey = "semanticScholar")}
                        class="hover:cursor-pointer hover:underline hover:text-gray-900 p-3 text-center text-m font-semibold tracking-wide"
                        >S. Scholar</th
                    >
                    <th
                        on:click={() => (sortKey = "citationCff")}
                        class="hover:cursor-pointer hover:underline hover:text-gray-900 p-3 text-center text-m font-semibold tracking-wide"
                        >CitationCff</th
                    >
                    <th
                        on:click={() => (sortKey = "total")}
                        class="hover:cursor-pointer hover:underline hover:text-gray-900 p-3 text-center border-r-2 text-m font-semibold tracking-wide"
                        >Total Citations</th
                    >
                    <th
                        class="w-52 p-3 text-m font-semibold tracking-wide text-left"
                    >
                        <p
                            on:click={toggleLanguageDropdown}
                            on:keypress
                            class="hover:underline hover:cursor-pointer hover:text-gray-900"
                        >
                            Languages (Select)
                        </p>
                        {#if showLanguageDropdown}
                            <div
                                class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="menu-button"
                                tabindex="-1"
                            >
                                <div class="py-1">
                                    <p
                                        on:click={() =>
                                            (currentSelectedLanguage =
                                                undefined)}
                                        on:click={toggleLanguageDropdown}
                                        on:keypress
                                        class="text-gray-700 block px-4 py-2 text-sm no-underline hover:bg-gray-200 hover:cursor-pointer"
                                    >
                                        All Languages ({programmingLanguages.reduce(
                                            (prev, curr) => prev + curr[1],
                                            0
                                        )})
                                    </p>
                                    {#each programmingLanguages as [language, count]}
                                        <p
                                            on:click={() =>
                                                (currentSelectedLanguage =
                                                    language)}
                                            on:click={toggleLanguageDropdown}
                                            on:keypress
                                            class="text-gray-700 block px-4 py-2 text-sm no-underline hover:bg-gray-200 hover:cursor-pointer"
                                        >
                                            {language} ({count})
                                        </p>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </th>
                </tr>
            </thead>
            <tbody class="striped divide-y divide-gray-200">
                {#each filteredAndSortedRepositories as result}
                    <Result {result} />
                {/each}
            </tbody>
        </table>
    </div>

    <div class="m-3 grid grid-cols-1 gap-4 md:hidden sm:grid-cols-2">
        {#each filteredAndSortedRepositories as result}
            <SmallResult {result} />
        {/each}
    </div>
{:else}
    <div class="flex justify-center">
        <Spinner />
    </div>
{/if}
