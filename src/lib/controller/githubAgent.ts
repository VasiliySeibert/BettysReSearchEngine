import { githubResults } from '$lib/stores/githubResults.store';
import type { Search, Repository, Publication, MainPaper, AgentQueryTerm } from '$lib/types/githubResults.type';
import yaml from 'js-yaml';
import { authTokenGithub } from '$lib/stores/githubResults.store';
import { get } from "svelte/store";
import Manager from './Manager';


export class githubAgent {
    id: number;
    static maxID: number = 0;
    stop: boolean;

    /**
     * creates a Github Agent
     * @param search the Query String
     * @param jobs a job list containing page numbers of Github
     * @param id the id Of the Agent
     */
    // old constructor
    /*constructor(search: string, jobs: number[], id: number) {
        this.search = search;
        this.jobs = jobs;
        this.id = id;
    }*/

    constructor() {
        this.id = githubAgent.maxID;
        githubAgent.maxID++;
        this.stop = false;

    }

    /**
     * makes a quick Peek without any filter/queryLimit on Github for the Search Query and stores the Search Object with the total amount of repos
     * in the Store if <1000 results are found
     * @param q query String
     */
    async startPrePeek(q: string, queryLimit: string) {
        const totalCount: number = await this.getAmountRepos(q, 'repositories', queryLimit)
        console.log('prePeek found ' + totalCount + ' results')
        if (totalCount <= 1000) return true
        else return false
    };
    /**
     * makes a quick Peek with filter/queryLimit on Github if simpleSearch == True for the Search Query and stores the Search Object with the total amount of repos
     * in the Store
     * @param q query String
     * @param queryLimit search filter String
     */
    async startPeek(q: string, queryLimit: string) {
        const queryString = '?q=' + encodeURIComponent(`"${q}" ` + queryLimit);
        const url = 'https://api.github.com/search/repositories' + queryString;
        try {
            const res = await fetch(url + '&page=' + "1" + '&size=100', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'token ' + get(authTokenGithub).valueOf()
                }
            })
                .then(res => res.json())
                .then(out => {
                    // console.log(out)
                    let search: Search = {
                        query: q,
                        totalRepos: out.total_count,
                        repositories: new Map() as Map<string, Repository>
                    }
                    // console.log(out.items[0])
                    githubResults.setSearch(search)
                })
        } catch (e) {
            // console.log(`Error ${e}`);
        }
    };
    /**
     * Spaguetti Code :(
     * @param q Query
     * @param queryExtension Query Endpoint (Code or repository)
     * @param queryLimit delimiter for the query
     * @returns Amount of repos found
     */
    async getAmountRepos(q: string, queryExtension: string, queryLimit: string) {
        const queryString = '?q=' + encodeURIComponent(`"${q}"` + ' ' + queryLimit);
        const url = 'https://api.github.com/search/' + queryExtension + queryString;
        try {
            const res = await fetch(url + '&page=' + "1" + '&size=100', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'token ' + get(authTokenGithub).valueOf()
                }
            })
            const responseJson = await res.json();
            return responseJson.total_count;

        } catch (e) {
            // console.log(`Error ${e}`);
            return 0;
        }

    };



    /**
     * iterates over all pageNumbers in the Job list saved in the Agent Object, which runs this method
     * iterates over all repos in a page and stores a Repo Object in the Store for each one.
     * @param q the Query String
     * @param pageIndex the page numbers to be extracted by the GithubAgent
     * @param reposPerPage the amount of repos per taken page. Maximum is 100
     */
    async startSearch(q: string, pageIndex: number[], reposPerPage: number, queryExtension: string, queryLimit: string) {
        const queryString = '?q=' + encodeURIComponent(`"${q}"` + ' ' + queryLimit);
        const url = 'https://api.github.com/search/' + queryExtension + queryString;
        try {
            for (const pageNumber of pageIndex) {
                // Stop mechanism
                if (this.stop) {
                    break;
                }

                let res = await fetch(url + '&page=' + pageNumber + '&per_page=' + reposPerPage, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'token ' + get(authTokenGithub).valueOf()
                    }
                })
                // console.log((url + '&page=' + pageNumber + '&per_page=' + reposPerPage))
                let json = await res.json();
                console.log(json)
                for (let i = 0; i < json.items.length; i++) {
                    // Stop mechanism
                    if (this.stop) {
                        break;
                    }

                    // Repo Info
                    let repositoryInfo = json.items[i];

                    // When the endpoint is different
                    if (queryExtension === 'code') { repositoryInfo = json.items[i].repository }

                    // Temporary amount of publicatons hash map
                    let tmpAmountPub = new Map() as Map<string, number>;
                    // Start the values at 0 to solve problems while sorting
                    tmpAmountPub.set('zenodo', 0);
                    tmpAmountPub.set('semanticScholar', 0);
                    tmpAmountPub.set('citationCff', 0);
                    // get citation.cff
                    let citation = await this.getCitationCffStart(repositoryInfo.full_name)
                    let citationObject;
                    let citationPub: Publication;
                    if (citation !== 'nothing found') {
                        citationObject = this.parseCitationCff(citation)

                        citationPub = {
                            doi: citationObject?.doi,
                            name: citationObject?.title,
                            source: '',
                            authorNames: [],
                            externalIds: undefined,
                            abstract: citationObject?.abstract,
                            venue: undefined,
                            year: undefined,
                            referenceCount: undefined,
                            citationCount: undefined,
                            fieldsOfStudy: undefined,
                            publicationTypes: undefined,
                            publicationDate: citationObject?.dateReleased,
                            journal: citationObject?.journal,
                            url: undefined
                        }
                        tmpAmountPub.set('citationCff', 1);
                    }


                    // For some reason some repos are "undefined"
                    let readme = "'404: Not Found'";
                    try {
                        readme = await this.getReadmeStart(repositoryInfo.full_name).then(res => res).then(out => { return out })
                    } catch (e) {

                    }



                    // falls Readme nicht gefunden
                    if (readme === "'404: Not Found'") { readme = "Null" }
                    // console.log(readme.split("\n")[0])

                    // The query terms used by the agents
                    let agentQuery: AgentQueryTerm = {
                        zenodo: '',
                        openAlex: '',
                        openCitations: '',
                        semanticScholar: '',
                        dataCite: ''
                    }

                    let repo: Repository = {
                        name: repositoryInfo.full_name,
                        url: repositoryInfo.html_url,
                        stars: repositoryInfo.stargazers_count,
                        forks: repositoryInfo.forks_count,
                        readme: readme,
                        publications: new Array() as Array<Publication>,
                        createdAt: new Date(repositoryInfo.created_at),
                        updatedAt: new Date(repositoryInfo.updated_at),
                        language: repositoryInfo.language,
                        homepage: repositoryInfo.homepage,
                        mainPaper: citationObject,
                        amountPublications: tmpAmountPub,
                        semanticPaperId: undefined,
                        gotSemanticPub: false,
                        gotOpenCitationsPub: false,
                        gotDataCitePub: false,
                        agentQueryTerm: agentQuery
                    };
                    // console.log(repo);
                    githubResults.addRepo(repo);
                    if (citationPub !== undefined) {
                        githubResults.addPublication(repo.name, citationPub);
                    }
                }
                Manager.statusGithubAgent(this.id, true, pageNumber);

            }
            Manager.statusGithubAgent(this.id, false, -1);
        } catch (e) {
            console.log(`Error ${e}`);
            Manager.statusGithubAgent(this.id, false, -1);
        }
    }



    /**
     * If the readme is found then the readme function returns the readme,
     * it will return the readme otherwise it will try again to a max of 3 trys
     * @param repoName The Github repo name example: tensorflow/tensorflow
     * @returns a 404 Not Found error or the found readme
     */
    async getReadmeStart(repoName: string) {
        let maxTrys = 0;
        while (maxTrys < 1) {
            let readme = await this.getReadme(repoName)
            if (readme !== "404: Not Found") {
                return readme;
            }
            maxTrys += 1;
        }

        let response = await fetch("https://api.github.com/repos/" + repoName + "/readme")
        if (response.status === 200) {
            let json = await response.json()
            let readme = atob(json.content)
            return readme
        }

        return "404: Not Found"
    }

    /**
     * Start the search for a citation.cff file
     * @param repoName Name of the repository
     * @returns Citation File or nothing found
     */
    async getCitationCffStart(repoName: string) {
        let maxTrys = 0;
        while (maxTrys < 1) {
            let citation_cff = await this.getCitationCff(repoName)
            if (citation_cff !== "404: Not Found") {
                // console.log("+-+-+-+-+-+-Citation Found+-+-+-+-+-+-")
                // console.log(citation_cff)
                return citation_cff
            }
            maxTrys += 1;
        }
        return 'nothing found'
    }



    /**
     * If the readme is found then the function instantly terminates and returns the readme,
     * if it doesnt find it returns 404 Not Found
     * @param full_name The Github repo name example: tensorflow/tensorflow
     * @returns a 404 Not Found error or the found readme
     */
    async getReadme(full_name: String) {
        const url = 'https://raw.githubusercontent.com/' + full_name + '/master/';
        const readmeArr = ["README.md", "README.rst", "readme.md"]
        // the purpose is to do readme requests sequentially, to avoid unnecessary requests
        for (const readmeType of readmeArr) {
            const responseReadme = await fetch(url + readmeType);
            if (responseReadme.ok) {
                return responseReadme.text();
            }
        }
        return "404: Not Found";
    }

    /**
     * Makes a call to raw.github to get the citation file
     * @param full_name Full Repository Name
     * @returns The CITATION.CFF file or not found
     */
    async getCitationCff(full_name: String) {
        const url = 'https://raw.githubusercontent.com/' + full_name + '/master/CITATION.cff';
        try {
            const res = await fetch(url)
            return res.text()
        }
        catch (e) {
            return '404: Not Found'

        }
    }

    /**
     * Use Yaml to parse the CITATION.CFF file
     * @param citationCff Citation cff file as string
     * @returns Citation Object or undefined
     */
    parseCitationCff(citationCff: string) {
        try {
            let result = yaml.load(citationCff)

            let title = result.title;

            if (result['preferred-citation'] !== undefined) {
                if (result['preferred-citation'].title !== undefined) {
                    title = result['preferred-citation'].title;
                }
            }

            let citation: MainPaper = {
                doi: result.doi,
                title: title,
                journal: result.journal,
                // authorNames: 
                dateReleased: new Date(result['date-released']),
                abstract: result.abstract,
                citationsArray: undefined
            }
            return citation
        } catch (error) {
            console.log("YAML ERROR");
            return undefined;
        }
    }

    /**
     * Sets the stop variable
     * @param value Value to set the stop variable
     */
    setStop(value: boolean) {
        this.stop = value;
        console.log(`Github Agent ${this.id} set to ${this.stop}`);
    }

}