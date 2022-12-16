export function loadTsFiles(locale = 'en'){
    debugger;
    let path;
    if(locale == 'en'){
        path = require('../config/static-en');
    }
    else{
        path = require('../config/static-hi');
        console.log("path",path);
    }
    console.log("path",path);
    return path;
}