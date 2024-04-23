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
while (n≠1)
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

`;


const testLater = `

##Insertion Sort
##// Global array declaration
int[] myArray = {5, 2, 9, 1, 5, 6};

// Insertion sort function
void insertionSort()
    int n = 6
    for (int i = 1; i < n; i = i + 1)
        int key = myArray[i]
        int j = i - 1

        // Move elements of myArray[0..i-1] that are greater than key to one position ahead of their current position
        while (j >= 0 and myArray[j] > key)
            myArray[j + 1] = myArray[j]
            j = j - 1
        end while

        myArray[j + 1] = key
    end for
end insertionSort

// Print array function
void printArray()
    int n = 6
    for (int i = 0; i < n; i = i + 1)
        println myArray[i]
    end for
end printArray

// Example usage
insertionSort()
printArray()


##Merge Sort
##// Global array declaration
int[] myArray = {5, 2, 9, 1, 5, 6};

// Merge sort function
void mergeSort(int left, int right)
    if (left < right)
        int mid = left + (right - left) / 2

        // Sort first and second halves
        mergeSort(left, mid)
        mergeSort(mid + 1, right)

        // Merge the sorted halves
        int i = left
        int j = mid + 1
        int k = 0
        int[6] temp

        while (i <= mid and j <= right)
            if (myArray[i] <= myArray[j])
                temp[k] = myArray[i]
                i = i + 1
            else
                temp[k] = myArray[j]
                j = j + 1
            end if
            k = k + 1
        end while

        // Copy the remaining elements of left[], if there are any
        while (i <= mid)
            temp[k] = myArray[i]
            i = i + 1
            k = k + 1
        end while

        // Copy the remaining elements of right[], if there are any
        while (j <= right)
            temp[k] = myArray[j]
            j = j + 1
            k = k + 1
        end while

        // Copy the merged elements back to myArray
        for (int p = 0; p < k; p = p + 1)
            myArray[left + p] = temp[p]
        end for
    end if
end mergeSort

// Print array function
void printArray()
    int n = 6
    for (int i = 0; i < n; i = i + 1)
        println myArray[i]
    end for
end printArray

// Example usage
mergeSort(0, 5)
printArray()

`
