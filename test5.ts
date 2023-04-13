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

interface IData {
	[key: string]: number | boolean | string;
}

const NODE_TYPES = Constant.NODE_TYPES;
const EXCEL_FUNCTION = Constant.EXCEL_FUNCTION;

const binaryExecutioner: { [key: string]: any } = {
	'<=': (a: number, b: number) => a <= b,
	'<': (a: number, b: number) => a < b,
	'>': (a: number, b: number) => a > b,
	'>=': (a: number, b: number) => a >= b,
	'=': (a: number, b: number) => a === b,
};

/**
 * Given a function name and its arguments its executes the function
 * @param functionName AND | OR | NOT
 * @returns
 */
const functionExecutionPipeCurried: Function = (functionName: string) => {
	switch (functionName) {
		case EXCEL_FUNCTION.AND:
			return (children: any[], data: IData) => {
				const result: any = [];
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
			return (children: any[], data: IData) => {
				const result: any = [];
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
			return (children: any[], data: IData) => {
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

	return (children: any[], data: IData) => {
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
const funcSubEntersCurried: Function = (subFunctionName: string, data: IData) => {
	switch (subFunctionName) {
		case NODE_TYPES.BINARY_EXPRESSION:
			return (node: any) => {
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
			return (node: any) => {
				console.log('unary expression');
				console.log(node);
			};
		case NODE_TYPES.LOGICAL:
			return (node: any) => {
				console.log('Encounter logical node');
				console.log(node);
			};
		case NODE_TYPES.NUMBER:
			return (node: any) => Number(node.value);
		case NODE_TYPES.TEXT:
			return (node: any) => {
				console.log('Encounter text node');
				console.log(node);
			};
		case NODE_TYPES.FUNCTION:
			return (node: any) => {
				const { name } = node;
				console.log('Start Execution : ' + name);
				const result = functionExecutionPipeCurried(name)(node.arguments, data);
				console.log(' Result : ' + result);
				return result;
			};
		case NODE_TYPES.CELL:
			return (node: any) => {
				//TODO: resolve the value of the cell/tag here
				return data[node.key];
			};
		case NODE_TYPES.CELL_RANGE:
			return (node: any) => console.log(node);
	}

	return (node: any) => {
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

let tags = tokens.filter((tc: { subtype: string; }) => tc.subtype === 'range').map((tc: { value: any; }) => tc.value);
console.log('Tags: ', tags);

let tagId = 'Tags.M007.RUNNING_FEEDBACK';
let tagValue = 1;

let tagVal: { [x: string]: any; };
tags.forEach((tg: string) => {
	if (tg === tagId) tagVal[tg] = tagValue;
	else tagVal[tg] = tokens[tokens.findIndex((token: { value: any; }) => token.value === tg) + 2].value;
});

const tree = buildTree(tokens);

console.log('Result: ', funcSubEntersCurried(tree.type, tagVal)(tree));
