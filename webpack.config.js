const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: [
		'./app/assets/js/app.js',
		'./app/assets/scss/app.scss'
	],

	output: {
		path: __dirname,
		filename: "public/js/app.js"
	},

	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.s?[ac]ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader'
				],
			}
		]
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: "/public/css/app.css"
		})
	]
};