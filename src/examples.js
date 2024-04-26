/**
 * this is my "csv" file for generating example programs. 
 * Javascript does not have file i/o, so this is what I am using for 
 * this project. 
 */
export const codeText = `

##Example Programs:
## // click on the blue links above to browse
// and try out example code!


##Order of Operations
##// 1. what do you think this will print out?
println "question 1 prints"
println 3 + 4 * 5 > 32 and 1 + 1 == 2

// 2. what do you think this will print out?
println "question 2 prints"
println "1" + 5 + 6


##Variables assignment
##int a = 4
int b = 32
int c = 0
c = a + b
a = b
b = a - c % b
println a
println b
println c


##Scope
##// The output might surprise you
int b = 3
void change( int b)
	b = 100
end change
change(b)
println b


##gcd
##int gcd(int a, int b)
	int temp = b
	while (b≠0)
		b = a % b
		a = temp
	end while
	return a
end gcd
println gcd(21, 35)


##Factorial
##// this function returns the factorial of a number.
int fact(int n)
	if (n < 2)
		return n
	end if
	return n * fact(n - 1)
end fact
// try printing different numbers to test your code!
println fact(5)


##Fibonacci
##int fibonacci(int n)
	if (n <= 1)
		return n
	else
		return fibonacci(n - 1) + fibonacci(n - 2)
	end if
end fibonacci
println fibonacci(10)


##mystery
##//this is from question 12 of the example problems
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

##Bubble Sort
##// Global array declaration
int[] myArray = {5, 2, 9, 1, 5, 6};

// Bubble sort function
void bubbleSort()
    int n = 6
    for (int i = 0; i < n - 1; i = i + 1)
        for (int j = 0; j < n - i - 1; j = j + 1)
            if (myArray[j] > myArray[j + 1])
                // Swap elements if they are in the wrong order
                int temp = myArray[j]
                myArray[j] = myArray[j + 1]
                myArray[j + 1] = temp
            end if
        end for
    end for
end bubbleSort

// Print array function
void printArray()
    int n = 6
    for (int i = 0; i < n; i = i + 1)
        println myArray[i]
    end for
end printArray

// Example usage
bubbleSort()
printArray()


##Selection Sort
##// Global array declaration
int[] myArray = {5, 2, 9, 1, 5, 6};

// Selection sort function
void selectionSort()
    int n = 6
    for (int i = 0; i < n - 1; i = i + 1)
        // Find the minimum element in the unsorted part of the array
        int minIndex = i
        for (int j = i + 1; j < n; j = j + 1)
            if (myArray[j] < myArray[minIndex])
                minIndex = j
            end if
        end for

        // Swap the found minimum element with the first element
        int temp = myArray[minIndex]
        myArray[minIndex] = myArray[i]
        myArray[i] = temp
    end for
end selectionSort

// Print array function
void printArray()
    int n = 6
    for (int i = 0; i < n; i = i + 1)
        println myArray[i]
    end for
end printArray

// Example usage
selectionSort()
printArray()
##Calculate Change
##// Function to calculate change
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
	println "Change to be given:"
	println "Quarters: " + quarters
	println "Dimes: " + dimes
	println "Nickels: " + nickels
	println "Pennies: " + pennies
end calculateChange

// Main function
void main()
	int itemCost ← 1789
	int paidAmount ← 2000

	// Check if paid amount is sufficient
	if (paidAmount < itemCost)
		println "Insufficient amount paid."
	else
		// Calculate and print change
		calculateChange(paidAmount, itemCost)
	end if
end main

// Run the main function
main()
##Count Characters
##// Count character function
int countCharacter(String str, char targetChar)
	int count ← 0
	for (int i ← 0; i < str.length(); i ← i + 1)
		if (str.charAt(i) == targetChar)
			count ← count + 1
		end if
	end for
	return count
end countCharacter

println "Enter a string: "
String userString ← input
int occurrences ← countCharacter(userString, 'a')
println "Number of occurrences of '" + "a" + "' in " + userString + ":" + occurrences




`;




