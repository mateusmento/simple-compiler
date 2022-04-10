let code = `
let fullName;
class Name {
	let lastName;
	let firstName;
}
`;

let { tokenize } = require("./tokenizer");

function log(message, {next, ...token}) {
	let {lineNumber, position} = token;
	let line = code.split("\n")[lineNumber-1];
	if (process.argv.includes("-t")) console.log(token)
	console.log(message);
	console.log(`line ${lineNumber} position ${position}`);
	console.log("\t"+line);
	console.log("\n\t" + [...Array(position-1)].map(x => " ").join("") + "^");
}

console.log(JSON.stringify(parse(tokenize(code)), null, 4));

function parse(tokens) {
	let ast = [];
	let token = tokens[0];

	function processVariableDeclaration(token) {
		let variable;
		if (token.type === 'let') {
			if (token.next && token.next.type === 'identifier') {
				token = token.next;
				variable = {type: 'declared_variable', name: token.name}; 
				if (token.next && token.next.type === "semicolon") {
					token = token.next.next;
				} else {
					log(`Error: missing semicolon after variable identifier`, token);
					token = token.next;
				}
			} else {
				log(`Error: missing identifier near "let"`, token);
				token = token.next;
			}
		}

		return [token, variable];
	}

	function processClassDeclaration(token) {
		let classtype;
		if (token.type === "class") {
			if (token.next && token.next.type === "identifier") {
				token = token.next;
				let className = token.name;
				if (token.next && token.next.type === "semicolon") {
					classtype = {type: "declared_class", name: className, body: []};
					token = token.next.next;
				} else if (token.next && token.next.type === "open_curly_brackets") {
					token = token.next.next;
					let variables = [], variable;
					while (token.type !== "close_curly_brackets") {
						[token, variable] = processVariableDeclaration(token);
						if (variable) variables.push(variable);
					}
					token = token.next;
					classtype = {type: "declared_class", name: className, body: variables};
				} else {
					log(`Error: missing semicolon after class identifier`, token);
					token = token.next;
				}
			} else {
				log("Error near `class`: missing identifier", token);
				token = token.next;
			}
		}

		return [token, classtype];
	}

	while (token) {
		if (token.type === 'let') {
			[token, variable] = processVariableDeclaration(token);
			if (variable) ast.push(variable);
			continue;
		}

		if (token.type === "class") {
			[token, classtype] = processClassDeclaration(token);
			if (classtype) ast.push(classtype);
			continue;
		}

		log(`token not processed: ${token.type}`, token);
		token = token.next;
	}

	return ast;
}