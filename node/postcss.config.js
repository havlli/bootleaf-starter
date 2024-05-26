console.log('PostCSS config loaded');
const postcssConfig = {
    plugins: [
        require('tailwindcss'),
        require('autoprefixer')
    ],
};

if (process.env.NODE_ENV === 'production') {
    console.log('Running with production settings!');
    postcssConfig.plugins.push(
        require('cssnano')({ preset: 'default' })
    );
}

module.exports = postcssConfig;