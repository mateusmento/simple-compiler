let code = `
class Name {
	let lastName = "Mateus";
	let firstName = "Sarmento";
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
				let variableName = token.name;
				if (token.next && token.next.type === ";") {
					variable = {type: 'declared_variable', name: variableName, value: "null"};
					token = token.next;
				} else if (token.next && token.next.type === "=") {
					token = token.next.next;
					if (token && token.type === "literal") {
						variable = {type: 'declared_variable', name: variableName, value: token.text};
						token = token.next;
					} else if (token && token.type === "identifier") {
						let identifier = ast.find(e => e.type === "declared_variable" && e.name === token.name);
						if (identifier) {
							variable = {type: 'declared_variable', name: variableName, value: identifier.value};
						} else {
							log(`Error: Unknown identifier "${token.name}"`, token);
						}
						token = token.next;
					} else {
						log(`Error: expected value for variable initialization`, token);
					}
				} else {
					variable = {type: 'declared_variable', name: variableName, value: "null"};
					log(`Error: missing semicolon after variable identifier`, token);
				}
			} else {
				log(`Error: missing identifier near "let"`, token);
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
				if (token.next && token.next.type === ";") {
					classtype = {type: "declared_class", name: className, body: []};
					token = token.next.next;
				} else if (token.next && token.next.type === "{") {
					token = token.next.next;
					let variables = [], variable;
					while (token.type !== "}") {
						[token, variable] = processVariableDeclaration(token);
						token = token.next;
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
			token = token.next;
			if (variable) ast.push(variable);
			continue;
		}

		if (token.type === "class") {
			[token, classtype] = processClassDeclaration(token);
			if (classtype) ast.push(classtype);
			continue;
		}

		log(`Unexpected token: ${token.type}`, token);
		token = token.next;
	}

	return ast;
}
