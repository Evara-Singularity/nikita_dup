import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

import * as compression from 'compression'

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
    inlineCriticalCss: true,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // TODO: implement data requests securely
  server.get('/api/**', (req, res) => {
    res.status(404).send('data requests are not yet supported');
  });

  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }]
    }, (err: Error, html: string) => {
      res.status(html ? 200 : 500).send(appendImagePreloads(html) || err.message);
    });
  });

  return server;
}

function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }
  // console.log('shouldCompress', 'called');
  // fallback to standard filter function
  return compression.filter(req, res)
}

function appendImagePreloads(indexHtml) {
  const regexImage = /<img.*?src=".*?"/g
  const regexImageSrc = /src=".*?"/g
  // console.log("indexHtml.match(regexImage) ==>", indexHtml.match(regexImage));
  let urls = [];
  if (indexHtml.match(regexImage)) {
    urls = indexHtml.match(regexImage).map((val) => {
      // extract image URL from extacted img tags
      // console.log("val.match(regexImageSrc).length ==>", val.match(regexImageSrc));
      if (val.match(regexImageSrc) || val.match(regexImageSrc).length > 0) {
        return `<link rel="preload" as="image" href="${val.match(regexImageSrc)[0].replace('src="', '').replace('"', '')}">
        `;
      } else {
        return "";
      }
    })
  } else {
    return indexHtml
  }

  const allImagePreloadLink = urls.join('')

  const headStartingTagIdx = indexHtml.indexOf('<head>');
  const headPart = indexHtml.slice(0, headStartingTagIdx + 6);
  const bodyPart = indexHtml.slice(headStartingTagIdx + 6);

  const newIndexHtml = `
      ${headPart}
      ${allImagePreloadLink}
      ${bodyPart}
  `;
  return newIndexHtml;
}

function run() {
  const port = process.env.PORT || 5000;

  // Start up the Node server
  const server = app();
  server.use(compression({ filter: shouldCompress }))
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}


// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
