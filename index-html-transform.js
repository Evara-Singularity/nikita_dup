const cssLinkRegExp = /<link rel="stylesheet" href="(.+)">/;
const scriptLinkRegExp = /<script.*?src="(.*?)(main-|polyfills-|runtime-)(.*?)"/g

function getAsyncLink(href) {
    return `
    <link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${href}"></noscript>
    `;
}

function getHref(indexHtml) {
    return indexHtml.match(cssLinkRegExp)[1];
}


module.exports = (_, indexHtml) => {
    const headClosingTagIdx = indexHtml.indexOf('</head>');

    // add rel=preload tag for bundle CSS
    const headPart = indexHtml.slice(0, headClosingTagIdx);
    const asyncLinkPart = getAsyncLink(getHref(indexHtml));
    const bodyPart = indexHtml.slice(headClosingTagIdx);
    // add rel=preload tags for intial bundle CSS
    const scriptPreloadTags = indexHtml.match(scriptLinkRegExp).map((val) => {
        return val.replace('<script src="', '').replace('"', '');
    }).map(scriptURL => {
        return `<link rel="script" href="${scriptURL}"/>`
    });

    return `
            ${headPart.replace(cssLinkRegExp, '')}
            ${asyncLinkPart}
            ${scriptPreloadTags}
            ${bodyPart}
            `;
};