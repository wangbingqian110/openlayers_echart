const path = require('path')

module.exports = {
	devtool:'eval-source-map',
	entry: {
		wlgj:path.resolve(__dirname, 'src/wlgj.js'),
	},
	output: {
		path: path.resolve(__dirname, 'dist/JS'),
		filename: '[name].bundle.js',
	},
	mode:'development'
}