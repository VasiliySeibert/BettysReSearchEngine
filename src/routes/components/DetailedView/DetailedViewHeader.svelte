<script lang="ts">
  import type { Repository } from "$lib/types/githubResults.type";

  export let repository: Repository;
</script>

<div class="flex justify-between">
  <img
    class="m-8 object-scale-down h-24 w-48"
    src="/images/TUC_Logo.png"
    alt="TUC Logo"
  />
  <p class="text-4xl m-16">{repository.name}</p>
  <img
    class="m-8 object-scale-down h-24 w-48 ..."
    src="/images/NFDI4Ing_Logo.png"
    alt="NFDI Logo"
  />
</div>
