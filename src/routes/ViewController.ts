import { writable, type Writable } from 'svelte/store';


export const page_shown: Writable<string> = writable('/');
export const searchTerm: Writable<string> = writable("");
export const extendedSearch: Writable<boolean> = writable(false);

export const modalStore = writable(null);
export const windowStyle = writable({});
