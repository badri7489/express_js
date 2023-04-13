const { tokenize } = require('excel-formula-tokenizer');
const { buildTree, visit } = require('excel-formula-ast');

const Constant = {
	NODE_TYPES: {
		BINARY_EXPRESSION: 'binary-expression',
		UNARY_EXPRESSION: 'unary-expression',
		LOGICAL: 'logical',
		TEXT: 'text',
		NUMBER: 'number',
		FUNCTION: 'function',
		CELL_RANGE: 'cell-range',
		CELL: 'cell',
	},
	EXCEL_FUNCTION: {
		AND: 'AND',
		OR: 'OR',
		NOT: 'NOT',
	},
};

const NODE_TYPES = Constant.NODE_TYPES;
const EXCEL_FUNCTION = Constant.EXCEL_FUNCTION;

const binaryExecutioner = {
	'<=': (a, b) => a <= b,
	'<': (a, b) => a < b,
	'>': (a, b) => a > b,
	'>=': (a, b) => a >= b,
	'=': (a, b) => a === b,
};

const functionExecutionPipeCurried = (functionName) => {
	switch (functionName) {
		case EXCEL_FUNCTION.AND:
			return (children , data) => {
				const result = [];
				for (let child of children) {
					const child_execution_result = funcSubEntersCurried(child.type, data)(child);

					//In ands child if one fails to satisfy then return undefined
					if (!child_execution_result) return undefined;

					//else keep adding the result
					result.push(child_execution_result);
				}
				return result;
			};
		case EXCEL_FUNCTION.OR:
			return (children , data) => {
				const result  = [];
				for (let child of children) {
					const child_execution_result = funcSubEntersCurried(child.type, data)(child);

					//In or the first truth is returned
					if (child_execution_result) result.push(child_execution_result);
				}

				//if none of the function gets success
				if (result.length === 0) return undefined;
				return result;
			};
		case EXCEL_FUNCTION.NOT:
			return (children , data) => {
				//as not has always one child
				const child = children[0];
				console.log(child);
				// console.log(child);
				const child_execution_result = funcSubEntersCurried(child.type, data)(child);

				//In not if inner child
				if (!child_execution_result) return 'NOT ' + child.key;

				return undefined;
			};
	}

	return (children , data) => {
		console.error('Require Implementation', functionName);
		return '';
	};
};

/**
 * Given a node type return function of that node
 * @param subFunctionName
 * @param data
 * @returns
 */
