const ncp = require('ncp').ncp;
const fs = require('fs');

ncp.limit = 16;

const extensions = process.argv.slice(2);
const regexPattern = new RegExp(`\\.(${extensions.join('|')})$`, 'i');

ncp('../src/main/resources', '../target/classes', {
        filter: (source) => {
            if (fs.lstatSync(source).isDirectory()) {
                return true;
            } else {
                return regexPattern.test(source);
            }
        }
    }, function (err){
        if (err) {
            return console.error(err);
        }
    }
)