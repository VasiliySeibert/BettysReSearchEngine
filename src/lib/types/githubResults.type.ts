export interface Search {
    query: string,
    totalRepos: number
    repositories: Map<string, Repository>
}

export interface Repository {
    name: string,
    url: string,
    stars: number,
    forks: number,
    readme: string,
    publications: Publication[],
    createdAt: Date,
    updatedAt: Date,
    language: string,
    homepage: string,
    mainPaper: MainPaper | undefined,
    amountPublications: Map<string, number>,
    semanticPaperId: string | undefined,
    gotSemanticPub: boolean,
    gotOpenCitationsPub: boolean,
    gotDataCitePub: boolean,
    agentQueryTerm: AgentQueryTerm
}

export interface Publication {
    doi: string,
    name: string,
    source: string,
    authorNames: string[],
    externalIds: {} | undefined,
    abstract: string | undefined,
    venue: string | undefined,
    year: number | undefined,
    referenceCount: number | undefined,
    citationCount: number | undefined,
    fieldsOfStudy: string[] | undefined,
    publicationTypes: string[] | undefined,
    publicationDate: Date | undefined,
    journal: {} | undefined | string,
    url: string[] | undefined
}

export interface MainPaper {
    doi: string,
    title: string,
    journal: string,
    // authorNames: string[], // This is commented because the authors are objects
    dateReleased: Date,
    abstract: string,
    citationsArray: Array<String> | undefined
}

export interface AgentQueryTerm {
    zenodo: string,
    openAlex: string,
    openCitations: string,
    semanticScholar: string,
    dataCite: string
}