const NUMBER_PATTERN = /^(?:\d+(?:\.\d+)?|\.\d+)$/;
const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function tokenize(expression) {
    const tokens = [];
    const source = String(expression || '');
    let index = 0;

    while (index < source.length) {
        const char = source[index];

        if (/\s/.test(char)) {
            index += 1;
            continue;
        }

        if (/[0-9.]/.test(char)) {
            let end = index + 1;
            while (end < source.length && /[0-9.]/.test(source[end])) {
                end += 1;
            }
            const rawNumber = source.slice(index, end);
            if (!NUMBER_PATTERN.test(rawNumber)) {
                throw new Error('Invalid number token');
            }
            tokens.push({ type: 'number', value: Number(rawNumber) });
            index = end;
            continue;
        }

        if (/[A-Za-z_]/.test(char)) {
            let end = index + 1;
            while (end < source.length && /[A-Za-z0-9_]/.test(source[end])) {
                end += 1;
            }
            const identifier = source.slice(index, end);
            if (!IDENTIFIER_PATTERN.test(identifier)) {
                throw new Error('Invalid identifier token');
            }
            tokens.push({ type: 'identifier', value: identifier });
            index = end;
            continue;
        }

        if ('+-*/^(),'.includes(char)) {
            tokens.push({ type: 'symbol', value: char });
            index += 1;
            continue;
        }

        throw new Error('Unsupported token');
    }

    return tokens;
}

export default function evaluateMathExpression(expression, functions = {}) {
    const tokens = tokenize(expression);
    let cursor = 0;

    const peek = () => tokens[cursor] || null;
    const consume = () => {
        const token = tokens[cursor];
        cursor += 1;
        return token;
    };
    const expectSymbol = (symbol) => {
        const token = consume();
        if (!token || token.type !== 'symbol' || token.value !== symbol) {
            throw new Error(`Expected symbol ${symbol}`);
        }
    };

    const parseExpression = () => {
        let value = parseTerm();
        while (true) {
            const token = peek();
            if (!token || token.type !== 'symbol' || (token.value !== '+' && token.value !== '-')) {
                break;
            }
            consume();
            const right = parseTerm();
            value = token.value === '+' ? value + right : value - right;
        }
        return value;
    };

    const parseTerm = () => {
        let value = parsePower();
        while (true) {
            const token = peek();
            if (!token || token.type !== 'symbol' || (token.value !== '*' && token.value !== '/')) {
                break;
            }
            consume();
            const right = parsePower();
            if (token.value === '*') {
                value *= right;
            } else {
                if (right === 0) {
                    throw new Error('Division by zero');
                }
                value /= right;
            }
        }
        return value;
    };

    const parsePower = () => {
        let value = parseUnary();
        const token = peek();
        if (token && token.type === 'symbol' && token.value === '^') {
            consume();
            value = Math.pow(value, parsePower());
        }
        return value;
    };

    const parseUnary = () => {
        const token = peek();
        if (token && token.type === 'symbol' && (token.value === '+' || token.value === '-')) {
            consume();
            const unaryValue = parseUnary();
            return token.value === '-' ? -unaryValue : unaryValue;
        }
        return parsePrimary();
    };

    const parsePrimary = () => {
        const token = peek();
        if (!token) {
            throw new Error('Unexpected end of expression');
        }

        if (token.type === 'number') {
            consume();
            return token.value;
        }

        if (token.type === 'symbol' && token.value === '(') {
            consume();
            const inner = parseExpression();
            expectSymbol(')');
            return inner;
        }

        if (token.type === 'identifier') {
            consume();
            const functionName = token.value;
            const openParen = peek();
            if (!openParen || openParen.type !== 'symbol' || openParen.value !== '(') {
                throw new Error('Unexpected identifier');
            }
            consume();
            const args = [];
            const nextToken = peek();
            if (nextToken && !(nextToken.type === 'symbol' && nextToken.value === ')')) {
                while (true) {
                    args.push(parseExpression());
                    const separator = peek();
                    if (separator && separator.type === 'symbol' && separator.value === ',') {
                        consume();
                        continue;
                    }
                    break;
                }
            }
            expectSymbol(')');
            const fn = functions[functionName];
            if (typeof fn !== 'function') {
                throw new Error(`Unsupported function ${functionName}`);
            }
            const output = fn(...args);
            if (typeof output !== 'number' || Number.isNaN(output) || !Number.isFinite(output)) {
                throw new Error('Invalid function result');
            }
            return output;
        }

        throw new Error('Invalid expression');
    };

    const result = parseExpression();
    if (cursor < tokens.length) {
        throw new Error('Unexpected trailing tokens');
    }
    if (typeof result !== 'number' || Number.isNaN(result) || !Number.isFinite(result)) {
        throw new Error('Expression result is invalid');
    }

    return result;
}
