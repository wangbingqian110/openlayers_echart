const path = require('path')

module.exports = {
	devtool:'eval-source-map',
	entry: {
		winds:path.resolve(__dirname, 'src/winds.js'),
	},
	output: {
		path: path.resolve(__dirname, 'dist/JS'),
		filename: '[name].bundle.js',
	},
	mode:'development'
}