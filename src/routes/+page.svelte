<script lang="ts">
    import {page_shown} from './ViewController';
    import Search from './components/Search.svelte';
    import DetailedView from './components/DetailedView/DetailedView.svelte';
    import Info from './components/Info.svelte';
    import Modal from 'svelte-simple-modal';
    import { modalStore } from './ViewController';
</script>

<Modal show={$modalStore}
    styleWindow={{ width: '80rem' }}
>

    {#if $page_shown == "/"}
        <Search />
    {/if}

    {#if $page_shown == "Search"}
        <Search />
    {/if}

    {#if $page_shown == "DetailedView"}
        <DetailedView />
    {/if}

    {#if $page_shown == "info"}
        <Info />
    {/if}

</Modal>
