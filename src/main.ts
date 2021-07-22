import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
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

document.addEventListener('DOMContentLoaded', () => {
    platformBrowserDynamic().bootstrapModule(AppModule)
        .then(res => {

            let ISCHROME = false;
            const ANALYTICS = ["wifi", "4g"]
            if (navigator && navigator['connection']) {
                ISCHROME = (navigator.userAgent as string).toLowerCase().includes("chrome");
                const CONNECTION = navigator['connection'];
                const TYPE: string = CONNECTION['type'] || CONNECTION['effectiveType'];
                if (ANALYTICS.includes(TYPE.toLowerCase())) {
                    // these vars needs present in global document scope
                    loadAnalytics();
                }
            }

            /**
             * hack to over _satellite behaviour incase less 4G network types
             * Refer loadAnalytics()
             * */
            if (!ISCHROME) {
                window['dataLayer'] = [];
                window['digitalData'] = {};
                window['digitalData']['event'] = [];
                window['_satellite'] = window['_satellite'] || {};
                // window['_satellite']['track'] = function (args) {
                //     console.info("Override _satellite", args)
                // }
            }

        })
        .catch(err => console.error(err));
});


function loadAnalytics() {
    /**
     * As per current requirement we are loading GTM scripts after Ng bootstrap
     * Adobe analytics should be moved to index.html, hence commmenting code and keeping it for future reference
    */
    // Adobe script loaded
    // var script = document.createElement('script');
    // script.onload = function () {
    //     console.log("Adobe script loaded")
    // };
    // script.src = environment.ADOBE_ANALYTIC_SCRIPT;
    // document.getElementsByTagName('head')[0].appendChild(script);

    // GTM script loaded
    if (navigator && navigator.userAgent.indexOf("Googlebot") === -1) {
        const gtmKey = environment.GTM_ANALYTICS_CODE; //QA Key
        createGTMTag(window, document, 'script', 'dataLayer', gtmKey);
    }
}


