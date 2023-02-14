## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Deployment
The code is automatically built and deployed on a tu VM (http://nfdi4ing.rz-housing.tu-clausthal.de) after every commit on the main/develop branch via a gitlab pipeline. The pipeline can also be triggered manually via `CI/CD -> Pipelines` where the status of the pipeline is also displayed and completed builds (artifacts) can be downloaded.  
The pipeline is defined in the `.gitlab-ci.yml` and is executed directly on the VM via a gitlab runner. This runner is configured in `Settings -> CI/CD -> Runners`.  
The runner will get the latest code committed to main/develop, build it, kill the previous server and start a new, updated server on port 80/3000.

### Port Allocation:  
Port 80: Main Build Docker Container  
Port 3000: Develop Build Docker Container (accessible via VPN only)  
Port 443: Apache Proxy redirecting internally to Port 80  

Useful commands when debugging issues with the CI/CD:
- `docker ps` - list docker containers


### Manual Deployment
If deploying manually be aware that the CI/CD might interfere with your deployment. I.e. it will fail if the port is already in use. Thus you should avoid deploying manually, though it could still be useful when wanting to see debugging info within a screen session.
Knowing why you should not deploy manually, here are the steps regardless:  

1. connect to the server `root@nfdi4ing.rz-housing.tu-clausthal.de` using the respective private key. e.g. `ssh root@nfdi4ing.rz-housing.tu-clausthal.de -i ~/.ssh/nfdi4ing.rz-housing.tu-clausthal.de-key`    
1. `screen -r nfdi4ing-svelte` try to reattach screen session (if any) and exit the already running server
1. `cd /root/nfdi4ing-svelte`  
1. `git checkout <the-branch-you-want-to-publish>` e.g. `develop`  
1. `git pull`  
1. `npm install`  
1. `npm run build`  build the project in the ./build directory  
1. `screen -S nfdi4ing-svelte`  start a named screen session (only do so if you are not already in a screen session)  
1. `PORT=3000 node build`  run the project inside the screen session  
1. `ctrl+a, ctrl+d` detach the screen session (server keeps running in the background)  

### Further notes on deployment

- check for availability under http://nfdi4ing.rz-housing.tu-clausthal.de or http://nfdi4ing.rz-housing.tu-clausthal.de:3000
- 80 and 443 are globally available
- port 3000 are available for VPN connections only
- ssh key can be found in the Taiga wiki
- if you want to publish multiple versions at the same time (e.g. main on Port 80 and develop on port 3000), make sure to use different ports and differently named screen sessions and be aware of possible conflicts with the pipeline, especially when manually starting a server on port 80 as root.
