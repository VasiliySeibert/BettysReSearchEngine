import { githubResults } from '$lib/stores/githubResults.store';
import type { MainPaper, Repository, Publication } from '$lib/types/githubResults.type';


export class DataCiteAgent {
    id: number;
    static maxID: number = 0;

    constructor() {
        this.id = DataCiteAgent.maxID;
        DataCiteAgent.maxID++;
    }

    /**
     * get the Doi and then get all Citations
     * @param repo Repository
     */
    async startDataCiteSearch(repo: Repository) {
        // Only make the call if the doi was previosly found -- Maybe change this 
        // Doing in this way to save api calls
        if (repo.mainPaper == undefined) {
            return
        }
        if (repo.mainPaper.citationsArray == undefined) {
            return
        }
        try {
            // we loop over each citation which are defined in citationsArray
            for (const citationDoi of repo.mainPaper.citationsArray) {
                try {
                    // TODO Add Access token
                    const url = 'https://api.datacite.org/dois/' + citationDoi
                    let res = await fetch(url);
                    let json = await res.json();


                    let doi = json.data.attributes.doi;
                    let title = json.data.attributes.titles[0].title;
                    let journal = json.data.attributes.publisher;
                    let date = new Date(json.data.attributes.dates[0].date);
                    let abstract = json.data.attributes.descriptions[0].description;
                    let link = json.data.attributes.url;

                    let authorsTemp = json.data.attributes.creators;

                    // next up are the Authors
                    let authorArr = new Array() as Array<string>;
                    for (const author of authorsTemp) {
                        authorArr.push(author.name);
                    }

                    // Get citations
                    let citations: Array<string> = [];
                    // Only parse citations if there are citations 
                    let citationsTemp = json.data.relationships.citations.data;
                    for (let cit of citationsTemp) {
                        if (cit.type = "dois") {
                            citations.push(cit.id);
                        }
                    }
                    let citationCount = citations.length;

                    let pub: Publication = {
                        doi: doi,
                        name: title,
                        source: "Data Cite",
                        authorNames: authorArr,
                        externalIds: undefined,
                        abstract: abstract,
                        venue: undefined,
                        year: date.getFullYear(),
                        referenceCount: undefined,
                        citationCount: citationCount,
                        fieldsOfStudy: undefined,
                        publicationTypes: undefined,
                        publicationDate: undefined,
                        journal: journal,
                        url: link
                    };
                    githubResults.addPublication(repo.name, pub);


                } catch (error) {
                    // When no citations was found
                    // console.log(error);
                }

            }
        }
        catch (e) {
            console.log(e)
        }


    }

    /**
     * Gets the amount of zenodo citations or other citations
     * @param repo Repository
     */
    async getAmountCitations(repo: Repository) {
        let zenodoDoi = "error";
        let doiFromZenodo = false;
        let url = ""
        if (repo.mainPaper !== undefined) {
            if (repo.mainPaper.doi !== undefined) {
                zenodoDoi = repo.mainPaper.doi;
                url = 'https://api.datacite.org/dois/' + zenodoDoi;
            }
        } else {
            zenodoDoi = this.getZenodoDoi(repo.readme);
            doiFromZenodo = true
            url = 'https://api.datacite.org/dois/10.5281/zenodo.' + zenodoDoi;
        }


        // Only make the call to Datacite if the doi was found
        if (zenodoDoi == "error") {
            githubResults.setAmountPublications(repo.name, 'DataCite', 0);
            return;
        }

        try {

            let res = await fetch(url);
            let json = await res.json();
            let doi = json.data.attributes.doi;
            let title = json.data.attributes.titles[0].title;
            let journal = json.data.attributes.publisher;
            let date = new Date(json.data.attributes.dates[0].date);
            let abstract = json.data.attributes.descriptions[0].description;


            // Get citations
            let citations: Array<string> = [];
            // Only parse citations if there are citations 
            let citationsTemp = json.data.relationships.citations.data;
            for (let cit of citationsTemp) {
                if (cit.type = "dois") {
                    citations.push(cit.id);
                }
            }
            let citationCount = citations.length;


            let mainPaper: MainPaper = {
                doi: doi,
                title: title,
                journal: journal,
                dateReleased: date,
                abstract: abstract,
                citationsArray: citations
            }
            // Update Repo Main Paper
            repo.mainPaper = mainPaper;
            // Update the agent Query term of the repo
            if (doiFromZenodo) {
                zenodoDoi = '10.5281/zenodo.' + zenodoDoi
            }
            repo.agentQueryTerm.dataCite = zenodoDoi;

            githubResults.updateRepo(repo);

            githubResults.setAmountPublications(repo.name, 'DataCite', citationCount);


        } catch (error) {
            // console.log(error)
            githubResults.setAmountPublications(repo.name, 'DataCite', 0);
        }
    }

    /**
     * Gets the doi from a Readme file 
     * @param readme Readme file
     * @returns doi if found
     */
    private getZenodoDoi(readme: string) {
        try {
            let doiIdPattern = /zenodo.(\d+).?/;
            let zenodoLinkPattern = /zenodo.org\/record\/(\d+)/;

            // Temp Doi
            var doi = "error"

            let match1 = doiIdPattern.exec(readme);
            if (match1 !== null) {
                doi = match1[1];
                return doi;
            }
            let match2 = zenodoLinkPattern.exec(readme);
            if (match2 !== null) {
                doi = match2[1];
                return doi;
            }
            return doi;
        } catch (e) {
            console.log(`Error ${e}`);
            return "error"
        }
    }

}

