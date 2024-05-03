module.exports = {
	watch: true,
	devtool: "inline-source-map",
	module: {
	rules: [
	{
		test: /\.css$/i,
		use: ["style-loader", "css-loader"],
	},
	],
	},
	entry: {
	main: "./src/index.js",
	todo: "./src/todo.js",
	teacher: "./src/teacher.js",
	login:"./src/login.js",
	},
	output: {
	filename: "[name].js",
	path: __dirname + "/dist",
	},
};