const funcSubEntersCurried  = (subFunctionName, data) => {
	switch (subFunctionName) {
		case NODE_TYPES.BINARY_EXPRESSION:
			return (node) => {
				const { left, operator, right } = node;
				const leftValue = funcSubEntersCurried(left.type, data)(left);
				const rightValue = funcSubEntersCurried(right.type, data)(right);

				console.log(
					`Execution :: left is ${left.key} ${leftValue}, operator is ${operator}, right is ${rightValue}`
				);
				if (binaryExecutioner[operator](Number(leftValue), Number(rightValue)))
					return left.key + operator + rightValue;
				return undefined;
			};

		case NODE_TYPES.UNARY_EXPRESSION:
			return (node) => {
				console.log('unary expression');
				console.log(node);
			};
		case NODE_TYPES.LOGICAL:
			return (node) => {
				console.log('Encounter logical node');
				console.log(node);
			};
		case NODE_TYPES.NUMBER:
			return (node) => Number(node.value);
		case NODE_TYPES.TEXT:
			return (node) => {
				console.log('Encounter text node');
				console.log(node);
			};
		case NODE_TYPES.FUNCTION:
			return (node) => {
				const { name } = node;
				console.log('Start Execution : ' + name);
				const result = functionExecutionPipeCurried(name)(node.arguments, data);
				console.log(' Result : ' + result);
				return result;
			};
		case NODE_TYPES.CELL:
			return (node) => {
				//TODO: resolve the value of the cell/tag here
				return data[node.key];
			};
		case NODE_TYPES.CELL_RANGE:
			return (node) => console.log(node);
	}

	return (node) => {
		console.error('Require Implementation', subFunctionName);
	};
};
const formula = `OR(AND(Tags.M000.RUNNING_FEEDBACK=0,Tags.M000.READY_FB=1),
					AND(Tags.M002.RUNNING_FEEDBACK = 0, Tags.M002.READY_FB = 1),
					AND(Tags.M005.RUNNING_FEEDBACK = 0, Tags.M005.READY_FB = 1),
					AND(Tags.M006.RUNNING_FEEDBACK = 0, Tags.M006.READY_FB = 1),
					AND(Tags.M007.RUNNING_FEEDBACK = 0, Tags.M007.READY_FB = 1),
					AND(Tags.M008.RUNNING_FEEDBACK = 0, Tags.M008.READY_FB = 1),
					AND(Tags.M200.RUNNING_FEEDBACK = 0, Tags.M200.READY_FB = 1),
					AND(Tags.M204.RUNNING_FEEDBACK = 0, Tags.M204.READY_FB = 1),
					AND(Tags.M009.RUNNING_FEEDBACK = 0, Tags.M009.READY_FB = 1),
					AND(Tags.M199.RUNNING_FEEDBACK = 0, Tags.M199.READY_FB = 1),
					AND(Tags.M114.RUNNING_FEEDBACK = 0, Tags.M114.READY_FB = 1),
					AND(Tags.M101.RUNNING_FEEDBACK = 0, Tags.M101.READY_FB = 1),
					AND(Tags.M201.RUNNING_FEEDBACK = 0, Tags.M201.READY_FB = 1),
					AND(Tags.M011.RUNNING_FEEDBACK = 0, Tags.M011.READY_FB = 1),
					AND(Tags.M012.RUNNING_FEEDBACK = 0, Tags.M012.READY_FB = 1),
					AND(Tags.M013.RUNNING_FEEDBACK = 0, Tags.M013.READY_FB = 1),
					AND(Tags.M014.RUNNING_FEEDBACK = 0, Tags.M014.READY_FB = 1),
					AND(Tags.M203.RUNNING_FEEDBACK = 0, Tags.M203.READY_FB = 1),
					AND(Tags.M015.RUNNING_FEEDBACK = 0, Tags.M015.READY_FB = 1),
					AND(Tags.M016.RUNNING_FEEDBACK = 0, Tags.M016.READY_FB = 1),
					AND(Tags.M202.RUNNING_FEEDBACK = 0, Tags.M202.READY_FB = 1),
					AND(Tags.M017.RUNNING_FEEDBACK = 0, Tags.M017.READY_FB = 1),
					AND(Tags.M019.RUNNING_FEEDBACK = 0, Tags.M019.READY_FB = 1),
					AND(Tags.M020.RUNNING_FEEDBACK = 0, Tags.M020.READY_FB = 1),
					AND(Tags.M021.RUNNING_FEEDBACK = 0, Tags.M021.READY_FB = 1),
					AND(Tags.M022.RUNNING_FEEDBACK = 0, Tags.M022.READY_FB = 1))`;
const tokens = tokenize(formula);
console.log("tokens before:", tokens);

let tags = tokens.filter((tc) => tc.subtype === 'range').map((tc) => tc.value);
console.log("tags: ", tags);
tags['Tags.M000.RUNNING_FEEDBACK'] = 1;

tokens.map((tc) => {
	if (tc.subtype === 'range') {
		console.log(tc.value);
		tc.value = tags[tc.value];
		tc.subtype = 'number';
	}
})

console.log("Tokens after: ", tokens);

// build tree
const tree = buildTree(tokens);

