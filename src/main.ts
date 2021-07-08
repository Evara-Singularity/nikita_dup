import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .then(res => {
      if (navigator['connection']['type'] && (navigator['connection']['type'] == 'wifi')) {
        //load analytics scripts
        console.log("WIFI speed detected.")
        loadAnalytics();
      } else {
        // check for 4g network and add analytics scripts
        if (navigator['connection']['effectiveType'] && (navigator['connection']['effectiveType'] == '4g')) {
          console.log("4G speed detected.")
          loadAnalytics();
        }
      }
    })
    .catch(err => console.error(err));
});

function loadAnalytics() {
  // Adobe script loaded
  var script = document.createElement('script');
  script.onload = function () {
    console.log("Adobe script loaded")
  };
  script.src = environment.ADOBE_ANALYTIC_SCRIPT;
  document.getElementsByTagName('head')[0].appendChild(script);
  // GTM script loaded
  if (navigator && navigator.userAgent.indexOf("Googlebot") === -1) {
    const gtmKey = environment.GTM_ANALYTICS_CODE; //QA Key
    createGTMTag(window, document, 'script', 'dataLayer', gtmKey);
  }
}

function createGTMTag(w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });

  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s);
  j.onload = function () {
    console.log("GTM script loaded")
  };
  let dl = l != 'dataLayer' ? '&l=' + l : '';
  j.defer = true;
  j.src =
    'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f)
}
