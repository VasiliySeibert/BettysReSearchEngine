import { githubResults } from '$lib/stores/githubResults.store';
import type { Search, Repository, Publication } from '$lib/types/githubResults.type';
import Manager from './Manager';
import { authTokenZenodo } from '$lib/stores/githubResults.store';
import { get } from "svelte/store";


export class zenodoAgent {
    id: number;
    stop: boolean;
    static zenodoAccessToken: string = get(authTokenZenodo).valueOf();

    constructor(id: number) {
        this.id = id;
        this.stop = false;
    }

    /**
     * get the Doi and then get all Citations
     * @param repo Repository
     */
    async startZenodoSearch(repo: Repository) {
        let zenodoDoi = this.getZenodoDoi(repo.readme);
        let statusCode = 0;
        let status = true;
        // Only make the call to Zenodo if the doi was found
        if (zenodoDoi !== "error" && !this.stop) {
            statusCode = await this.getAllCitations(repo, zenodoDoi);
        }
        if (!this.stop) {
            status = statusCode !== 429;
            Manager.statusZenodoAgent(status, repo);
        }

    }

    /**
     * Gets the doi from a Readme file 
     * @param readme Readme file
     * @returns doi if found
     */
    private getZenodoDoi(readme: string) {
        try {
            let zenodoBadgePattern = /zenodo.org\/badge\/DOI\/10.5281\/zenodo.(\d+)/
            let doiIdPattern = /zenodo.(\d+).?/;
            let zenodoLinkPattern = /zenodo.org\/record\/(\d+)/;
            let zenodoLatestPattern = /zenodo.org\/badge\/latestdoi\/\d+(?:(?:\/\w+-*\w+)*)?/;

            // Temp Doi
            var doi = "error";

            let match0 = zenodoBadgePattern.exec(readme);
            if (match0 !== null) {
                doi = match0[1];
                return doi;
            }
            let match1 = doiIdPattern.exec(readme);
            if (match1 !== null) {
                doi = match1[1];
                // console.log('REGEX MATCH 1 ' + doi);
                return doi;
            }
            let match2 = zenodoLinkPattern.exec(readme);
            if (match2 !== null) {
                doi = match2[1];
                // console.log('REGEX MATCH 2 ' + doi);
                return doi;
            }
            // // Blocked by cors
            // let match3 = "https://" + zenodo_latest_pattern.exec(readme);
            // if (match3 !== null) {
            //     let tmpUrl = match3[0];


            //     fetch(tmpUrl).then((res) => {
            //         // TODO get real redirect

            //         let realUrl = res.url;
            //         console.log(tmpUrl);
            //         console.log(realUrl);
            //         console.log(res.redirected)
            //         doi = realUrl.split("/").slice(-1)[0];
            //         console.log('REGEX MATCH 3 ' + doi);
            //         return doi;
            //     }).then((doi_tmp) => {
            //         doi = doi;
            //     })
            // }

            return doi;
        } catch (e) {
            console.log(`Error ${e}`);
            return "error"
        }
    }

