<script lang="ts">
  import type { Repository } from "$lib/types/githubResults.type";
  import { marked } from "marked";

  export let repository: Repository;

  const renderer = new marked.Renderer();
  const linkRenderer = renderer.link;
  // render links with target="_blank" to open them in a new tab
  // https://github.com/markedjs/marked/issues/655#issuecomment-383226346
  renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" rel="noreferrer" ');
  }
</script>

<div
  class="visible break-all bg-gray-100 overflow-hidden object-contain rounded-lg border-solid border-4 w-full h-full"
>
  <p class="base text-gray-900 font-serif m-8 ">
    {@html marked(repository.readme, { renderer: renderer })}
  </p>
</div>
