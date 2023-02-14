import Manager from './Manager';

import { githubResults } from '$lib/stores/githubResults.store';
import type { Publication, Repository } from '$lib/types/githubResults.type';


export class SemanticScholarAgent {
    id: number;
    static classId: number = 0;
    stop: boolean;
    fields: string[];

    /**
     * Create an instance
     */
    constructor() {
        this.id = SemanticScholarAgent.classId;
        SemanticScholarAgent.classId++;
        this.stop = false;
        this.fields = ['url', 'title', 'referenceCount', 'citationCount', 'journal', 'fieldsOfStudy', 'authors', 'externalIds',
            'abstract', 'venue', 'year', 'publicationTypes', 'publicationDate']
    }

    /**
     * Start the search of papers in semantic scholar
     * @param repo Repository
     */
    startSemanticAgent(repo: Repository) {
        if (repo.mainPaper === undefined || repo.semanticPaperId == undefined) {
            return;
        }
        if (repo.amountPublications.has('semanticScholar') && (repo.amountPublications.get('semanticScholar') > 0)) {
            this.getSemanticScholarPapers(repo.name, repo.semanticPaperId, repo.amountPublications.get('semanticScholar'));
        }


    }

    /**
     * Get the amount of citations for a paper
     * @param repo Repository
     */
    getAmountCitations(repo: Repository) {
        if (repo.mainPaper !== undefined) {
            if (repo.mainPaper.title !== undefined) {
                this._getAmountCitations(repo, repo.mainPaper.title);
            }
        }
    }

    /**
     * Get the citing papers
     * @param repoName Name of the repository
     * @param paperId Semantic Scholar Paper ID
     * @param amountPublications Amount of publications that cite paper
     */
    private async getSemanticScholarPapers(repoName: string, paperId: string, amountPublications: number) {
        // Dynamically generate the desired fields
        let fieldString = "&fields="
        for (const field of this.fields) {
            fieldString += field;
            fieldString += ',';
        }
        // Remove last comma
        fieldString = fieldString.slice(0, -1);

        let url = 'https://api.semanticscholar.org/graph/v1/paper/' + paperId + "/citations?limit=100" + fieldString;
        try {
            let res = await fetch(url);
            let responseJson = await res.json();

            let totalPapers = amountPublications;
            let next = responseJson.next;
            let data = responseJson.data;

            // Magic Number 100: Amount of paper per request
            for (let i = 0; i <= Math.floor(totalPapers / 100); i++) {
                // Save one api call
                if (i !== 0) {
                    url = 'https://api.semanticscholar.org/graph/v1/paper/' + paperId + `/citations?offset=${i * 100}&limit=100` + fieldString;
                    res = await fetch(url);
                    responseJson = await res.json();
                    data = responseJson.data;
                    next = responseJson.next;
                }
                for (const citingPaper of data) {
                    // Get authors
                    let authorArr = new Array() as Array<string>;

                    // Get paper
                    const paper = citingPaper.citingPaper;

                    for (const author of paper.authors) {
                        authorArr.push(author.name);
                    }

                    let pub: Publication = {
                        doi: "temp",
                        name: paper.title,
                        source: "Sematic Scholar",
                        authorNames: authorArr,
                        externalIds: paper.externalIds,
                        abstract: paper.abstract,
                        venue: paper.venue,
                        year: paper.year,
                        referenceCount: paper.referenceCount,
                        citationCount: paper.citationCount,
                        fieldsOfStudy: paper.fieldsOfStudy,
                        publicationTypes: paper.publicationTypes,
                        publicationDate: new Date(paper.publicationDate),
                        journal: paper.journal,
                        url: [paper.url]
                    };
                    githubResults.addPublication(repoName, pub);
                }

                // For some reason the limit changes depending on the query
                if (next === undefined || next >= 10000) {
                    break;
                }

            }



        } catch (error) {
            console.log('--------------------____ERROR______------------------')
            console.log(error);
        }

    }

    /**
     * Get the amount of citations for a paper
     * @param repoName Name of the repository
     * @param titlePaper Exact title of the paper
     */
    private async _getAmountCitations(repo: Repository, titlePaper: string) {
        let publication = await this._getOriginalPublication(titlePaper);
        if (publication !== undefined) {
            githubResults.setSemanticPaperID(repo.name, publication.paperId);
            githubResults.setAmountPublications(repo.name, 'semanticScholar', publication.citationCount);

            // Update the agent Query term of the repo
            repo.agentQueryTerm.semanticScholar = titlePaper;
            githubResults.updateRepo(repo);
        }

    }

    /**
     * Get the right paper (Usually it's the first one)
     * @param titlePaper original title found in citation.cff file
     * @returns Data from the paper
     */
    private async _getOriginalPublication(titlePaper: string) {
        // Dynamically generate the desired fields
        let fieldString = "&fields="
        for (const field of this.fields) {
            fieldString += field;
            fieldString += ',';
        }
        // Remove last comma
        fieldString = fieldString.slice(0, -1);

        let url = 'https://api.semanticscholar.org/graph/v1/paper/search?query=' + encodeURIComponent(`"${titlePaper}"`) + "&limit=100" + fieldString;
        try {
            let res = await fetch(url);
            let responseJson = await res.json();
            let data = responseJson.data;
            for (const paper of data) {
                // console.log('--------------COMPARING---------------')
                // console.log(`${paper.title} VS ${titlePaper}`)
                if (paper.title.trim().toUpperCase() == titlePaper.trim().toUpperCase()) {
                    return paper;
                }
            }

        } catch (error) {
            console.log('--------------------____ERROR______------------------')
            console.log(error);
        }
    }
}