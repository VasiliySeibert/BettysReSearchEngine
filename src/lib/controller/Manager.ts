import { writable, type Writable } from 'svelte/store';

import type { Repository, Publication } from '$lib/types/githubResults.type';
import { githubAgent } from '$lib/controller//githubAgent';
import { zenodoAgent } from '$lib/controller/zenodoAgent';
import { openAlexAgent } from '$lib/controller/openAlexAgent';
import { OpenCitationsAgent } from './openCitationsAgent';
import { SemanticScholarAgent } from '$lib/controller/semanticScholarAgent'
import { githubResults } from '$lib/stores/githubResults.store';
import { DataCiteAgent } from './DataCiteAgent';


import { authTokenGithub } from '$lib/stores/githubResults.store';
import { get } from "svelte/store";

class Queue<T>{
    // Taken from https://dev.to/glebirovich/typescript-data-structures-stack-and-queue-hld
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) { }

    enqueue(item: T): void {
        if (this.size() === this.capacity) {
            throw Error("Queue has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }
    dequeue(): T | undefined {
        return this.storage.shift();
    }
    size(): number {
        return this.storage.length;
    }
    empty(): void {
        this.storage = [];
    }

}


class Manager {

    // to make the manager a singleton
    private static instance: Manager;
    // Variable to stop the engines
    private globalStop: boolean = false;

    private currentSearch!: string;
    private extendedSearch: boolean = false;
    private amountRepos!: number;
    //simpleSearch applies when <1000 results (with no filter/queryLimit) are found
    public fullSearch: boolean = false;

    // sets the amount of repos to be searched per request in the GithubAgent
    private reposPerPage: number = 100;

    // List of list that contain the jobs(Batches) for each agent
    private schlachtPlan!: number[][];

    // Value to make sure that only one github Engine is running
    private githubAgentsRunning: boolean = true;
    // Github agents
    private numberGithubAgents: number = 5;
    private deadAgents: number = 0;
    // Boolean to see if citations.cff where already retreived
    private gotCitationsCff: boolean = false;

    private queryLimit!: string;

    // Value to make sure that only one literature Engine is running
    private literatureEngineRunning: boolean = false;
    // Amount of repositories, for which the zenodo search was made
    amountDoneZenodoRepo: Writable<number> = writable(0);

    // Queue with repositories to be used by zenodo Agent
    private workingRepositoriesQueue = new Queue<Repository>();

    private openAlexRepositoriesQueue = new Queue<Repository>();

    // Queue with repositories to be used by Semantic Agent
    private semanticScholarRepositoriesQueue = new Queue<Repository>();

    // because the githubAgent now handles the ids themselves, they can no longer be used to look up the respective jobLists
    // hence a quick lookup Map is generated on initialize
    private gitAgentIDs = new Map<number, number>();
    // Agents Spawned
    private githubAgents: githubAgent[] = [];
    private zenodoAgents: zenodoAgent[] = [];
    private openAlexAgents: openAlexAgent[] = [];


    /**
     * Returns the single manager instance
     * 
     * @returns the manager 
     */
    public static getInstance(): Manager {
        if (!Manager.instance) {
            Manager.instance = new Manager();
        }
        return Manager.instance;
    }

    /**
     *  Resets the manager variables
     * 
     */
    private resetManager() {
        this.setStop(false);
        this.numberGithubAgents = 5;
        this.deadAgents = 0;
        this.gotCitationsCff = false;
        this.literatureEngineRunning = false;
        this.workingRepositoriesQueue = new Queue<Repository>();
        this.amountDoneZenodoRepo.set(0);
        this.gitAgentIDs = new Map<number, number>();
        this.extendedSearch = false;
        this.queryLimit = "";
    }

    /**
     * Starts a search
     * 
     * @remarks
     * entrypoint: called by view Search.svelte
     * 
     * @param searchTerm - The search query
     * @returns null - Needed by svelte
     */
    public search(searchTerm: string, _extendedSearch: boolean = false) {
        // Search interface 
        this.resetManager();
        this.currentSearch = searchTerm;
        this.extendedSearch = _extendedSearch
        this.startGithubPeek();
        return null;
    };

    /**
     * Gets the semantic scholar citating publications for a specific repository
     * @param repo Repository
     */
    public getRepoSemanticPublications(repo: Repository) {
        // Only get the publications once
        if (!repo.gotSemanticPub) {
            let semanticScholarAgent = new SemanticScholarAgent();
            // TODO
            semanticScholarAgent.startSemanticAgent(repo);

        }
    }

    /**
    * Gets the openCitations citating publications for a specific repository
    * @param repo Repository
    */
    public getRepoOpenCitationsPublications(repo: Repository) {
        // Only get the publications once
        if (!repo.gotOpenCitationsPub) {
            let openCitationsAgent = new OpenCitationsAgent();
            openCitationsAgent.startOpenCitationSearch(repo);

        }
    }

    /**
    * Gets the datacite citating publications for a specific repository
    * @param repo Repository
    */
    public getRepoDataCitePublications(repo: Repository) {
        // Only get the publications once
        if (!repo.gotDataCitePub) {
            let newDataCiteAgent = new DataCiteAgent();
            newDataCiteAgent.startDataCiteSearch(repo);

        }
    }


    /**
     * Starts the github peek
     */
    async startGithubPeek() {
        // this.globalStop = false;
        let GithubAgent = new githubAgent();
        // When the  currentSearch is updated then start this function 
        // Code Review: Await not needed
        this.fullSearch = await GithubAgent.startPrePeek(this.currentSearch, 'in:readme,description')
        console.log('fullSearch is set to: ' + this.fullSearch)
        this.queryLimit = 'zenodo in:readme,description'
        if (this.extendedSearch)
            this.queryLimit = 'doi in:readme,description'
        if (this.fullSearch)
            this.queryLimit = 'in:readme,description'
        await GithubAgent.startPeek(this.currentSearch, this.queryLimit);
    }

    // Makes the schlachtplan (List of batches for each agent)
    /**
     * 
     * @param amountRepos - Amount of Repos from a search query
     * @param numberOfAgents - Number of agetns to be spawned
     * @param maxAmountOfRepos - Limit of amount of retreivable repos
     * @param schlachtPlan - Previously made list of joblists
     * @returns New Joblist
     */
    makeSchlachtPlan(amountRepos: number, numberOfAgents: number, maxAmountOfRepos: number, schlachtPlan?: number[][]) {
        // maxAmountRepos: Github limits the search to maximal 1000 repositories
        if (amountRepos > maxAmountOfRepos) {
            amountRepos = maxAmountOfRepos;
        }
        let todoJobs: number[] = [];
        let amountBatches: number = Math.ceil(amountRepos / 100)
        if (typeof schlachtPlan === 'undefined') {
            // Make simple interval of numbers if there is no previous schlachplan
            for (let i = 1; i <= amountBatches; i++) {
                todoJobs.push(i);
            }
        } else {
            // Divides the jobs of the schlacht Plan fairly based on the amount of agents
            // Make an array of all todo Jobs
            // https://schneidenbach.gitbooks.io/typescript-cookbook/content/functional-programming/flattening-array-of-arrays.html
            todoJobs = ([] as number[]).concat(...schlachtPlan);
        }

        if (amountBatches < numberOfAgents) {
            numberOfAgents = amountBatches;
        }
        let numberOfJobs: number = amountBatches / numberOfAgents;

        // https://stackoverflow.com/a/37826698
        let jobList: number[][] = todoJobs.reduce((resultArray: number[][], item: number, index: number) => {
            const chunkIndex = Math.floor(index / numberOfJobs);

            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = [] // start a new chunk
            }

            resultArray[chunkIndex].push(item);

            return resultArray;
        }, [])
        return jobList;
    }
    /**
     * Manage the github agents
     * 
     * @remarks
     * Ensures that all 1000 repositories are searched, even if some agents fail
     * Ensures that enough agents are working in parallel 
     */
    async githubEngine(queryExtension: string, queryLimit: string) {
        console.log("Started the github engine")
        // Create the fist Schachtplan to ensure that the length is not 0 and enter the while loop 
        this.schlachtPlan = this.makeSchlachtPlan(this.amountRepos, this.numberGithubAgents, 1000);
        // While there are jobs or the user hasn't stopped the search
        while (!this.globalStop && this.schlachtPlan.length !== 0) {
            this.deadAgents = 0;
            let searchPossible = await this.githubPingAPI();
            if (!searchPossible) {
                // Wait for 10 seconds
                await new Promise(r => setTimeout(r, 10000));
                continue;
            }
            this.githubAgentsRunning = true;
            // Redistribute the workload if needed
            this.schlachtPlan = this.makeSchlachtPlan(this.amountRepos, this.numberGithubAgents, 1000, this.schlachtPlan);
            // Ensure that there is the right amount of github agents agents
            let numberAgents: number = this.schlachtPlan.length;
            // console.log(`Number of agents ${numberAgents}`);
            // Spawn the agents
            this.spawnGithubAgents(this.schlachtPlan, queryExtension, queryLimit);
            while (this.deadAgents < numberAgents && !this.globalStop) {
                // Wait for 10 seconds
                await new Promise(r => setTimeout(r, 10000));
                // console.log("Dead agents: " + this.deadAgents);
            }
        }
        console.log("Stopped Github Engine");
        if (!this.gotCitationsCff && !this.fullSearch) {
            this.getCitationsCff();
        }

    }


    /**
     * Makes an extra search trying to get 
     * repositories with a citation.cff file
     */
    async getCitationsCff() {
        console.log("GETTING CITATION CFF")
        let tmpGithubAgent = new githubAgent();
        // Need the new amount of repos to create the joblist
        this.amountRepos = await tmpGithubAgent.getAmountRepos(this.currentSearch, 'code', 'extension:cff');
        this.gotCitationsCff = true;
        this.githubEngine('code', 'extension:cff');


    }

    /**
     * Spawns the Github Agents
     * 
     * @remarks
     * If the githubEngine is running, spawn the defined
     * amount of github engines and start the search 
     * for each agent
     * 
     * @param jobList - List of joblist (Batches to be retreived)
     */
    private async spawnGithubAgents(jobList: number[][], queryExtension: string, queryLimit: string) {
        for (let i = 0; i < jobList.length; i++) {
            if (!this.githubAgentsRunning) {
                break;
            }
            // Just give them the job list that they have to do. 
            let tmpGithubAgent = new githubAgent();
            this.githubAgents.push(tmpGithubAgent);
            this.gitAgentIDs.set(tmpGithubAgent.id, i)
            tmpGithubAgent.startSearch(this.currentSearch, jobList[i], this.reposPerPage, queryExtension, queryLimit);
        }
    }


    /**
     * Inform the manager about the status of a job
     * 
     * @remarks
     * If the job succeded remove it
     * If the job failed, the agent is considered dead
     * 
     * @param agentID - Id of the agent that runs the function
     * @param success - Sucess status of the job
     * @param jobNumber - Job number
     */
    statusGithubAgent(agentID: number, success: boolean, jobNumber: number) {
        if (!success) {
            // If there is a failure, consider the agent as dead
            this.deadAgents++;
        } else {
            // If the job is successfull remove it from the schlachtPlan
            // https://stackoverflow.com/a/5767357
            const lookupID = this.gitAgentIDs.get(agentID)
            if (lookupID != undefined) {
                const index = this.schlachtPlan[lookupID].indexOf(jobNumber);
                if (index > -1) {
                    this.schlachtPlan[lookupID].splice(index, 1);
                }
            }
        }
    }

    /**
     * Calls the rate limit endpoint of the github api
     * 
     * @remarks
     * Used to check if it is possible to make another query
     * 
     * @returns Github api rate limit
     */
    async githubPingAPI() {
        let newRateLimit: boolean = false;
        // There are 30 searches per minute

        let url = "https://api.github.com/rate_limit"
        const authToken = get(authTokenGithub).valueOf();
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'token ' + authToken
            }
        });
        const response = await res.json();
        if (response.resources.search.remaining !== 0) {
            newRateLimit = true;
        }
        return newRateLimit;
    }

    /**
     * Call the setStop function from manager
     * 
     * @remarks
     * For some reason Svelte packs this function as a function of a 
     * HTMLButtonElement which is why it doesn't change the globalStop variable
     * of Manager
     * 
     * @returns null - needed by svelte
     */
    setGlobalStop() {
        // Roundabout way is to get the Manager instance and then call the setStop function.
        // Suggestions on better solutions are welcome :)
        Manager.getInstance().setStop(true);
        return null;
    }

    /**
     * Sets the globalStop variable
     * 
     * @remarks
     * Stops and deletes all agents
     * 
     * @param value -  new value of globalStop
     * @beta
     */
    setStop(value: boolean) {
        this.globalStop = value;

        // Stop all agents
        for (const gAgent of this.githubAgents) {
            gAgent.setStop(true);
        }
        this.githubAgents = [];
        for (const zAgent of this.zenodoAgents) {
            zAgent.setStop(true);
        }
        this.zenodoAgents = [];
    }

    /**
     * Set the amount of github repositories
     * @param amountRepos - amount of github repos
     */
    repoAmountSet(amountRepos: number): void {
        this.amountRepos = amountRepos;
        console.log('amountRepos found: ' + amountRepos)
        this.githubEngine('repositories', this.queryLimit); // starts the githubEngine

    };

    /**
     * Enqueue the repository after it is added to the model 
     * 
     * @remarks
     * start the literature engine if it was not running
     * 
     * @param repoId - id of the repository
     * @param repo - repository
     */
    repoAdded(repo: Repository): void {
        // Enqueue new repo
        this.workingRepositoriesQueue.enqueue(repo);
        //this.openAlexRepositoriesQueue.enqueue(repo);

        // Only start the literature engine when the first repo is added to the queue
        if (!this.literatureEngineRunning) {
            console.log("Started literature Engine")
            this.literatureEngine();
        }

        // Do a search for every repo that is added
        // this.semanticScholar(repo);
        this.openAlex(repo);
        this.openCitations(repo);
        this.dataCite(repo);
    }


    /**
     * Starts the Zenodo agents
     * 
     * @remarks
     * Makes sure that after all agents are done, the queue is
     * empty for the next search and a new literature engine 
     * can be started
     */
    async literatureEngine() {
        this.literatureEngineRunning = true;
        // await for n seconds to let the queue have more repos (otherwise the spawning breaks)
        await new Promise(r => setTimeout(r, 5000));

        // Ugly bodge - Change this
        if (!this.gotCitationsCff) {
            this.amountDoneZenodoRepo.set(0);
        }

        console.log("Spawning the agents first time")
        // First spawn the desired amount of agents i.e 2
        //this.spawnOpenAlexAgents(1, this.openAlexRepositoriesQueue);
        this.spawnZenodoAgents(1, this.workingRepositoriesQueue);
        // While there are repositories in the queue or the user hasn't stopped the search
        while (!this.globalStop && this.workingRepositoriesQueue.size() !== 0) {
            await new Promise(r => setTimeout(r, 1000));
        }
        // After being done with the queue, make sure the queue is empty for the 
        // next search
        this.workingRepositoriesQueue.empty();
        // And that the literature engine died
        this.literatureEngineRunning = false;

        console.log('------------ Lit Engine Stopped ------------')
    }

    /**
     * Spawns the zenodo agents
     * 
     * @remarks
     * Starts the zenodo search
     * 
     * @param numberAgents - number of zenodo agents to be spawned
     * @param repositories - Queue of not searched repositories
     */
    private async spawnZenodoAgents(numberAgents: number, repositories: Queue<Repository>) {
        for (let i = 0; i < numberAgents; i++) {
            if (repositories.size() === 0) {
                console.log("Breaking spawn")
                break;
            }
            let repo = repositories.dequeue();

            // console.log("Spawning Zenodo Agent ");
            let tmpZenodoAgent = new zenodoAgent(i);
            this.zenodoAgents.push(tmpZenodoAgent);
            // The Zenodo agent receives only the repository that it needs to process and the readme
            if (repo !== undefined) {
                tmpZenodoAgent.startZenodoSearch(repo);
            }
        }

    }

    /**
     * Spawns the openAlex agents
     * 
     * @remarks
     * Starts the openALex search
     * 
     * @param numberAgents - number of openAlex agents to be spawned
     * @param repositories - Queue of not searched repositories
     */
    /* private async spawnOpenAlexAgents(numberAgents: number, repositories: Queue<Repository>) {
        for (let i = 0; i < numberAgents; i++) {
            if (repositories.size() === 0) {
                console.log("Breaking spawn")
                break;
            }
            let repo = repositories.dequeue();

            // console.log("Spawning Zenodo Agent ");
            let tmpOpenAlexAgent = new openAlexAgent(i);
            this.openAlexAgents.push(tmpOpenAlexAgent);
            // The OpenAlex agent receives only the repository that it needs to process and the readme
            if (repo !== undefined) {
                // tmpZenodoAgent.startZenodoSearch(repositoryTuple.name, repositoryTuple.readme);
                let gitURI = "github.com/" + repo.name
                tmpOpenAlexAgent.getOpenAlexCitationAmount(repo.name, gitURI);
            }
        }
    }*/

    /**
     * Status function of a zenodo agent
     * @param status - Worked or failed
     * @param repo - Repository
     * 
     * @remarks
     * If possible, spawns the next agent
     */
    async statusZenodoAgent(status: boolean, repo: Repository) {
        if (status) {
            // An agent only informs the manager when it is done with a job
            this.amountDoneZenodoRepo.update(n => n + 1);
            // Wait 1 second before spawning an agent (Max 5000 request per hour, or one every 0.72 seconds)
            await new Promise(r => setTimeout(r, 750));
        } else {
            // Enqueue the repository that didn't work
            this.workingRepositoriesQueue.enqueue(repo)
            // Wait 2 seconds if 429 status
            await new Promise(r => setTimeout(r, 2000));
        }
        // Simply when they die, spawn a new agent
        if (!this.globalStop) {
            // console.log("Agent died ----- Spawning new agent");
            this.spawnZenodoAgents(1, this.workingRepositoriesQueue);
        }
    }


    // Maybe change this to be more modular
    /**
     * Get amount of citing papers for a repo in semantic scholar
     * @param repo Repository
     */
    async semanticScholar(repo: Repository) {
        // await new Promise(r => setTimeout(r, 1000));
        let semanticScholarAgent = new SemanticScholarAgent();
        // semanticScholarAgent.startSemanticAgent(repo);
        semanticScholarAgent.getAmountCitations(repo);
    }


    // Maybe change this to be more modular
    /**
     * Get amount of citing papers for a repo in semantic scholar
     * @param repo Repository
     */
    async openAlex(repo: Repository) {
        // await new Promise(r => setTimeout(r, 1000));
        let newOpenAlexAgent = new openAlexAgent();
        // semanticScholarAgent.startSemanticAgent(repo);
        newOpenAlexAgent.getOpenAlexCitations(repo);
    }

    // Maybe change this to be more modular
    /**
     * Get amount of citing papers for a repo in openCitations
     * @param repo Repository
     */
    async openCitations(repo: Repository) {
        // await new Promise(r => setTimeout(r, 1000));
        let newOpenCitationsAgent = new OpenCitationsAgent();
        newOpenCitationsAgent.getAmountCitations(repo);
    }

    /**
     * Get amount of citing papers for a repo in dataCite
     * @param repo Repository
     */
    async dataCite(repo: Repository) {
        // await new Promise(r => setTimeout(r, 1000));
        let newDataCiteAgent = new DataCiteAgent();
        newDataCiteAgent.getAmountCitations(repo);
    }




}

export default Manager.getInstance();