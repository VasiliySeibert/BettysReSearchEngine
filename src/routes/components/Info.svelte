<div class="flex flex-col sm:flex-row  items-center justify-between">
  <img class="m-0 sm:m-8 object-scale-down h-24 w-48" src="/images/TUC_Logo.png" alt='TUC Logo'/>
  <img class="m-0 sm:m-8 object-scale-down h-24 w-48 ..." src="/images/NFDI4Ing_Logo.png" alt='NFDI Logo'/>
</div>

<div class="flex justify-center m-8 text-red-400"> 
  <h2>Please Note: This Application is currently in development. Changes will happen on a regular basis. Want to give Feedback? - We're looking forward to it! Please refer to this E-Mail Adress : feedback.bettys.researchengine@gmail.com</h2>
</div>

<div class="flex justify-center"> <h2>Betty’s (Re)Search Engine: A client-based search engine for research software stored in repositories.</h2> </div>
  
<div class='m-8'>
<p>The findability, accessibility, interoperability and reusability (FAIR [1]) of research software often depends on the will of researchers and scientists to publish the result of their work that goes beyond the written explanation (such as found in papers, articles, technical reports etc.) and referencing that result accordingly. Promoting a novel approach or an improvement of an existing method, without providing the source code that was used to perform the research, means a greater effort for every researcher down the stream that wants to utilize the described research software. Services like Papers With Code [2] acknowledge the described problem and address it by requiring a valid link to a corresponding repository that goes with every publication on the platform. However, the process of finding research software for a specific purpose is in itself inefficient. One must look through a publication before being able to hope for a corresponding link to a repository where the research software is then stored. The described way of searching also does not allow applying preferences (e.g., only searching for research software written in Python).</p>
</div>  

  <div class="flex justify-center mt-8"> <h2>Therefore, we present:</h2></div>

  <div class='m-8'>
  <p>Betty’s (Re)Search Engine, a novel approach of searching and sorting research software directly. In a cascading search the tool first finds a number of GitHub repositories that correspond to a given search query. Then, in a second step, it tries to find papers, articles, data instances etc. on platforms like Zenodo [3], SemanticScholar [4] or the Open Research Knowledge Graph [5] that are linked to a repository in the result list. If a matching publication exists, we then check for the number of citations that publication collected over time. This additional meta information about the repositories lets us then sort them according to their number of citations.</p>
</div>

  <div class="flex justify-center m-8"> <img class="m-8 ..." src="/images/general_process.png" alt='NFDI Logo'/></div>

  <div class='m-8'>
  <p>The result of this process is a list of repositories for a search query, sorted by their relevance in research. One key attribute of Betty’s (Re)Search Engine is that it is solely written in languages that can run in the Browser. Therefore, a classic frontend — backend approach is not required. The user effectively utilizes different APIs by himself, through our tool, by supplying his own credentials and consequently having to watch out for rate limitations by himself. This gives the user the maximum amount of privacy that is possible by using the selected APIs. We plan to put Betty’s (Re)Search Engine online by the end of 2022 under a NFDI4Ing (“nationale Forschungsdateninfrastruktur für die Ingenieurwissenschaften”) Domain.</p>
