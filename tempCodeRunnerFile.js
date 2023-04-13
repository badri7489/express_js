const { tokenize } = require('excel-formula-tokenizer');

const tokens = tokenize('SUM(1,2)');

tokens.forEach((value, type, subtype) => {
	console.log('value:   ', value);
	console.log('type:    ', type);
	console.log('subtype: ', subtype);
	console.log();
});
