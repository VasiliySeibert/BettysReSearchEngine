import { get, writable } from 'svelte/store';

import type { Search, Repository, Publication } from '$lib/types/githubResults.type';
import Manager from '$lib/controller/Manager';
import { browser } from '$app/environment';

let newMap = new Map<string, Repository>();
// newMap.set('owner/repoName', {
//     'name': 'owner/repoName',
//     'url': 'urlVal',
//     'stars': 43,
//     'forks': 44,
//     'readme': "22",
//     'createdAt': new Date('2015-11-09'),
//     'updatedAt': new Date('2015-11-09'),
//     'language': 'python',
//     'homepage': '/./home/',
//     'mainPaper': undefined,
//     'publications': [{
//         'doi': 'doiVal',
//         'name': 'nameVal',
//         'source': 'sourceVal',
//         'authorNames': ['author1'],
//         'externalIds': undefined,
//         'abstract': undefined,
//         'venue': undefined,
//         'year': undefined,
//         'referenceCount': undefined,
//         'citationCount': undefined,
//         'fieldsOfStudy': undefined,
//         'publicationTypes': undefined,
//         'publicationDate': undefined,
//         'journal': undefined,
//         'url': undefined
//     }],
//     'amountPublications': new Map<string, number>(),
//     'semanticPaperId': undefined,
//     gotSemanticPub: false,
//     gotZenodoPub: false,
//     gotOpenCitationsPub: false
// });

let startValue: Search = {    //TODO remove // this is an example value, used to fill the store with upon creation. It serves debugging purposes only
    'query': 'startDebugQuery',
    'totalRepos': 42,
    'repositories': newMap
}
startValue = {
    query: '',
    totalRepos: 0,
    repositories: newMap
}


function resetProgrammingLanguages() {
    programmingLanguages = [[], []]
}

function addProgrammingLanguage(newEntry: string) {
    let hit = false
    for (var i = 0; i < programmingLanguages[0].length; i++) {
        if (newEntry === programmingLanguages[0][i]) {
            programmingLanguages[1][i]++
            hit = true
        }
    }
    if (hit === false) {
        programmingLanguages[0].push(newEntry)
        programmingLanguages[1].push(1)
    }


}

export let programmingLanguages: [string[], number[]] = [[], []]

export function get_programmingLanguages() {
    return programmingLanguages;
}






export const githubResults = createGithubResults(); // export the githubResults store of type Search



export const authTokenGithub = writable(browser && localStorage.getItem("authTokenGithub") || "");
authTokenGithub.subscribe((val) => browser && localStorage.setItem("authTokenGithub", val))

export const authTokenZenodo = writable(browser && localStorage.getItem("authTokenZenodo") || "");
authTokenZenodo.subscribe((val) => browser && localStorage.setItem("authTokenZenodo", val))


// define properties and methods of the githubResults store
function createGithubResults() {
    const { subscribe, update, set } = writable<Search>(startValue); // TODO remove initial value, as it serves debugging purposes only

    return {
        subscribe,
        set,
        get,
        setSearch: (search: Search) => set(_setSearch(search)), // overwrite store // set search with query and totalRepos
        addRepo: (repo: Repository) => update(current => _addRepo(current, repo)), // add single repo to store
        addPublication: (repoName: string, pub: Publication) => update(current => _addPublication(current, repoName, pub)), // add publication to existing repo, identified by its index
        setAmountPublications: (repoName: string, publicationSource: string, amount: number) => update(current => _setAmountPublications(current, repoName, publicationSource, amount)),
        setSemanticPaperID: (repoName: string, paperId: string) => update(current => _setSemanticPaperID(current, repoName, paperId)),
        updateRepo: (repo: Repository) => update(current => _updateRepo(current, repo)), // update single repo from store
    };
}

function _setSearch(search: Search) {
    Manager.repoAmountSet(search.totalRepos) // inform manager about total amount of repos
    resetProgrammingLanguages()
    return search
}

function _addRepo(current: Search, repo: Repository) {
    if (!current.repositories.has(repo.name)) //check existing repos
        current.repositories.set(repo.name, repo); // add repo
    addProgrammingLanguage(repo.language)
    Manager.repoAdded(repo) // inform manager about added Repo 
    return current // update store
}

function _addPublication(current: Search, repoName: string, pub: Publication) {
    let tempRepo = current.repositories.get(repoName);
    if (tempRepo !== undefined) {
        //tempRepo.publications = [...tempRepo.publications, pub]; // add publication
        tempRepo.publications = _pubAddHandler(current, tempRepo, pub)
        // Check the publication source
        if (pub.source === "Sematic Scholar") {
            tempRepo.gotSemanticPub = true;
        } else if (pub.source === "Open Citations") {
            tempRepo.gotOpenCitationsPub = true;
        } else if (pub.source === "Data Cite") {
            tempRepo.gotDataCitePub = true;
        }
        current.repositories.set(repoName, tempRepo);
    }
    // Manager.publicationAdded(repoIdx, pubIdx, pub) // TODO inform manager about added Publication // is this even used yet? -rwe
    return current // update store
}

function _setAmountPublications(current: Search, repoName: string, publicationSource: string, amount: number) {
    let tempRepo = current.repositories.get(repoName);
    if (tempRepo !== undefined) {
        tempRepo.amountPublications.set(publicationSource, amount);
    }
    return current // update store

}

function _setSemanticPaperID(current: Search, repoName: string, paperId: string) {
    let tempRepo = current.repositories.get(repoName);
    if (tempRepo !== undefined) {
        tempRepo.semanticPaperId = paperId;
    }
    return current // update store

}

function _updateRepo(current: Search, repo: Repository) {
    if (current.repositories.has(repo.name)) //check if repo exist
        current.repositories.set(repo.name, repo); // add repo
    return current // update store
}


function _pubAddHandler(current: Search, tempRepo: Repository, pub: Publication) {
    // null check für repo nicht nötig wird schon vorher gemacht
    for (let p of tempRepo.publications) {
        // have to trim the names for whitespaces, because they use different spaces
        if (p.name.replace(/\W/g, '') === pub.name.replace(/\W/g, '') || p.doi === pub.doi) {
            // if found the duplicates will now be merged
            let mergedPub = _mergeDuplicatePublications(p, pub)
            // find right publication and change
            let idx = tempRepo.publications.indexOf(p)
            tempRepo.publications[idx] = mergedPub
            return tempRepo.publications
        }
    }
    tempRepo.publications = [...tempRepo.publications, pub];
    return tempRepo.publications;
}

function _mergeDuplicatePublications(storePub: Publication, toAddPub: Publication) {

    const definedProps = obj => Object.fromEntries(
        Object.entries(obj).filter(([k, v]) => v !== undefined)
    );

    //let mergedPub = {...storePub, ... toAddPub}
    //let mergedPub = Object.assign({}, storePub, toAddPub);
    let mergedPub = Object.assign({}, storePub, definedProps(toAddPub));
    return mergedPub
}

