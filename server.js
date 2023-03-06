const express = require('express');
const mongoose = require('mongoose');
const app = express();

// routes
app.get('/', (req, res) => {
	res.send('Hello from API!!');
});

mongoose.connect(
	'mongodb+srv://admin:badri6291049175@badriapi.b7boyev.mongodb.net/Node-API?retryWrites=true&w=majority'
).then(() => {
    console.log("Hello niggas!!! I connected to your mongodb.");
    app.listen(6789, () => {
		console.log('Node JS is running on port 6969');
	});
}).catch((error) => {
    console.log(error);
});