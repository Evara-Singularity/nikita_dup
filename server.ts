import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

import * as compression from 'compression'
import { RESPONSE } from '@nguniversal/express-engine/tokens';

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
      providers: [
        { provide: APP_BASE_HREF, useValue: req.baseUrl },
        { provide: RESPONSE, useValue: (res) }
      ]
    }, (err: Error, html: string) => {
      // manipulate html string to add preloads for images
      if(html){
        res.status(html ? res.statusCode : 500).send(appendImagePreloads(html) || err.message);
      }else{
        res.status(500).send(err.message || `<h1>Something went wrong.</h1>${req.url}`);
      }
    });
  });

  return server;
}

function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }
  // fallback to standard filter function
  return compression.filter(req, res)
}

function appendImagePreloads(indexHtml) {
  const regexImage = /<img.*?src=".*?"/g
  const regexImageSrc = /src=".*?"/g
  // maxLimit is to make sure only images coming in first view ports are being preloaded.
  const maxLimit = 10;
  let urls = [];
  if (indexHtml.match(regexImage)) {
    urls = indexHtml.match(regexImage).map((val, index) => {
      // extract image URL from extacted img tags
      if ((val.match(regexImageSrc) || val.match(regexImageSrc).length > 0) && index < maxLimit) {
      // if ((val.match(regexImageSrc) || val.match(regexImageSrc).length > 0)) {
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
  const replaceStringInIndex = '<!-- INSERT DYNAMIC IMAGES PRELOAD DURING SSR SERVE HERE -->';
  const headStartingTagIdx = indexHtml.indexOf(replaceStringInIndex);
  const headPart = indexHtml.slice(0, headStartingTagIdx + replaceStringInIndex.length);
  const bodyPart = indexHtml.slice(headStartingTagIdx + replaceStringInIndex.length);

  let newIndexHtml = `
      ${headPart}
      ${allImagePreloadLink}
      ${bodyPart}
  `;

  newIndexHtml = newIndexHtml.split("ng-transition").join('data-ng-transition'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc58").join('data-_ngcontent-sc58');
  newIndexHtml = newIndexHtml.split("_ngcontent-sc66").join('data-_ngcontent-sc66');
  newIndexHtml = newIndexHtml.split("_ngcontent-sc67").join('data-_ngcontent-sc67'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc68").join('data-_ngcontent-sc68'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc69").join('data-_ngcontent-sc69'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc70").join('data-_ngcontent-sc70'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc71").join('data-_ngcontent-sc71'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc72").join('data-_ngcontent-sc72'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc73").join('data-_ngcontent-sc73'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc75").join('data-_ngcontent-sc75'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc76").join('data-_ngcontent-sc76'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc91").join('data-_ngcontent-sc91'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc24").join('data-_ngcontent-sc24'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc26").join('data-_ngcontent-sc26'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc27").join('data-_ngcontent-sc27'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc59").join('data-_ngcontent-sc59'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc62").join('data-_ngcontent-sc62'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc63").join('data-_ngcontent-sc63');
  newIndexHtml = newIndexHtml.split("_ngcontent-sc64").join('data-_ngcontent-sc64');
  newIndexHtml = newIndexHtml.split("_ngcontent-sc65").join('data-_ngcontent-sc65'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc28").join('data-_ngcontent-sc28'); 
  newIndexHtml = newIndexHtml.split("::ng-deep").join(''); 
  newIndexHtml = newIndexHtml.split(";column-count:#343434").join(''); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc103").join('data-_ngcontent-sc103'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc96").join('data-_ngcontent-sc96'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc20").join('data-_ngcontent-sc20'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc80").join('data-_ngcontent-sc80'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc90").join('data-_ngcontent-sc90'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc83").join('data-_ngcontent-sc83'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc88").join('data-_ngcontent-sc88'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc86").join('data-_ngcontent-sc86'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc81").join('data-_ngcontent-sc81');
  newIndexHtml = newIndexHtml.split("_ngcontent-sc77").join('data-_ngcontent-sc77'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc78").join('data-_ngcontent-sc78'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc79").join('data-_ngcontent-sc79'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc82").join('data-_ngcontent-sc82'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc85").join('data-_ngcontent-sc85'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc87").join('data-_ngcontent-sc87'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc89").join('data-_ngcontent-sc89'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc92").join('data-_ngcontent-sc92'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc96").join('data-_ngcontent-sc96'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc100").join('data-_ngcontent-sc100'); 
  newIndexHtml = newIndexHtml.split("_ngcontent-sc101").join('data-_ngcontent-sc101'); 
  newIndexHtml = newIndexHtml.split("ng-reflect-target").join('data-ng-reflect-target'); 
  newIndexHtml = newIndexHtml.split("ng-reflect-router-link").join('data-reflect-router-link'); 
  
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
