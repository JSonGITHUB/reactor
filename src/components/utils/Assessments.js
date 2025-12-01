import React from 'react';

const Assessments = () => {

    const loopRange = (value) => {
        let i = 0;
        const array = [];
        /*
        while (i < 100) {
            array.push(i);
            i++
        }
        */
        for (let i = 0; i < value; i++) {
            array.push(i);
        }

        return array;
    }
    const displayLoopList = (value) => loopRange(value).map((index) => <div>{index}</div>)

    const factorial = (value) => {
        const array = [];
        let factorial = 1;
        const n = value;

        for (let i = n; i > 0; i--) {
            array.push(factorial *= i);
        }

        return [factorial, array];
    }
    const displayFactorial = (number) => <div>
        <h2><b>{number}!</b> = {factorial(number)[0]}</h2>
        <div className='flexContainer'>
            <div className='containerBox width-100-percent'>
                {factorial(number)[1].map((value, index) => <div>
                    <div className={(index !== 0) ? 'containerBox bg-veryLite' : null}>
                        {
                            (index !== 0)
                                ? Number(factorial(number)[1].length - index)
                                : null
                        }
                    </div>
                    <div className='containerBox bg-green'>
                        {
                            (index !== 0)
                                ? '='
                                : null
                        }
                    </div>
                    <div className='containerBox bg-veryLite'>
                        {value}
                    </div>
                    <div>
                        {
                            (index < (factorial(number)[1].length - 1))
                                ? '*'
                                : null
                        }
                    </div>
                </div>
                )}
            </div>
        </div>
    </div>

    const triangle = (value) => {

        const array = [];
        const n = value;

        for (let i = n; i > 0; i--) {
            let row = '';
            // Add leading spaces
            for (let j = n - i; j > 0; j--) {
                row += ' ';
            }
            // Add asterisks
            for (let j = 2 * i - 1; j > 0; j--) {
                row += '*';
            }
            array.push(row);
        }
        return array;

    }
    const displayTriangle = (value) => <div>
        <h2>Triangle {value}</h2>
        <div>
            {triangle(value).map((row, index) => <div className='containerBox'>
                {row}
            </div>
            )}
        </div>
    </div>

    const someShit = (value) => {
        let n = value;
        let result = 0;

        while (n > 0) {
            n = Math.floor(n / 10);
            result += 1;
        }

        // The variable 'result' now contains the count of digits
        return <div>
            <div>
                digits in {value}
            </div>
            <div>
                {result}
            </div>
        </div>
    }
    const fibonacci = (n) => {
        const array = [];
        let a = 0;
        let b = 1;
        let c = 0;
        while (a <= n) {
            array.push(a);
            c = a + b;
            a = b;
            b = c;
        }
        return array;
    }
    const displayFibonacci = (value) => <div>
        <h2>Fibonacci {value}</h2>
        {fibonacci(value).map((value, index) => <div className='containerBox'>{value}</div>)}
    </div>

    const displayDays = () => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        for (const day of days) {
            console.log(day);
        }

        return days.map((day, index) => <div className='containerBox'>{day}</div>);
    }

    const solution = (name, surname, age) => {

        const firstNameShort = name.substring(0, 2);
        const lastNameShort = surname.substring(0, 2);

        const ageString = String(age);

        const result = firstNameShort + lastNameShort + ageString;

        return result;
    }

    const weiredStringManipulation = (A, B) => {

        const consecutiveLimit = 2;
        let a = Number(A);
        let b = Number(B);
        let consecutiveAs = 0;
        let consecutiveBs = 0;
        let result = '';
        let count = 0;

        const addAToString = () => {
            a--
            consecutiveAs++
            consecutiveBs = 0;
            result += `a`;
        }

        const addBToString = () => {
            b--
            consecutiveBs++
            consecutiveAs = 0;
            result += `b`;
        }

        const isGoodTimeForA = () => ((consecutiveAs < consecutiveLimit) && (a > 0)) ? true : false;
        const isGoodTimeForB = () => ((consecutiveBs < consecutiveLimit) && (b > 0)) ? true : false;

        while (a > 0 || b > 0) {

            count++

            if ((a > b) && isGoodTimeForA()) {
                addAToString();
            } else if ((b > a) && isGoodTimeForB()) {
                addBToString();
            } else if (isGoodTimeForA()) {
                addAToString();
            } else if (isGoodTimeForB()) {
                addBToString();
            }

            if (count > (100)) {
                if (a > 0) return `${result}
                    failure too many (A)s, there are ${a} extra (A)s`;
                if (b > 0) return `${result}
                    failure too many (B)s, there are ${b} extra (B)s`;
            }
        }

        return `success: ${result}`;
    }

    //console.log(weiredStringManipulation(5, 3)); // Output: 'aabaabab' or other correct answers
    //console.log(weiredStringManipulation(3, 3)); // Output: 'ababab' or other correct answers
    //console.log(weiredStringManipulation(1, 4)); // Output: 'bbabb'

    const logIt = (label, count, A, B, stupidAssessment) => {

        console.log(`Step:${label}`);
        console.log(`count: ${count}`);
        console.log(`A: ${A}`);
        console.log(`B: ${B}`);
        console.log(`stupidAssessment: ${stupidAssessment}`);

    }


    const generateString = (A, B) => {

        let stupidAssessment = '';
        let count = 0;

        logIt('Initialize', count, A, B, stupidAssessment);

        while (0 < A || 0 < B) {

            // More 'b', append "bba"
            if (A < B) {
                if (0 < B--) {
                    stupidAssessment += ('b');
                }
                if (0 < B--) {
                    stupidAssessment += ('b');
                }
                if (0 < A--) {
                    stupidAssessment += ('a');
                }
            }

            // More 'a', append "aab"x
            else if (B < A) {
                if (0 < A--) {
                    stupidAssessment += ('a');
                }
                if (0 < A--) {
                    stupidAssessment += ('a');
                }
                if (0 < B--) {
                    stupidAssessment += ('b');
                }
            }

            // Equal number of 'a' and 'b'
            // append "ab"
            else {
                if (0 < A--) {
                    stupidAssessment += ('a');
                }
                if (0 < B--) {
                    stupidAssessment += ('b');
                }
            }

            count++

            if (count > 100) {
                return `failure: ${stupidAssessment}`
            }
        }
        return `correct: ${stupidAssessment}`;
    }
    const myWay = (A, B) => {

        let stupidAssessment = '';
        let count = 0;

        logIt('Initialize', count, A, B, stupidAssessment);

        while (0 < A || 0 < B) {

            // More 'b', append "bba"
            if (A < B) {
                if (0 < B) {
                    stupidAssessment += ('b');
                }
                if (0 < B) {
                    stupidAssessment += ('b');
                }
                if (0 < A) {
                    stupidAssessment += ('a');
                }
                B = B - 2;
                A = A - 1;
            }

            // More 'a', append "aab"x
            else if (B < A) {
                if (0 < A) {
                    stupidAssessment += ('a');
                }
                if (0 < A) {
                    stupidAssessment += ('a');
                }
                if (0 < B) {
                    stupidAssessment += ('b');
                }
                A = A - 2;
                B = B - 1;
            }

            // Equal number of 'a' and 'b'
            // append "ab"
            else {
                if (0 < A) {
                    stupidAssessment += ('a');
                }
                if (0 < B) {
                    stupidAssessment += ('b');
                }
                A = A - 1;
                B = B - 1;
            }

            count++

            if (count > 100) {
                return `failure: ${stupidAssessment}`
            }
        }
        return `correct: ${stupidAssessment}`;
    }

    const getLargestBinaryGap = (decimal) => {

        const binary = decimal.toString(2);;
        const binaryArray = binary.split('1');
        let gap = 0;
        const notLastIndex = (index) => (index < (binaryArray.length - 1)) ? true : false;
        const digitLengthBigger = (digit) => (digit.length > gap) ? true : false;

        binaryArray.map((digit, index) => {
            gap = (notLastIndex(index) && digitLengthBigger(digit)) ? digit.length : gap;
        })
        return gap;

    }

    // Example usage:
    //const decimal = 42;
    //const binaryRepresentation = decimalToBinary(decimal);
    //console.log(`Decimal: ${decimal}, Binary: ${binaryRepresentation}`);

    function arrayShifter(arrayToShift, shiftAmount) {

        const newArray = [...arrayToShift]

        while (shiftAmount > 0) {

            if (newArray.length > 0) {
                const lastElement = newArray.pop();
                newArray.unshift(lastElement);
            }
            shiftAmount--
        }

        const displayNewArray = <div>
            {newArray.map((value, index) => <span>{value}{(index < (newArray.length - 1) ? ',' : '')}</span>)}
        </div>

        return displayNewArray;
    }

    // Example usage:
    //const myArray = [1, 2, 3, 4, 5];
    //arrayShifter(myArray);
    //console.log(myArray); // Output: [5, 1, 2, 3, 4]      

    function findUniqueValue(arr) {

        for (const value of arr) {
            if (arr.indexOf(value) === arr.lastIndexOf(value)) {
                return value;
            }
        }
        return null;
    }

    // Example usage:
    //const myArray = [1, 2, 3, 4, 1, 2, 3];
    //const uniqueValue = findUniqueValue(myArray);

    const displayUniqueValue = (theArray) => {

        const uniqueValue = findUniqueValue(theArray);

        if (uniqueValue !== null) {
            return <div>{`The unique value is: ${uniqueValue}`}</div>
        } else {
            return <div>{'No unique value found.'}</div>;
        }

    }
    const returnJumpsDisplay = (jumps) => <div>{`It will take ${jumps} jumps`}</div>;
    const howManyJumps = (X, Y, D) => {
        //X = start, Y = end, D = distance;
        const distanceToCover = Y - X;
        const jumps = Math.ceil(distanceToCover / D);
        //return jumps;
        return returnJumpsDisplay(jumps);
    }

    const missingElement = (array) => {
        const sortedArray = [...array].sort((a, b) => a - b);
        let lastValue = 0;
        let missingNumber = 1;
        const isNextNumber = (value) => ((value-lastValue) === 1) ? true : false;
        sortedArray.map((value, index) => {
            missingNumber = (!isNextNumber(value)) ? (value-1) : missingNumber;
            lastValue = value;
        });
        return missingNumber;
    }
    const missingElementDisplay = (array) => {
        const missingNumber = missingElement(array);
        return <div>
            The missing number is: {missingNumber}
        </div>
    }
    const minimalDifference = (set)=> {
        const newArray = [];
        for (let i = 1; i < set.length; i++) {
            const leftSum = set.slice(0, i).reduce((sum, num) => sum + num, 0);
            const rightSum = set.slice(i).reduce((sum, num) => sum + num, 0);
            const absoluteValue = Math.abs(leftSum - rightSum);
            newArray.push(absoluteValue);
        }
        const smallestNumber = Math.min(...newArray);
        return <div>The smallest number is: {smallestNumber}</div>
    }
 
    return (
        <div className='mt--20 mr-10 ml-10 color-lite bold'>
            <h1>Assessments</h1>
            <div>
                {/*displayLoopList(10)*/}
                {/*displayFactorial(5)*/}
                {/*displayTriangle(5)*/}
                {/*someShit(10000000)*/}
                {/*displayFibonacci(17)*/}
                {/*displayDays()*/}
                {/*solution('John', 'Firelord', 8)*/}
                {/*weiredStringManipulation(5, 3) THE GOOD ONE!*/}
                {/*generateString(1,5)*/}
                {/*`myWay => ${myWay(100,5)}`*/}
                {/*getLargestBinaryGap(1041)*/}
                {/*arrayShifter([1, 2, 3, 4, 5], 2)*/}
                {/*displayUniqueValue([1, 2, 3, 4, 1, 2, 3])*/}
                {/*displayUniqueValue([9,3,9,3,9,7,9])*/}
                {/*howManyJumps(10,85,30)*/}
                {/*missingElementDisplay([5,8,7,9])*/}
                {minimalDifference([3,1,2,4,3])}
            </div>
        </div>
    );
};

export default Assessments;