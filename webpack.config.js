const path = require('path')

module.exports = {
	devtool:'eval-source-map',
	entry: {
		index:path.resolve(__dirname, 'src/index.js'),
	},
	output: {
		path: path.resolve(__dirname, 'dist/JS'),
		filename: '[name].bundle.js',
	},
	mode:'development'
}