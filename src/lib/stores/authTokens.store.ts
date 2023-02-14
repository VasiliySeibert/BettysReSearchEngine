import { browser } from '$app/environment';
export let authTokenOpenCitations = browser && localStorage.getItem("authTokenOpenCitation") || "";
export function setOpenCitationsAuthToken(token: string) {
    authTokenOpenCitations = token;
    localStorage.setItem("authTokenOpenCitation", authTokenOpenCitations);
}