const { tokenize } = require('excel-formula-tokenizer');
const { buildTree, visit } = require('excel-formula-ast');
const FormulaParser = require('hot-formula-parser').Parser;

const parser = new FormulaParser();

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
console.log('Ans: ', parser.parse(formula));