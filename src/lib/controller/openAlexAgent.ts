import { githubResults } from '$lib/stores/githubResults.store';
import type { Publication, Repository } from '$lib/types/githubResults.type';

export class openAlexAgent {
    id: number;
    stop: boolean;
    static maxID: number = 0;

    constructor() {
        this.id = openAlexAgent.maxID;
        openAlexAgent.maxID++;
        this.stop = false;
    }

    async getOpenAlexCitations(repo: Repository) {
        if (this.stop) {
            return 200;
        }
        let gitURI = "github.com/" + repo.name;
        //https://api.openalex.org/works?filter=fulltext.search:%22github.com/obspy/obspy%22
        const queryString = '?filter=fulltext.search:' + encodeURIComponent(`"${gitURI}"`);
        const url = 'https://api.openalex.org/works' + queryString;

        // Update the agent Query term of the repo
        repo.agentQueryTerm.openAlex = gitURI;
        githubResults.updateRepo(repo);

        try {
            let res1 = await fetch(url);
            let json1 = await res1.json();
            let citationJson = json1;
            if (citationJson !== undefined) {
                githubResults.setAmountPublications(repo.name, "openAlex", citationJson.meta.count)
                for (const citation of citationJson.results) {
                    // next up are the Authors
                    let authorArr = new Array() as Array<string>
                    // the Author list can be found under citation.authorships
                    for (const authorShip of citation.authorships) {
                        authorArr.push(authorShip.author.display_name);
                    }

                    let fieldsOfStudyArr = new Array() as Array<string>
                    if (citation.concepts !== undefined) {
                        for (const fieldOfStudy of citation.concepts) {
                            fieldsOfStudyArr.push(fieldOfStudy.display_name)
                        }
                    }

                    let pub: Publication = {
                        doi: citation.doi,
                        name: citation.title,
                        source: "OpenAlex",
                        authorNames: authorArr,
                        externalIds: undefined,
                        abstract: undefined,
                        venue: citation.host_venue.display_name,
                        year: citation.publication_year,
                        referenceCount: undefined,
                        citationCount: citation.cited_by_count,
                        fieldsOfStudy: fieldsOfStudyArr,
                        publicationTypes: citation.type,
                        publicationDate: citation.publication_date,
                        journal: citation.publisher,
                        url: citation.doi
                    }
                    githubResults.addPublication(repo.name, pub)
                }
            } else {
                githubResults.setAmountPublications(repo.name, "openAlex", 0)
            }
        }
        catch (e) {
            console.log(e)
        }
    }


    // CODE FOR LATER

    // we loop over each citation which are defined in json.results
    /*for (const citation of citationJson) {

         // next up are the Authors
         let authorArr = new Array() as Array<string>
         // the Author list can be found under citation.authorships
         for (const authorShip of citation.authorships) {
                 authorArr.push(authorShip.author.display_name);
             }

        let pub: Publication = {
            doi: citation.doi,
            name: citation.title,
            source: "OpenAlex",
            authorNames: authorArr,
            externalIds: undefined,
            abstract: undefined,
            venue: undefined,
            year: undefined,
            referenceCount: undefined,
            citationCount: citation.cited_by_count,
            fieldsOfStudy: undefined,
            publicationTypes: undefined,
            publicationDate: undefined,
            journal: undefined,
            url: urlArray
        };
        // console.log(pub);
        githubResults.addPublication(repoName, pub);*/


}