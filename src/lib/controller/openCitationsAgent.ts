import { githubResults } from '$lib/stores/githubResults.store';
import type { MainPaper, Repository, Publication } from '$lib/types/githubResults.type';
import { authTokenOpenCitations } from "$lib/stores/authTokens.store";


export class OpenCitationsAgent {
    id: number;
    static classId: number = 0;
    private openCitationsToken: string = authTokenOpenCitations;

    /**
     * Create an instance
     */
    constructor() {
        this.id = OpenCitationsAgent.classId;
        OpenCitationsAgent.classId++;
    }

    /**
     * get the Doi and then get all Citations
     * @param repo Repository
     */
    async startOpenCitationSearch(repo: Repository) {
        // Only make the call if the doi was previosly found -- Maybe change this 
        // Doing in this way to save api calls
        if (repo.mainPaper === undefined) { return; }
        if (repo.mainPaper.citationsArray === undefined) { return; }
        try {
            // we loop over each citation which are defined in citationsArray
            for (const citationDoi of repo.mainPaper.citationsArray) {
                // TODO Add Access token
                const url = 'https://opencitations.net/index/api/v1/metadata/' + citationDoi
                let res = await fetch(url, {
                    headers: {
                        Authorization: this.openCitationsToken
                    }
                });
                let json = await res.json();
                if (json.length <= 0) { continue; }
                let authorsTemp = json[0]["author"].split(";");

                // next up are the Authors
                let authorArr = new Array() as Array<string>;
                for (const author of authorsTemp) {
                    authorArr.push(author);
                }

                let pub: Publication = {
                    doi: json[0]["doi"],
                    name: json[0]["title"],
                    source: "Open Citations",
                    authorNames: authorArr,
                    externalIds: json[0]["source_id"],
                    abstract: undefined,
                    venue: undefined,
                    year: parseInt(json[0]["year"]),
                    referenceCount: undefined,
                    citationCount: parseInt(json[0]["citation_count"]),
                    fieldsOfStudy: undefined,
                    publicationTypes: undefined,
                    publicationDate: undefined,
                    journal: json[0]["source_title"],
                    url: json[0]["oa_link"]
                };
                githubResults.addPublication(repo.name, pub);

            }
        }
        catch (e) {
            console.log(e)
        }


    }

    /**
     * Gets the amount of citations and stores the citing dois
     * @param repo Repository
     */
    async getAmountCitations(repo: Repository) {
        if (repo.mainPaper === undefined) { return; }
        if (repo.mainPaper.doi === undefined) { return; }
        let repoDoi = repo.mainPaper.doi;
        // Only make the call if a doi was found
        if (repoDoi === "error") {
            console.log("No citations found")
            // If the paper was not found, it is needed to be stored as having 0 citations to be sorted
            githubResults.setAmountPublications(repo.name, 'openCitations', 0);
        }
        // This request gets the concept_doi
        // TODO Add Access token
        const url = 'https://opencitations.net/index/api/v1/metadata/' + repoDoi;
        let res = await fetch(url, {
            headers: {
                Authorization: this.openCitationsToken
            }
        });
        let json = await res.json();
        if (json.length <= 0) {
            console.log("No citations found")
            // If the paper was not found, it is needed to be stored as having 0 citations to be sorted
            githubResults.setAmountPublications(repo.name, 'openCitations', 0);
        }

        // Split Citations
        let citationCount = parseInt(json[0]["citation_count"]);
        let citationsTemp = json[0]["citation"].split(";");
        let citations: Array<string> = [];
        // Only parse citations if there are citations 
        if (citationCount > 0) {
            for (let cit of citationsTemp) {
                citations.push(cit.trim());
            }
        }

        let mainPaper: MainPaper = {
            doi: json[0]["doi"],
            title: json[0]["title"],
            journal: json[0]["source_title"],
            dateReleased: new Date(json[0]["year"]),
            abstract: "",
            citationsArray: citations
        }

        // Update Repo Main Paper
        repo.mainPaper = mainPaper;

        // Update the agent Query term of the repo
        repo.agentQueryTerm.openCitations = repoDoi;

        githubResults.updateRepo(repo);

        githubResults.setAmountPublications(repo.name, 'openCitations', citationCount);

    }

    /**
     * Gets the doi from a Readme file 
     * @param readme Readme file
     * @returns doi if found
     */
    private getDoi(readme: string) {
        try {
            let doiIdPattern = /10\.\d{4,9}\/[-._()/:A-Za-z0-9]+/;

            // Temp Doi
            var doi = "error"

            let match1 = doiIdPattern.exec(readme);
            if (match1 !== null) {
                doi = match1[0];
                return doi;
            }

            return doi;
        } catch (e) {
            console.log(`Error ${e}`);
            return "error"
        }
    }

}

