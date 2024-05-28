const ncp = require('ncp').ncp;
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf')

ncp.limit = 16;

const sourceDir = '../src/main/resources';
const destinationDir = '../target/classes';

const extensions = process.argv.slice(2);
if (extensions.length === 0) {
    console.error("No file extensions provided. Usage: node sync-changes.js png jpg gif ...");
    process.exit(1);
}

function syncChanges(sourceDir, destinationDir, extensions) {
    const regexPattern = new RegExp(`\\.(${extensions.join('|')})$`, 'i');
    let fileCount = 0;

    ncp(sourceDir, destinationDir, {
            filter: (source) => {
                if (fs.lstatSync(source).isDirectory()) {
                    return true;
                } else if (regexPattern.test(source)) {
                    fileCount++;
                    return true;
                } else {
                    return false;
                }
            }
        }, function (err) {
            if (err) {
                return console.error(err);
            }
            console.info(`${fileCount} ${fileCount === 1 ? 'file' : 'files'} with extensions: ${extensions.join(', ')} \nSuccessfully copied from ${sourceDir} to ${destinationDir}\n`);

            syncDelete(sourceDir, destinationDir, regexPattern);
        }
    )
}

function syncDelete(sourceDir, destinationDir, pattern) {
    const sourceFiles = getFiles(sourceDir, pattern);
    const destinationFiles = getFiles(destinationDir, pattern);

    const sourceSet = new Set(sourceFiles);
    const filesToDelete = destinationFiles.filter(file => !sourceSet.has(file));

    filesToDelete.forEach(file => {
        rimraf.sync(path.join(destinationDir, file));
        console.info(`Deleted ${file} as it no longer exists in the source directory.`);
    })
}

function getFiles(dir, pattern, prefix = '') {
    return fs.readdirSync(dir).reduce((files, file) => {
        const filePath = path.join(dir, file);
        const relativePath = prefix + file;
        if (fs.lstatSync(filePath).isDirectory()) {
            return files.concat(getFiles(filePath, pattern, relativePath + '/'));
        } else if (pattern.test(relativePath)) {
            files.push(relativePath);
        }
        return files;
    }, []);
}

syncChanges(sourceDir, destinationDir, extensions);