// let tags = { 'Tags.M000.READY_FB': 1,
//   'Tags.M001.READY_FB': 1,
//   'Tags.M002.READY_FB': 1,
//   'Tags.M003.READY_FB': 1,
//   'Tags.M004.READY_FB': 1,
//   'Tags.M005.READY_FB': 1,
//   'Tags.M006.READY_FB': 1,
//   'Tags.M007.READY_FB': 1,
//   'Tags.M008.READY_FB': 1,
//   'Tags.M200.READY_FB': 1,
//   'Tags.M204.READY_FB': 1,
//   'Tags.M009.READY_FB': 1,
//   'Tags.M199.READY_FB': 1,
//   'Tags.M114.READY_FB': 1,
//   'Tags.M101.READY_FB': 1,
//   'Tags.M201.READY_FB': 1,
//   'Tags.M010.READY_FB': 1,
//   'Tags.M011.READY_FB': 1,
//   'Tags.M012.READY_FB': 1,
//   'Tags.M013.READY_FB': 1,
//   'Tags.M014.READY_FB': 1,
//   'Tags.M203.READY_FB': 1,
//   'Tags.M015.READY_FB': 1,
//   'Tags.M016.READY_FB': 1,
//   'Tags.M202.READY_FB': 1,
//   'Tags.M017.READY_FB': 1,
//   'Tags.M018.READY_FB': 1,
//   'Tags.M019.READY_FB': 1,
//   'Tags.M020.READY_FB': 1,
//   'Tags.M021.READY_FB': 1,
//   'Tags.M022.READY_FB': 1,
//   'Tags.M000.RUNNING_FEEDBACK': 1,
//   'Tags.M001.RUNNING_FEEDBACK': 1,
//   'Tags.M002.RUNNING_FEEDBACK': 1,
//   'Tags.M003.RUNNING_FEEDBACK': 1,
//   'Tags.M004.RUNNING_FEEDBACK': 1,
//   'Tags.M005.RUNNING_FEEDBACK': 1,
//   'Tags.M006.RUNNING_FEEDBACK': 1,
//   'Tags.M007.RUNNING_FEEDBACK': 1,
//   'Tags.M008.RUNNING_FEEDBACK': 1,
//   'Tags.M200.RUNNING_FEEDBACK': 1,
//   'Tags.M204.RUNNING_FEEDBACK': 1,
//   'Tags.M009.RUNNING_FEEDBACK': 1,
//   'Tags.M199.RUNNING_FEEDBACK': 1,
//   'Tags.M114.RUNNING_FEEDBACK': 1,
//   'Tags.M101.RUNNING_FEEDBACK': 1,
//   'Tags.M201.RUNNING_FEEDBACK': 1,
//   'Tags.M010.RUNNING_FEEDBACK': 1,
//   'Tags.M011.RUNNING_FEEDBACK': 1,
//   'Tags.M012.RUNNING_FEEDBACK': 1,
//   'Tags.M013.RUNNING_FEEDBACK': 1,
//   'Tags.M014.RUNNING_FEEDBACK': 1,
//   'Tags.M203.RUNNING_FEEDBACK': 1,
//   'Tags.M015.RUNNING_FEEDBACK': 1,
//   'Tags.M016.RUNNING_FEEDBACK': 1,
//   'Tags.M202.RUNNING_FEEDBACK': 1,
//   'Tags.M017.RUNNING_FEEDBACK': 1,
//   'Tags.M018.RUNNING_FEEDBACK': 1,
//   'Tags.M019.RUNNING_FEEDBACK': 1,
//   'Tags.M020.RUNNING_FEEDBACK': 1,
//   'Tags.M021.RUNNING_FEEDBACK': 1,
//   'Tags.M022.RUNNING_FEEDBACK': 1,
//   'Tags.M184.READY_FB': 1,
//   'Tags.M188.READY_FB': 1,
//   'Tags.M192.READY_FB': 1,
//   'Tags.M185.READY_FB': 1,
//   'Tags.M189.READY_FB': 1,
//   'Tags.M193.READY_FB': 1,
//   'Tags.M024.READY_FB': 1,
//   'Tags.M036.READY_FB': 1,
//   'Tags.M025.READY_FB': 1,
//   'Tags.M037.READY_FB': 1,
//   'Tags.M026.READY_FB': 1,
//   'Tags.M038.READY_FB': 1,
//   'Tags.M027.READY_FB': 1,
//   'Tags.M039.READY_FB': 1,
//   'Tags.M028.READY_FB': 1,
//   'Tags.M040.READY_FB': 1,
//   'Tags.M029.READY_FB': 1,
//   'Tags.M041.READY_FB': 1,
//   'Tags.M030.READY_FB': 1,
//   'Tags.M042.READY_FB': 1,
//   'Tags.M031.READY_FB': 1,
//   'Tags.M043.READY_FB': 1,
//   'Tags.M032.READY_FB': 1,
//   'Tags.M044.READY_FB': 1,
//   'Tags.M033.READY_FB': 1,
//   'Tags.M045.READY_FB': 1,
//   'Tags.M034.READY_FB': 1,
//   'Tags.M046.READY_FB': 1,
//   'Tags.M035.READY_FB': 1,
//   'Tags.M047.READY_FB': 1,
//   'Tags.M186.READY_FB': 1,
//   'Tags.M190.READY_FB': 1,
//   'Tags.M194.READY_FB': 1,
//   'Tags.M187.READY_FB': 1,
//   'Tags.M191.READY_FB': 1,
//   'Tags.M195.READY_FB': 1,
//   'Tags.M048.READY_FB': 1,
//   'Tags.M196.READY_FB': 1,
//   'Tags.M197.READY_FB': 1,
//   'Tags.M049.READY_FB': 1,
//   'Tags.M050.READY_FB': 1,
//   'Tags.M051.READY_FB': 1,
//   'Tags.M052.READY_FB': 1,
//   'Tags.M053.READY_FB': 1,
//   'Tags.M054.READY_FB': 1,
//   'Tags.M198.READY_FB': 1,
//   'Tags.M055.READY_FB': 1,
//   'Tags.M056.READY_FB': 1,
//   'Tags.M057.READY_FB': 1,
//   'Tags.M058.READY_FB': 1,
//   'Tags.M063.READY_FB': 1,
//   'Tags.M064.READY_FB': 1,
//   'Tags.M065.READY_FB': 1,
//   'Tags.M066.READY_FB': 1,
//   'Tags.M072.READY_FB': 1,
//   'Tags.M073.READY_FB': 1,
//   'Tags.M074.READY_FB': 1,
//   'Tags.M075.READY_FB': 1,
//   'Tags.M116.READY_FB': 1,
//   'Tags.M171.READY_FB': 1,
//   'Tags.M069.READY_FB': 1,
//   'Tags.M070.READY_FB': 1,
//   'Tags.M156.READY_FB': 1,
//   'Tags.M071.READY_FB': 1,
//   'Tags.M067.READY_FB': 1,
//   'Tags.M173.READY_FB': 1,
//   'Tags.M184.RUNNING_FEEDBACK': 1,
//   'Tags.M188.RUNNING_FEEDBACK': 1,
//   'Tags.M192.RUNNING_FEEDBACK': 1,
//   'Tags.M185.RUNNING_FEEDBACK': 1,
//   'Tags.M189.RUNNING_FEEDBACK': 1,
//   'Tags.M193.RUNNING_FEEDBACK': 1,
//   'Tags.M024.RUNNING_FEEDBACK': 1,
//   'Tags.M036.RUNNING_FEEDBACK': 1,
//   'Tags.M025.RUNNING_FEEDBACK': 1,
//   'Tags.M037.RUNNING_FEEDBACK': 1,
//   'Tags.M026.RUNNING_FEEDBACK': 1,
//   'Tags.M038.RUNNING_FEEDBACK': 1,
//   'Tags.M027.RUNNING_FEEDBACK': 1,
//   'Tags.M039.RUNNING_FEEDBACK': 1,
//   'Tags.M028.RUNNING_FEEDBACK': 1,
//   'Tags.M040.RUNNING_FEEDBACK': 1,
//   'Tags.M029.RUNNING_FEEDBACK': 1,
//   'Tags.M041.RUNNING_FEEDBACK': 1,
//   'Tags.M030.RUNNING_FEEDBACK': 1,
//   'Tags.M042.RUNNING_FEEDBACK': 1,
//   'Tags.M031.RUNNING_FEEDBACK': 1,
//   'Tags.M043.RUNNING_FEEDBACK': 1,
//   'Tags.M032.RUNNING_FEEDBACK': 1,
//   'Tags.M044.RUNNING_FEEDBACK': 1,
//   'Tags.M033.RUNNING_FEEDBACK': 1,
//   'Tags.M045.RUNNING_FEEDBACK': 1,
//   'Tags.M034.RUNNING_FEEDBACK': 1,
//   'Tags.M046.RUNNING_FEEDBACK': 1,
//   'Tags.M035.RUNNING_FEEDBACK': 1,
//   'Tags.M047.RUNNING_FEEDBACK': 1,
//   'Tags.M186.RUNNING_FEEDBACK': 1,
//   'Tags.M190.RUNNING_FEEDBACK': 1,
//   'Tags.M194.RUNNING_FEEDBACK': 1,
//   'Tags.M187.RUNNING_FEEDBACK': 1,
//   'Tags.M191.RUNNING_FEEDBACK': 1,
//   'Tags.M195.RUNNING_FEEDBACK': 1,
//   'Tags.M048.RUNNING_FEEDBACK': 1,
//   'Tags.M196.RUNNING_FEEDBACK': 1,
//   'Tags.M197.RUNNING_FEEDBACK': 1,
//   'Tags.M049.RUNNING_FEEDBACK': 1,
//   'Tags.M050.RUNNING_FEEDBACK': 1,
//   'Tags.M051.RUNNING_FEEDBACK': 1,
//   'Tags.M052.RUNNING_FEEDBACK': 1,
//   'Tags.M053.RUNNING_FEEDBACK': 1,
//   'Tags.M054.RUNNING_FEEDBACK': 1,
//   'Tags.M198.RUNNING_FEEDBACK': 1,
//   'Tags.M055.RUNNING_FEEDBACK': 1,
//   'Tags.M056.RUNNING_FEEDBACK': 1,
//   'Tags.M057.RUNNING_FEEDBACK': 1,
//   'Tags.M058.RUNNING_FEEDBACK': 1,
//   'Tags.M063.RUNNING_FEEDBACK': 1,
//   'Tags.M064.RUNNING_FEEDBACK': 1,
//   'Tags.M065.RUNNING_FEEDBACK': 1,
//   'Tags.M066.RUNNING_FEEDBACK': 1,
//   'Tags.M072.RUNNING_FEEDBACK': 1,
//   'Tags.M073.RUNNING_FEEDBACK': 1,
//   'Tags.M074.RUNNING_FEEDBACK': 1,
//   'Tags.M075.RUNNING_FEEDBACK': 1,
//   'Tags.M116.RUNNING_FEEDBACK': 1,
//   'Tags.M171.RUNNING_FEEDBACK': 1,
//   'Tags.M069.RUNNING_FEEDBACK': 1,
//   'Tags.M070.RUNNING_FEEDBACK': 1,
//   'Tags.M156.RUNNING_FEEDBACK': 1,
//   'Tags.M071.RUNNING_FEEDBACK': 1,
//   'Tags.M067.RUNNING_FEEDBACK': 1,
//   'Tags.M173.RUNNING_FEEDBACK': 1,
//   'Tags.Low_Level_on_29': 1,
//   'Tags.Low_Level_on_30': 1,
//   'Tags.Low_Level_FB_4': 1,
//   'Tags.Low_Level_FB_5': 1,
//   'Tags.Low_Level_FB_6': 1,
//   'Tags.Low_Level_FB_7': 1,
//   'Tags.Low_Level_FB_8': 1,
//   'Tags.Low_Level_FB_9': 1,
//   'Tags.Low_Level_FB_10': 1,
//   'Tags.Low_Level_FB_11': 1,
//   'Tags.Low_Level_FB_12': 1,
//   'Tags.Low_Level_FB_13': 1,
//   'Tags.Low_Level_FB_14': 1,
//   'Tags.Low_Level_FB_15': 1,
//   'Tags.Low_Level_FB_31': 1,
//   'Tags.Low_Level_FB_32': 1,
//   'Tags.M122.READY_FB': 1,
//   'Tags.M174.READY_FB': 1,
//   'Tags.M076.READY_FB': 1,
//   'Tags.M081.READY_FB': 1,
//   'Tags.M086.READY_FB': 1,
//   'Tags.M175.READY_FB': 1,
//   'Tags.M077.READY_FB': 1,
//   'Tags.M082.READY_FB': 1,
//   'Tags.M087.READY_FB': 1,
//   'Tags.M176.READY_FB': 1,
//   'Tags.M078.READY_FB': 1,
//   'Tags.M083.READY_FB': 1,
//   'Tags.M088.READY_FB': 1,
//   'Tags.M177.READY_FB': 1,
//   'Tags.M079.READY_FB': 1,
//   'Tags.M084.READY_FB': 1,
//   'Tags.M089.READY_FB': 1,
//   'Tags.M178.READY_FB': 1,
//   'Tags.M080.READY_FB': 1,
//   'Tags.M085.READY_FB': 1,
//   'Tags.M090.READY_FB': 1,
//   'Tags.M091.READY_FB': 1,
//   'Tags.M092.READY_FB': 1,
//   'Tags.M117.READY_FB': 1,
//   'Tags.M093.READY_FB': 1,
//   'Tags.M150.READY_FB': 1,
//   'Tags.M094.READY_FB': 1,
//   'Tags.M151.READY_FB': 1,
//   'Tags.M095.READY_FB': 1,
//   'Tags.M152.READY_FB': 1,
//   'Tags.M096.READY_FB': 1,
//   'Tags.M153.READY_FB': 1,
//   'Tags.M097.READY_FB': 1,
//   'Tags.M155.READY_FB': 1,
//   'Tags.M123.READY_FB': 1,
//   'Tags.M098.READY_FB': 1,
//   'Tags.M099.READY_FB': 1,
//   'Tags.M100.READY_FB': 1,
//   'Tags.M102.READY_FB': 1,
//   'Tags.M103.READY_FB': 1,
//   'Tags.M104.READY_FB': 1,
//   'Tags.M105.READY_FB': 1,
//   'Tags.M106.READY_FB': 1,
//   'Tags.M107.READY_FB': 1,
//   'Tags.M108.READY_FB': 1,
//   'Tags.M109.READY_FB': 1,
//   'Tags.M110.READY_FB': 1,
//   'Tags.M111.READY_FB': 1,
//   'Tags.M112.READY_FB': 1,
//   'Tags.M113.READY_FB': 1,
//   'Tags.M115.READY_FB': 1,
//   'Tags.M119.READY_FB': 1,
//   'Tags.M118.READY_FB': 1,
//   'Tags.M120.READY_FB': 1,
//   'Tags.M121.READY_FB': 1,
//   'Tags.M122.RUNNING_FEEDBACK': 1,
//   'Tags.M174.RUNNING_FEEDBACK': 1,
//   'Tags.M076.RUNNING_FEEDBACK': 1,
//   'Tags.M081.RUNNING_FEEDBACK': 1,
//   'Tags.M086.RUNNING_FEEDBACK': 1,
//   'Tags.M175.RUNNING_FEEDBACK': 1,
//   'Tags.M077.RUNNING_FEEDBACK': 1,
//   'Tags.M082.RUNNING_FEEDBACK': 1,
//   'Tags.M087.RUNNING_FEEDBACK': 1,
//   'Tags.M176.RUNNING_FEEDBACK': 1,
//   'Tags.M078.RUNNING_FEEDBACK': 1,
//   'Tags.M083.RUNNING_FEEDBACK': 1,
//   'Tags.M088.RUNNING_FEEDBACK': 1,
//   'Tags.M177.RUNNING_FEEDBACK': 1,
//   'Tags.M079.RUNNING_FEEDBACK': 1,
//   'Tags.M084.RUNNING_FEEDBACK': 1,
//   'Tags.M089.RUNNING_FEEDBACK': 1,
//   'Tags.M178.RUNNING_FEEDBACK': 1,
//   'Tags.M080.RUNNING_FEEDBACK': 1,
//   'Tags.M085.RUNNING_FEEDBACK': 1,
//   'Tags.M090.RUNNING_FEEDBACK': 1,
//   'Tags.M091.RUNNING_FEEDBACK': 1,
//   'Tags.M092.RUNNING_FEEDBACK': 1,
//   'Tags.M117.RUNNING_FEEDBACK': 1,
//   'Tags.M093.RUNNING_FEEDBACK': 1,
//   'Tags.M150.RUNNING_FEEDBACK': 1,
//   'Tags.M094.RUNNING_FEEDBACK': 1,
//   'Tags.M151.RUNNING_FEEDBACK': 1,
//   'Tags.M095.RUNNING_FEEDBACK': 1,
//   'Tags.M152.RUNNING_FEEDBACK': 1,
//   'Tags.M096.RUNNING_FEEDBACK': 1,
//   'Tags.M153.RUNNING_FEEDBACK': 1,
//   'Tags.M097.RUNNING_FEEDBACK': 1,
//   'Tags.M155.RUNNING_FEEDBACK': 1,
//   'Tags.M123.RUNNING_FEEDBACK': 1,
//   'Tags.M098.RUNNING_FEEDBACK': 1,
//   'Tags.M099.RUNNING_FEEDBACK': 1,
//   'Tags.M100.RUNNING_FEEDBACK': 1,
//   'Tags.M102.RUNNING_FEEDBACK': 1,
//   'Tags.M103.RUNNING_FEEDBACK': 1,
//   'Tags.M104.RUNNING_FEEDBACK': 1,
//   'Tags.M105.RUNNING_FEEDBACK': 1,
//   'Tags.M106.RUNNING_FEEDBACK': 1,
//   'Tags.M107.RUNNING_FEEDBACK': 1,
//   'Tags.M108.RUNNING_FEEDBACK': 1,
//   'Tags.M109.RUNNING_FEEDBACK': 1,
//   'Tags.M110.RUNNING_FEEDBACK': 1,
//   'Tags.M111.RUNNING_FEEDBACK': 1,
//   'Tags.M112.RUNNING_FEEDBACK': 1,
//   'Tags.M113.RUNNING_FEEDBACK': 1,
//   'Tags.M115.RUNNING_FEEDBACK': 1,
//   'Tags.M119.RUNNING_FEEDBACK': 1,
//   'Tags.M118.RUNNING_FEEDBACK': 1,
//   'Tags.M120.RUNNING_FEEDBACK': 1,
//   'Tags.M121.RUNNING_FEEDBACK': 1 };

// console.log("Answer: ", funcSubEntersCurried(tree.type, tags)(tree));

// create visitor for parts of tree you're interested in
const visitor = {
	enterFunction(functionNode) {
		console.log(`function is ${functionNode.name}`);
	},
	enterNumber(numberNode) {
		console.log(`number is ${numberNode.value}`);
	},
};

