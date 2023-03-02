const express = require('express');
const app = express();

// routes
app.get('/', (req, res) => {
	res.send('Hello from API!!');
});

app.listen(6789, () => {
	console.log('Node JS is running on port 6969');
});
