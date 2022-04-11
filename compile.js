let code = `
class Name {
	let lastName = "Mateus";
	let firstName = "Sarmento";
}
`;

const { parse } = require("./parser");
const { tokenize } = require("./tokenizer");

console.log(JSON.stringify(parse(tokenize(code)), null, 4));
