const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const app = express();

// middleware
app.use(express.json());

// routes
app.get('/', (req, res) => {
	res.send('Hello from API!!');
});

app.post('/products', async(req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(200).json(product);
    } catch (error) {
        console.log(error.message);
        res.send(500).json({ message: error.message });
    }
})

mongoose.connect(
	'mongodb+srv://admin:badri6291049175@badriapi.b7boyev.mongodb.net/Node-API?retryWrites=true&w=majority'
).then(() => {
    console.log("Hello niggas!!! I connected to your mongodb.");
    app.listen(3000, () => {
		console.log('Node JS is running on port 6969');
	});
}).catch((error) => {
    console.log(error);
});