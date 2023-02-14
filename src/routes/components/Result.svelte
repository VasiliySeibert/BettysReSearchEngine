<script lang="ts">
    import type { Repository } from "$lib/types/githubResults.type";
    import { getContext } from "svelte";
    import DetailedView from "./DetailedView/DetailedView.svelte";
    import { searchTerm } from "../ViewController.js";
    import exportFromJSON from "export-from-json";
    import Select from "svelte-select";
    import { Menu, Button, List, ListItem } from "svelte-materialify";

    const { open } = getContext("simple-modal");

    export let result: Repository;

    const showDetailedView = () => {
        open(DetailedView, { currentResult: result });
    };

    //$: console.log(result) // for debugging purposes only

    $: amountZenodoCitations = getPublicationsOrZero(result, "zenodo");
    $: amountOpenAlexCitations = getPublicationsOrZero(result, "openAlex");
    $: amountOpenCitationsCitations = getPublicationsOrZero(
        result,
        "openCitations"
    );
    $: amountDataCiteCitations = getPublicationsOrZero(result, "DataCite");
    $: amountSemanticScholarCitations = getPublicationsOrZero(
        result,
        "semanticScholar"
    );
    $: amountCitationCff = getPublicationsOrZero(result, "citationCff");
    $: amountTotalCitations = getPublicationsOrZero(result, "total");

    function getPublicationsOrZero(repository: Repository, source: string) {
        const count = repository.amountPublications.get(source);
        // return 0 if amount citations is undefined
        if (count === undefined) return 0;
        return count;
    }
    const bibTexString = `@misc{${result.name},
        title = "${result.name}",
        doi = "${result.mainPaper?.doi}",
        month = ${result.createdAt.getMonth()},
        year = ${result.createdAt.getFullYear()},
        url  = "${result.url}",
        note = "Stars: ${result.stars}; Forks: ${result.forks};
                Language: ${result.language}"
    }
    `;
    const bibTexUrl =
        "data:text/bib;charset=utf-8," + encodeURIComponent(bibTexString);
    const bibTexFileName = `${result.name}.bib`;
</script>

<tr>
    <td
        class="p-3 whitespace-nowrap text-m font-bold text-blue-500 hover:text-blue-700 hover:cursor-pointer hover:underline"
    >
        <div
            style="display: flex; justify-content: space-between; flex-direction: row; align-items: center"
        >
            <p on:click={showDetailedView} on:keypress>{result.name}</p>

            <div style="display: flex; align-items: center">
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
                    <List
                        style="text-decoration: none; color: black; font-weight: normal"
                    >
                        <ListItem
                            --background="rgba(0,0,0, 1)"
                            on:click={() => {
                                const data = [result];
                                const fileName = "BettysResult_" + result.name;
                                const exportType = exportFromJSON.types.json;
                                console.log(exportType);
                                exportFromJSON({ data, fileName, exportType });
                            }}>JSON</ListItem
                        >

                        <ListItem
                            style="text-decoration: none; color: black"
                            on:click={() => {
                                const data = [result];
                                const fileName = "BettysResult_" + result.name;
                                const exportType = exportFromJSON.types.csv;
                                console.log(exportType);
                                exportFromJSON({ data, fileName, exportType });
                            }}>CSV</ListItem
                        >

                        <ListItem>
                            <a
                                href={bibTexUrl}
                                download={bibTexFileName}
                                style="text-decoration: none; color: black"
                                class="no-underline">BIB</a
                            >
                        </ListItem>
                    </List>
                </Menu>
            </div>
        </div>
    </td>
    <td
        class="p-3 whitespace-nowrap text-center border-l-2 text-m text-gray-700"
        >{amountZenodoCitations}</td
    >
    <td class="p-3 whitespace-nowrap text-center text-m text-gray-700"
        >{amountOpenAlexCitations}</td
    >
    <td class="p-3 whitespace-nowrap text-center text-m text-gray-700"
        >{amountOpenCitationsCitations}</td
    >
    <td class="p-3 whitespace-nowrap text-center text-m text-gray-700"
        >{amountDataCiteCitations}</td
    >
    <td class="p-3 whitespace-nowrap text-center text-m text-gray-700"
        >{amountSemanticScholarCitations}</td
    >
    <td class="p-3 whitespace-nowrap text-center text-m text-gray-700"
        >{amountCitationCff}</td
    >
    <td
        class="p-3 whitespace-nowrap text-center border-r-2 text-m font-medium text-gray-700"
        >{amountTotalCitations}</td
    >
    <td class="p-3 whitespace-nowrap text-m text-gray-700">{result.language}</td
    >
</tr>
