<script lang="ts">
    import { authTokenGithub } from "$lib/stores/githubResults.store";
    import { authTokenZenodo } from "$lib/stores/githubResults.store";
    import {
        authTokenOpenCitations,
        setOpenCitationsAuthToken,
    } from "$lib/stores/authTokens.store";
    import { onMount } from "svelte";

    let githubAuthTokenToBeSaved: string;
    let zenodoAuthTokenToBeSaved: string;
    let openCitationsAuthTokenToBeSaved: string;

    function saveGithubAuthToken() {
        if (githubAuthTokenToBeSaved == "") {
            alert("Please enter authentication in first!");
            return false;
        }
        alert("Your authentication has been saved!");
        $authTokenGithub = githubAuthTokenToBeSaved;
        return true;
    }

    function saveZenodoAuthToken() {
        if (zenodoAuthTokenToBeSaved == "") {
            alert("Please enter authentication in first!");
            return false;
        }
        alert("Your authentication has been saved!");
        $authTokenZenodo = zenodoAuthTokenToBeSaved;
        return true;
    }

    function saveOpenCitationsAuthToken() {
        if (openCitationsAuthTokenToBeSaved == "") {
            alert("No authentication was given");
        } else {
            alert("Your authentication has been saved!");
        }
        setOpenCitationsAuthToken(openCitationsAuthTokenToBeSaved);
        return true;
    }

    onMount(() => {
        githubAuthTokenToBeSaved = $authTokenGithub;
        zenodoAuthTokenToBeSaved = $authTokenZenodo;
        openCitationsAuthTokenToBeSaved = authTokenOpenCitations;
    });
</script>

<h2 class="flex justify-center">Manage Access Tokens</h2>
<div class="ml-20">
    <label
        for="helper-text"
        class="block mb-2 text-sm font-medium text-black-900 dark:text-black-300"
        >Github token:</label
    >
    <form
        class="flex space-x-12"
        on:submit|preventDefault={saveGithubAuthToken}
    >
        <img
            class="m-0 object-scale-down h-12 w-12"
            src="/images/GitHub-Mark.png"
            alt="TUC Logo"
        />

        <input
            type="password"
            id="auth-text-github"
            aria-describedby="helper-text-explanation"
            class="bg-gray-50 border border-gray-300 text-black-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-3/4 p-2.5   dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
            bind:value={githubAuthTokenToBeSaved}
        />
        <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
            Save
        </button>
    </form>
    <p
        id="helper-text-explanation"
        class="mt-2 text-sm text-gray-500 dark:text-gray-400"
    >
        Please set your GitHub token so you can start your search. For more
        details refer to the <a
            href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"
            class="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >instructions</a
        >.
    </p>
</div>

<div class="ml-20">
    <label
        for="helper-text"
        class="block mt-8 mb-2 text-sm font-medium text-black-900 dark:text-black-300"
        >Zenodo token:</label
    >
    <form
        class="flex space-x-12"
        on:submit|preventDefault={saveZenodoAuthToken}
    >
        <img
            class="m-0 object-scale-down h-12 w-12"
            src="/images/zenodo-gradient-2500.png"
            alt="TUC Logo"
        />

        <input
            type="password"
            id="auth-text-zenodo"
            aria-describedby="helper-text-explanation"
            class="bg-gray-50 border border-gray-300 text-black-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-3/4 p-2.5   dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
            bind:value={zenodoAuthTokenToBeSaved}
        />
        <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
            Save
        </button>
    </form>
    <p
        id="helper-text-explanation"
        class="mt-2 text-sm text-gray-500 dark:text-gray-400"
    >
        Please set your Zenodo token so you can start your search. For more
        details refer to the <a
            href="https://developers.zenodo.org/#authentication"
            class="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >instructions</a
        >.
    </p>
</div>

<div class="ml-20">
    <label
        for="helper-text"
        class="block mt-8 mb-2 text-sm font-medium text-black-900 dark:text-black-300"
        >Open Citations token:</label
    >
    <form
        class="flex space-x-12"
        on:submit|preventDefault={saveOpenCitationsAuthToken}
    >
        <img
            class="m-0 object-scale-down h-12 w-12"
            src="/images/openCitations_logo.png"
            alt="Open Citations Logo"
        />

        <input
            type="password"
            id="auth-text-openCitations"
            aria-describedby="helper-text-explanation"
            class="bg-gray-50 border border-gray-300 text-black-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-3/4 p-2.5   dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
            bind:value={openCitationsAuthTokenToBeSaved}
        />
        <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
            Save
        </button>
    </form>
    <p
        id="helper-text-explanation"
        class="mt-2 text-sm text-gray-500 dark:text-gray-400"
    >
        Please set your Open Citations token so you can start your search. For
        more details refer to the <a
            href="https://opencitations.net/accesstoken"
            class="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >instructions</a
        >.
    </p>
</div>
