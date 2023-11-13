import 'zone.js/dist/zone-node';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as fs from 'fs';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

import * as compression from 'compression'
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import CONSTANTS from '@app/config/constants';
import { environment } from 'environments/environment';

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
    // providers: [
    //   {
    //     provide: CONSTANTS.LOG_TOKEN,
    //     useValue: 'DUMMYLOG_TOKEN',
    //   },
    // ],
    // inlineCriticalCss: true,
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
    const logUuid = uuidv4();
    const requestLogObj = { logId: logUuid, baseUrl: req.baseUrl, body: req.body, cookies: req.cookies, method: req.method, originalUrl: req.originalUrl, params: req.params, path: req.path, query: req.query, startTime: new Date().getTime(), startTimeV2: (new Date).toLocaleString('en-GB'), endTime: null, endTimeV2: null, processTime: 0 }; 
    res.render(indexHtml, {
      req,
      providers: [
        { provide: APP_BASE_HREF, useValue: req.baseUrl },
        { provide: RESPONSE, useValue: (res) },
        { provide: CONSTANTS.LOG_TOKEN_SERVER, useValue: logUuid }
      ]
    }, (err: Error, html: string) => {
      // manipulate html string to add preloads for images
      requestLogObj.endTime = new Date().getTime(),
      requestLogObj.endTimeV2 = (new Date).toLocaleString('en-GB'),
      requestLogObj.processTime = requestLogObj.endTime - requestLogObj.startTime;
      // console.log('PageLoadTimeLog :', requestLogObj); 
      writeLog(requestLogObj)
      if(html){
        res.status(html ? res.statusCode : 500).send(appendImagePreloads(html,requestLogObj['originalUrl']) || err.message);
      }else{
        res.status(500).send(err.message || `<h1>Something went wrong.</h1>${req.url}`);
      }
    });
  });

  return server;
}

function writeLog(log) {
  console.log('log', log);
  // fs.appendFile(environment.LOG_FILE_PATH + 'pageLoadtimeLog.log', `${JSON.stringify(log)}\n`, function (err) {
  //   if (err) {
  //     console.log('PageLoadTimeLog', err);
  //     // console.log(err);
  //   }
  // });
}

function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }
  // fallback to standard filter function
  return compression.filter(req, res)
}

function appendImagePreloads(indexHtml, url) {
  const regexImage = /<img.*?src=".*?"/g
  const regexImageSrc = /src=".*?"/g
  // maxLimit is to make sure only images coming in first view ports are being preloaded.
  const maxLimit = 10;
  let urls = [];
  if (indexHtml.match(regexImage)) {
    urls = indexHtml.match(regexImage).map((val, index) => {
      // extract image URL from extacted img tags
      if ((val.match(regexImageSrc) || val.match(regexImageSrc).length > 0) && index < maxLimit && (url.includes('/mp/') && val.includes('xlarge') || !url.includes('/mp/'))) {
        return `<link rel="preload" importance="high" as="image" href="${val.match(regexImageSrc)[0].replace('src="', '').replace('"', '')}">
        `;
      } else {
        return "";
      }
    })
  } else {
    return indexHtml
  }
  urls.unshift('<link rel="preconnect" href="https://www.cdn.moglix.com">');
  urls.push('<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>');
  urls.push('<link rel="preconnect" href="https://www.google-analytics.com" crossorigin>');
  urls.push('<link rel="preconnect" href="https://img.youtube.com" crossorigin>');
  urls.push('<link rel="preconnect" href="https://dynamic.criteo.com" crossorigin>');
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

  newIndexHtml = newIndexHtml.split(";column-count:#343434").join(''); 
  newIndexHtml = newIndexHtml.split("ng-transition").join('data-ng-transition'); 
  newIndexHtml = newIndexHtml.split("ng-reflect").join('data-ng-reflect'); 
  newIndexHtml = newIndexHtml.split("_ngcontent").join('data-_ngcontent');
  if(url.includes('/hi')){
    newIndexHtml = newIndexHtml.split('<html lang="en">').join('<html lang="hi">');
  }
  else {
    newIndexHtml = newIndexHtml.split('<html lang="hi">').join('<html lang="en">');
  }
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
