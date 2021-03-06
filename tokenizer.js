const keywords = ['let', 'class', 'function'];

let wordBreakerTokens = [
	{ type: ';' },
	{ type: ',' },
	{ type: '.' },
	{ type: ':' },
	{ type: '{' },
	{ type: '}' },
	{ type: '{' },
	{ type: '}' },
	{ type: '(' },
	{ type: ')' },
	{ type: '+' },
	{ type: '-' },
	{ type: '*' },
	{ type: '/' },
	{ type: '\\' },
	{ type: '`' },
	{ type: '$' },
	{ type: '>=' },
	{ type: '<=' },
	{ type: '=>' },
	{ type: '=' },
	{ type: '>' },
	{ type: '<' },
];

function tokenize(code) {
	let tokens = [];
	let tokenGuessing = [];
	let isCollectingString = false;
	let lineNumber = 1;
	let position = 0;

	for (let i = 0; i < code.length; i++) {
		var char = code.charAt(i);

		position++;

		if (['"', "'"].includes(char)) {
			if (['"', "'"].includes(tokenGuessing[0])) {
				tokenGuessing.push(char);
				applyGuessing();
				isCollectingString = false;
			} else {
				applyGuessing();
				tokenGuessing.push(char);
				isCollectingString = true;
			}
			continue;
		}

		if (isCollectingString) {
			tokenGuessing.push(char);
			continue;
		}

		if (char === '\n') {
			applyGuessing();
			lineNumber++;
			position = 0;
			continue;
		}

		if ([' ', '	'].includes(char)) {
			applyGuessing();
			continue;
		}

		let wordBreakerToken = wordBreakerTokens.find(token => token.type === code.slice(i, i+token.type.length));

		if (wordBreakerToken) {
			applyGuessing();
			i += wordBreakerToken.type.length - 1;
			position += wordBreakerToken.type.length - 1;
			pushToken({ type: wordBreakerToken.type });
			continue;
		}

		if (canBeKeyword(char)) {
			tokenGuessing.push(char);
			continue;
		}

		if (canBeIdentifier(char)) {
			tokenGuessing.push(char);
			continue;
		}

		if (canBeNumericLiteral(char)) {
			tokenGuessing.push(char);
			continue;
		}
	}

	if (process.argv.includes("-t"))
		console.log(tokens);

	for (let i = 0; i < tokens.length; i++)
		tokens[i].next = tokens[i+1];

	return tokens;

	function applyGuessing() {
		let token = guess();
		tokenGuessing = [];
		if (token) pushToken(token);
		return token;
	}

	function guess() {
		let token = tokenGuessing.join('');	
		if (isKeyword(token)) {
			return { type: token};
		} else if (isStringLiteral(token)) {
			return {type: "literal", literalType: "string", text: token};
		} else if (isNumericLiteral(token)) {
			return {type: "literal", literalType: "number", text: token};
		} else if (token) {
			return { type: 'identifier', name: token};
		}
	}

	function pushToken(token) {
		tokens.push({ ...token, lineNumber, position});
	}

	function isKeyword(token) {
		return !!token && keywords.some(k => k.startsWith(token));
	}

	function canBeKeyword(char) {
		var token = tokenGuessing.join('') + char;
		return isKeyword(token);
	}

	function canBeIdentifier(char) {
		var token = tokenGuessing.join('') + char;
		return isValidIdentifierToken(token);
	}

	function isValidIdentifierToken(token) {
		return /^[_a-zA-Z][_a-zA-Z0-9]*$/.test(token);
	}

	function isStringLiteral(token) {
		return /^".*"$|^'.*'$/.test(token);
	}

	function canBeNumericLiteral(token) {
		var token = tokenGuessing.join('') + char;
		return isNumericLiteral(token);
	}

	function isNumericLiteral(token) {
		return /^\d+$/.test(token);
	}
}

module.exports = { tokenize };
