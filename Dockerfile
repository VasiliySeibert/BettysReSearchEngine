FROM node:lts-alpine

ENV PORT 3000
EXPOSE 3000

WORKDIR /root/nfdi4ing-svelte
COPY . /root/nfdi4ing-svelte
RUN npm install
RUN npm run build

CMD [ "node", "./build" ]
