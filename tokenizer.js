const keywords = ['let', 'class', 'function'];

let guessingBreakerTokens = [
	{ key: ';', type: 'semicolon' },
	{ key: ',', type: 'comma' },
	{ key: '.', type: 'period' },
	{ key: ':', type: 'colon' },
	{ key: '{', type: 'open_curly_brackets' },
	{ key: '}', type: 'close_curly_brackets' },
	{ key: '{', type: 'open_square_brackets' },
	{ key: '}', type: 'close_square_brackets' },
	{ key: '(', type: 'open_parentheses' },
	{ key: ')', type: 'close_parentheses' },
	{ key: '+', type: 'plus' },
	{ key: '-', type: 'dash' },
	{ key: '*', type: 'star' },
	{ key: '/', type: 'slash' },
	{ key: '\\', type: 'back_slash' },
	{ key: "'", type: 'single_quote' },
	{ key: '"', type: 'double_quote' },
	{ key: '`', type: 'caret' },
	{ key: '$', type: 'dolar_sign' },
	{ key: '=', type: 'equal_sign' },
	{ key: '<', type: 'left_arrow' },
	{ key: '>', type: 'right_arrow' },
];

function tokenize(code) {
	let tokens = [];
	let tokenGuessing = [];

	let lineNumber = 1;
	let position = 0;
	for (let i = 0; i < code.length; i++) {
		var char = code.charAt(i);

		position++;

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

		let guessingBreakerToken = guessingBreakerTokens.find(token => token.key === char);

		if (guessingBreakerToken) {
			applyGuessing();
			tokens.push({ type: guessingBreakerToken.type, lineNumber, position });
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
	}

	if (process.argv.includes("-t"))
		console.log(tokens);

	for (let i = 0; i < tokens.length; i++)
		tokens[i].next = tokens[i+1];

	return tokens;

	function applyGuessing() {
		let token = tokenGuessing.join('');
		tokenGuessing = [];
	
		if (isKeyword(token)) {
			tokens.push({ type: token, lineNumber, position});
			return;
		}
	
		if (token) {
			tokens.push({ type: 'identifier', name: token, lineNumber, position});
			return;
		}
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
}

module.exports = { tokenize };