    /**
     * getsAllCitations for a repo and writes them to the store
     * @param repoIdx Index of the repo in the store
     * @param zenodo_doi the doi which was found in the readme
     * @returns status of the request
     */
    private async getAllCitations(repo: Repository, zenodo_doi: string) {
        if (this.stop) {
            return 200;
        }
        let repoName = repo.name;
        // This request gets the concept_doi
        const url = 'https://zenodo.org/api/records/' + zenodo_doi + '?access_token=' + zenodoAgent.zenodoAccessToken;
        let res = await fetch(url);
        // Check if it's not blocked by too many requests
        if (res.status === 429) {
            return res.status;
        }
        let json = await res.json();
        let conceptDoi = json.conceptdoi;
        // Checks to see if the doi is from the repo
        // Remove all non alphanumeric symbols from the strings 
        let titleInZenodo = json.metadata.title.toLowerCase().replace(/[^0-9a-z]/gi, '');
        let shortRepoName = repoName.split('/')[1].toLowerCase().replace(/[^0-9a-z]/gi, '');
        let nameInZenodoTitle = titleInZenodo.includes(shortRepoName);
        //let zenodoTitleInReadme = repo.readme.toLowerCase().replace(/[^0-9a-z]/gi, '').includes(titleInZenodo); //Too many false positives
        let doiFromBadge = this.zenodoBadgeReadme(repo.readme);
        // Check if the repoName is the same as in Zenodo
        if (!(nameInZenodoTitle || doiFromBadge)) {
            githubResults.setAmountPublications(repoName, 'zenodo', 0);
            return res.status;
        }

        // This request returns all the citations
        const url1 = 'https://zenodo-broker.web.cern.ch/api/relationships?page=1&id=' + conceptDoi + '&scheme=doi&group_by=version&relation=isCitedBy&sort=-mostrecent&size=9999';

        let res1 = await fetch(url1);
        let json1 = await res1.json();

        let citationJson = json1.hits.hits;

        try {
            // we loop over each citation which are defined in json.hits.hits
            for (const citation of citationJson) {
                let urlArray = new Array();
                let citationDoi = ""
                let citationLink = ""
                // since doi is an identifier we have to check the Identifiers
                for (const item of citation.metadata.Source.Identifier) {
                    // zenodo has either "ads" or "doi" as an identifier for the citations, this is still a relic from the python api
                    // but is still being kept to provide an alternative in case the doi is not available, which happens often
                    if (item.IDScheme == "ads" && item.IDURL && citationLink === "") {
                        citationLink = item.IDURL
                    }
                    else if (item.IDScheme == "doi" && item.IDURL && citationDoi === "") {
                        citationDoi = item.IDURL
                    }
                }
                for (const item of citation.metadata.Source.Identifier) {
                    urlArray.push(item.IDURL);
                }

                // next up are the Authors
                let authorArr = new Array() as Array<string>
                // the Author list can be found under citation.metadata.Source.Creator but can also be undefined for a citation, so 
                // it has to be checked to avoid an error
                if (!(citation.metadata.Source.Creator === undefined)) {

                    for (const item of citation.metadata.Source.Creator) {
                        authorArr.push(item.Name);
                    }
                }

                let pub: Publication = {
                    doi: citationDoi,
                    name: citation.metadata.Source.Title,
                    source: "Zenodo",
                    authorNames: authorArr,
                    externalIds: undefined,
                    abstract: undefined,
                    venue: undefined,
                    year: undefined,
                    referenceCount: undefined,
                    citationCount: undefined,
                    fieldsOfStudy: undefined,
                    publicationTypes: undefined,
                    publicationDate: undefined,
                    journal: undefined,
                    url: urlArray
                };
                // Some publications have almost all values as undefined which throws an error in the store
                try {
                    githubResults.addPublication(repoName, pub);

                } catch (error) {
                    console.log(error)
                }
            }
        }
        catch (e) {
            console.log(e)
        }
        // Update the agent Query term of the repo
        repo.agentQueryTerm.zenodo = '10.5281/zenodo.' + zenodo_doi;
        githubResults.updateRepo(repo);

        githubResults.setAmountPublications(repoName, 'zenodo', citationJson.length);
        return res.status;
    }

    /**
     * Sets the stop variable value
     * @param value  - new value of stop variable
     */
    setStop(value: boolean) {
        this.stop = value;
        console.log(`Zenodo Agent ${this.id} set to ${this.stop}`);
    }

    /**
     * Check if the readme contains a valid zenodo badge
     * @param readme Readme
     * @returns true if zenodo doi badge in readme, else false
     */
    zenodoBadgeReadme(readme: string) {
        let zenodoBadgePattern = /zenodo.org\/badge\/DOI\/10.5281\/zenodo.(\d+)/
        let match0 = zenodoBadgePattern.exec(readme);
        if (match0 !== null) {

            return true;
        }
        return false;

    }
}

