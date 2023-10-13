'use strict';

import express from 'express';
import fetch from 'node-fetch';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';

const PORT = 3001;
const ROOT_URL = 'https://cms-chesheast.cloud.contensis.com/';
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('.'));
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});

// The body of the function that is used on the server and the browser.
const appBody = `
  return createSSRApp({
    data: () => ({ length: 0, items: items }),
    methods: {
      printLen: function () {
        console.log(this.items.length);
      },
    },
    mounted() {
      this.length = this.items.length;
      this.printLen();
    },
    template:
    '<ul v-show="items"><li v-for="item in items">{{item.entryTitle}}</li></ul>',
  });
`;

// Create a string version to send to the client.
const clientApp = `function createApp(items) {${appBody}}`;
// Create a function to use on the server.
const createApp = new Function('items, createSSRApp', appBody);

async function sendHtml(res) {
  const resp = await fetch(
    `${ROOT_URL}/api/delivery/projects/website/contenttypes/rangerEvents/entries?accessToken=QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I`,
    { method: 'get' }
  );
  const data = await resp.json();
  const app = createApp(data.items, createSSRApp);
  renderToString(app).then((html) => {
    res.render('index', { html, clientApp, items: JSON.stringify(data.items) });
  });
}

app.get('/', (_, res) => {
  sendHtml(res);
});
