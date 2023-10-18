import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

const preloadLink = document.createElement('link');
preloadLink.rel = 'preload';
preloadLink.as = 'script';
preloadLink.href = 'https://www.googletagmanager.com/gtm.js?id=' + environment.GTM_ANALYTICS_CODE;

// Append the link element to the document's head
document.head.appendChild(preloadLink);


document.addEventListener('DOMContentLoaded', () => {
    platformBrowserDynamic().bootstrapModule(AppModule)
        .then(res => {
            // console.log('<===ANGULAR SCRIPTS LOADED===>', new Date().getTime())
            setTimeout(() => {intializedGTM(window, document, 'script', 'dataLayer', environment.GTM_ANALYTICS_CODE);initializeGoogleAnalytics()}, 1500)
        })
        .catch(err => console.error(err));
});


function intializedGTM(w, d, s, l, i) {
    // console.log('i am added')
    w[l] = w[l] || [];
    w[l].push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
    });
    var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
    j.defer = true;
    j.src =
        'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    j.onload = () => {
        // console.log('GTAG Loaded after Angular loaded', new Date().getTime());
    }
    setTimeout(() => {
        f.parentNode.insertBefore(j, f)
    }, 0);
};

function initializeGoogleAnalytics() {
    var s = document.createElement( 'script' );
    s.defer = true;
    s.onload = () => {
        // console.log('Google tag added')
    }
    s.setAttribute( 'src', 'https://www.google-analytics.com/analytics.js' );
    document.body.appendChild( s );
}