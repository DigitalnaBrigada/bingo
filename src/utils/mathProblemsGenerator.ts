type MathProblem = {
    problem: string;
    question: string;
    hints: string[];
    correctAnswer: string;
    size: number;
};

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePolynomialLatex(maxDegree = 4, maxCoeff = 5000): number[] {
    const degree = randomInt(1, maxDegree);
    const poly: number[] = [];
    for (let i = 0; i <= degree; i++) {
        poly.push(randomInt(1, maxCoeff));
    }
    return poly;
}

function evaluateIntegral(poly: number[], a: number, b: number): number {
    let sum = 0;
    for (let i = 0; i < poly.length; i++) {
        sum += poly[i] * (b ** (i + 1) - a ** (i + 1)) / (i + 1);
    }
    return Math.round(sum);
}

function polynomialToLatex(poly: number[]): string {
    return poly
        .map((c, i) => i === 0 ? `${c}` : `${c}x^${i}`)
        .join(' + ')
        .replace(/\+\s-/g, '- ');
}

function generateIntegralProblem(): MathProblem {
    let value = 0;
    let poly: number[];
    let a: number;
    let b: number;

    while (true) {
        poly = generatePolynomialLatex();
        a = randomInt(0, 9);
        b = randomInt(a + 1, a + 10);
        value = evaluateIntegral(poly, a, b);
        if (value >= 100000 && value <= 999999) break;
    }

    const polyLatex = polynomialToLatex(poly);
    console.log(polyLatex, a, b);

    return {
        problem: `\\int_${a}^{${b}} (${polyLatex}) \\, dx`,
        question: '',
        hints: [
            value.toString(),
            '\\int (f(x) + g(x)) \\, dx = \\int f(x) \\, dx + \\int g(x) \\, dx',
            '\\int x^n \\, dx = \\frac{x^{n+1}}{n+1}',
        ],
        correctAnswer: value.toString(),
        size: 0.018 - 0.0012 * poly.length,
    };
}

function generateSumSquaresProblem(): MathProblem {
    const n = randomInt(67, 143);
    const sum = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);

    return {
        problem: `\\sum_{k=1}^{${n}} k^2`,
        question: '',
        hints: [
            '\\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6}',
            sum.toString()
        ],
        correctAnswer: sum.toString(),
        size: 0.025
    };
}

function evaluateDerivativeAtX(poly: number[], x: number): number {
    let sum = 0;
    for (let i = 1; i < poly.length; i++) {
        sum += i * poly[i] * x ** (i - 1);
    }
    return Math.round(sum);
}

function generateDerivativeProblem(): MathProblem {
    let derivativeValue = 0;
    let poly: number[];
    let x: number;

    while (true) {
        poly = generatePolynomialLatex(4, 5000);
        x = randomInt(1, 10);
        derivativeValue = evaluateDerivativeAtX(poly, x);

        if (derivativeValue >= 100000 && derivativeValue <= 999999) {
            break;
        }
    }

    const polyLatex = polynomialToLatex(poly);

    return {
        problem: `f(x) = ${polyLatex}`,
        question: `f'(${x}) =`,
        hints: [
            '\\frac{d}{dx} x^n = n * x^{n-1}',
            '\\frac{d}{dx} (f(x) + g(x)) = f\'(x) + g\'(x)',
            derivativeValue.toString()
        ],
        correctAnswer: derivativeValue.toString(),
        size: 0.018 - 0.0012 * poly.length,
    };
}

export function generateMathProblems(count = 1): MathProblem[] {
    const problems: MathProblem[] = [];
    for (let i = 0; i < count; i++) {
        const choice = randomInt(0, 2);
        if (choice === 0) problems.push(generateIntegralProblem());
        else if (choice === 1) problems.push(generateDerivativeProblem());
        else problems.push(generateSumSquaresProblem());
    }
    return problems;
}