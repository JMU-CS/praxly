/**
 * Objects for generating the example programs.
 */
export const codeText = [
  {
    name: "Variables",
    code: `
int a ← 4
int b ← 32
int c ← 0
c ← a + b
a ← b
b ← a - c % b
print a
print b
print c
`,
    difficulty: "easy",
    topics: "declaration, assignment"
  },
  {
    name: "Expressions",
    code: `
// 1. what do you think this will print out?
print "question 1 prints"
print 3 + 4 * 5 > 32 and 1 + 1 == 2

// 2. what do you think this will print out?
print "question 2 prints"
print "1" + 5 + 6
`,
    difficulty: "easy",
    topics: "operators, precedence"
  },
  {
    name: "Scope",
    code: `
// The output might surprise you
int b ← 3

void change(int b)
    b ← 100
end change

change(b)
print b
`,
    difficulty: "easy",
    topics: "global / local variables"
  },
  {
    name: "GCD",
    code: `
int gcd(int a, int b)
    while (b ≠ 0)
        int temp ← b
        b ← a % b
        a ← temp
    end while
    return a
end gcd

print gcd(21, 35)
`,
    difficulty: "medium",
    topics: "while loop, remainder"
  },
  {
    name: "Mystery",
    code: `
// This is from question 12 of the example problems
void mystery(int n)
    while (n ≠ 1)
        if (n % 2 == 1)
            n ← 3 * n + 1
        else
            n ← n / 2
        end if
        print n
    end while
end mystery

mystery(6)
`,
    difficulty: "medium",
    topics: "while loop, arithmetic"
  },
  {
    name: "Char Count",
    code: `
// Count character function
int countCharacter(String str, char targetChar)
    int count ← 0
    for (int i ← 0; i < str.length(); i ← i + 1)
        if (str.charAt(i) == targetChar)
            count ← count + 1
        end if
    end for
    return count
end countCharacter

print "Enter a string: "
String userString ← input()
int occurrences ← countCharacter(userString, 'a')
print "Number of occurrences of 'a' in " + userString + ": " + occurrences
`,
    difficulty: "medium",
    topics: "string methods, input"
  },
  {
    name: "Factorial",
    code: `
// This function returns the factorial of a number.
int fact(int n)
    if (n < 2)
        return n
    end if
    return n * fact(n - 1)
end fact

// Try printing different numbers to test your code!
print fact(5)
`,
    difficulty: "medium",
    topics: "procedures, recursion"
  },
  {
    name: "Fibonacci",
    code: `
int fibonacci(int n)
    if (n ≤ 1)
        return n
    else
        return fibonacci(n - 1) + fibonacci(n - 2)
    end if
end fibonacci

print fibonacci(10)
`,
    difficulty: "medium",
    topics: "procedures, recursion"
  },
  {
    name: "Bubble Sort",
    code: `
// Global array declaration
int[] myArray ← {5, 2, 9, 1, 5, 6}

// Bubble sort function
void bubbleSort()
    int n ← 6
    for (int i ← 0; i < n - 1; i ← i + 1)
        for (int j ← 0; j < n - i - 1; j ← j + 1)
            if (myArray[j] > myArray[j + 1])
                // Swap elements if they are in the wrong order
                int temp ← myArray[j]
                myArray[j] ← myArray[j + 1]
                myArray[j + 1] ← temp
            end if
        end for
    end for
end bubbleSort

// Print array function
void printArray()
    int n ← 6
    for (int i ← 0; i < n; i ← i + 1)
        print myArray[i]
    end for
end printArray

// Example usage
bubbleSort()
printArray()
`,
    difficulty: "hard",
    topics: "nested loops, arrays"
  },
  {
    name: "Selection Sort",
    code: `
// Global array declaration
int[] myArray ← {5, 2, 9, 1, 5, 6}

// Selection sort function
void selectionSort()
    int n ← 6
    for (int i ← 0; i < n - 1; i ← i + 1)
        // Find the minimum element in the unsorted part of the array
        int minIndex ← i
        for (int j ← i + 1; j < n; j ← j + 1)
            if (myArray[j] < myArray[minIndex])
                minIndex ← j
            end if
        end for

        // Swap the found minimum element with the first element
        int temp ← myArray[minIndex]
        myArray[minIndex] ← myArray[i]
        myArray[i] ← temp
    end for
end selectionSort

// Print array function
void printArray()
    int n ← 6
    for (int i ← 0; i < n; i ← i + 1)
        print myArray[i]
    end for
end printArray

// Example usage
selectionSort()
printArray()
`,
    difficulty: "hard",
    topics: "nested loops, arrays"
  },
  {
    name: "Coin Change",
    code: `
// Function to calculate change
void calculateChange(int paidAmount, int itemCost)
    int change ← paidAmount - itemCost
    int cents ← change

    int quarters ← cents / 25
    cents ← cents % 25
    int dimes ← cents / 10
    cents ← cents % 10
    int nickels ← cents / 5
    int pennies ← cents % 5

    // Print change breakdown
    print "Change to be given:"
    print "Quarters: " + quarters
    print "Dimes: " + dimes
    print "Nickels: " + nickels
    print "Pennies: " + pennies
end calculateChange

// Main function
void main()
    int itemCost ← 1789
    int paidAmount ← 2000

    // Check if paid amount is sufficient
    if (paidAmount < itemCost)
        print "Insufficient amount paid."
    else
        // Calculate and print change
        calculateChange(paidAmount, itemCost)
    end if
end main

// Run the main function
main()
`,
    difficulty: "hard",
    topics: "procedures, remainder"
  },
]
