const { glob } = require("glob");
const { readFile, writeFile, promises: fsPromises } = require("fs");

const buildDirectPath = __dirname + "/dist/browser/";

console.log('postbuild script started:', process.env.DEPLOY_URL); 
glob(buildDirectPath + "*.ttf", {}, function (err, files) {
  if(err) {
    console.log('postbuild script error:', err);
    return 
  }

  if(!process.env.DEPLOY_URL){
    console.log('postbuild script error:', 'No DEPLOY_URL env variable');
    return 
  }

  let ttfFiles = [];
  if(files && Array.isArray(files) && files.length > 0) {
    ttfFiles = files.map(file => file.split('/')[file.split('/').length - 1]).map(file => `${process.env.DEPLOY_URL}${file}`);
  }

  if(ttfFiles.length > 0){
    const indexDir = buildDirectPath + "index.html";
    readFile(indexDir, 'utf-8', function (err, contents) {
        if (err) {
          console.log('postbuild script error:', 'index file read error');
          return;
        }
      
        const fontPreloadTags = ttfFiles.map(file => `<link rel="preload" href="${file}" as="font" type="font/ttf" crossorigin="anonymous">`).join('\n');
        const replaced = contents.replace('<!-- INSERT DYNAMIC FONT PRELOAD AFTER SSR BUILD HERE -->', fontPreloadTags);

        writeFile(indexDir, replaced, 'utf-8', function (err) {
            if(err){
                console.log('postbuild script error:', 'index file write error');
                return 
            }
            console.log('postbuild script success:', 'index file write success');
        });
      });
  }else{
    console.log('postbuild script error:', 'No ttf files found');
  }

  // files is an array of filenames.
  // If the `nonull` option is set, and nothing
  // was found, then files is ["**/*.js"]
  // er is an error object or null.
});


