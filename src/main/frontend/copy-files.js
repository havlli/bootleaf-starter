const ncp = require('ncp').ncp;
const fs = require('fs');

ncp.limit = 16;

ncp('../resources', '../../../target/classes', {
        filter: (source) => {
            if (fs.lstatSync(source).isDirectory()) {
                return true;
            } else {
                return source.match(process.argv[2]) != null;
            }
        }
    }, function (err){
        if (err) {
            return console.error(err);
        }
    }
)