</div>

  <div class='m-8'>
  <p>Further work will deal with extending Betty’s (Re)Search Engine’s functionality by supporting more services and databases that the user could then simply plug in to the existing tool. So that users that have access to paid services (e.g., IEEE Xplore [5]) or platforms with restricted access (e.g., university’s or company's internal GitLab) can utilize the cascading search even more broadly. We believe that by enabling users to utilize this novel approach of searching for research software, we make research software stored on GitHub/ GitLab repositories more FAIR. And by that, saving our users valuable time.</p>
</div>

<div class="flex justify-center m-8"> <img class="m-8 ..." src="/images/general_process_outlook.png" alt='NFDI Logo'/></div>
<div class='m-8'>
  <p>Its possible to export the whole searchresult as a CSV-File. To make it easier handling this data we provide the Entities of a search. Repositories will be the Rows in this CSV File. The Corresponding Mainpaper and Publications are stored as stringified JSON inside the same row.</p>
  <h2>Datatypes</h2>
  <div style="display: flex; align-items: flex-start; justify-content: flex-start; margin-top: 10px; gap: 30px; flex-wrap: wrap">
    <div style="border-radius: 10px; padding:15px">
      <h4 style="margin: 0px">interface Repository</h4>
      <div style="display: flex; flex-direction: column; align-items: flex-start; padding-left: 15px; ">
        <p>        name: string </p>
        <p>        url: string </p>
        <p>        stars: number </p>
        <p>        forks: number </p>
        <p>        readme: string </p>
        <p>        publications: Publication[] </p>
        <p>        createdAt: Date </p>
        <p>        updatedAt: Date </p>
        <p>        language: string </p>
        <p>        homepage: string </p>
        <p>        mainPaper: MainPaper | undefined </p>
        <p>        amountPublications: Map : [string, number] </p>
        <p>        semanticPaperId: string | undefined </p>
        <p>        gotSemanticPub: boolean </p>
        <p>        gotZenodoPub: boolean </p>
        <p>        gotOpenCitationsPub: boolean </p>
        <p>        gotDataCitePub: boolean </p>
      </div>
    </div>

    <div style="border-radius: 10px; padding: 15px">
      <h4 style="margin: 0px">interface Publication</h4>
      <div style="display: flex; flex-direction: column; align-items: flex-start; padding-left: 30px; ">
        <p> doi: string </p>
        <p> name: string </p>
        <p> source: string </p>
        <p> authorNames: string[] </p>
        <p> externalIds: {"{}"} | undefined </p>
        <p> abstract: string | undefined </p>
        <p> venue: string | undefined </p>
        <p> year: number | undefined </p>
        <p> referenceCount: number | undefined </p>
        <p> citationCount: number | undefined </p>
        <p> fieldsOfStudy: string[] | undefined </p>
        <p> publicationTypes: string[] | undefined </p>
        <p> publicationDate: Date | undefined </p>
        <p> journal: {"{}"} | undefined | string </p>
        <p> url: string[] | undefined </p>
      </div>
    </div>

    <div style="border-radius: 10px; padding: 15px">
      <h4 style="margin: 0px">interface MainPaper</h4>
      <div style="display: flex; flex-direction: column; align-items: flex-start; padding-left: 30px; ">
        <p>doi: string </p>
        <p>title: string </p>
        <p>journal: string </p>
        <p>dateReleased: Date </p>
        <p>abstract: string </p>
        <p>citationsArray: Array[String] | undefined </p>
      </div>
    </div>
  </div>


</div>
<div class='m-8'>
  <p>[1] M. Wilkinson et al., "The FAIR Guiding Principles for scientific data management and stewardship", Scientific Data, vol. 3, no. 1, 2016. Available: 10.1038/sdata.2016.18 [Accessed 19 August 2022].</p>
  <p>[2] "Papers with Code - The latest in Machine Learning", Paperswithcode.com, 2022. [Online]. Available: https://paperswithcode.com/ ↗. [Accessed: 19- Aug- 2022].</p>
  <p>[3] "Zenodo - Research. Shared.", Zenodo.org, 2022. [Online]. Available: https://zenodo.org/ ↗. [Accessed: 19- Aug- 2022].</p>
  <p>[4] "Semantic Scholar – AI Powered Research Tool", semanticscholar.org, 2022. [Online]. Available: https://www.semanticscholar.org/ ↗. [Accessed: 19- Aug- 2022].</p>
  <p>[5] "IEEE XPLORE", ieeexplore.ieee.org, 2022. [Online]. Available: https://ieeexplore.ieee.org/Xplore/home.jsp ↗ [Accessed: 19- Aug- 2022].</p>
</div>

