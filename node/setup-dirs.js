const fs = require('fs');

const directories = [
    '../src/main/resources/static/css',
    '../src/main/resources/static/images',
    '../src/main/resources/static/js',
    '../src/main/resources/static/lib',
    '../src/main/resources/static/svg'
];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});