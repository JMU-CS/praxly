export const codeText = `
##Example Programs: 
## // click on the blue links above to browse 
// and try out example code! 
// Refresh the page to go back to any code
// you may have had before browsing.

##Order of Operations
##// 1. what do you think this will print out?
print "question 1 prints"
print 3 + 4 * 5 > 32 and 1 + 1 == 2

// 2. what do you think this will print out?
print "question 2 prints"
print "1" + 5 + 6

##array loop
##// you can use for loops when working with arrays!
int[] nums = {1, 2, 3, 4, 5, 6, 7, 8}
for (int i = 3; i < 6; i = i + 1)
	print nums[i]
end for

##if Statement
##if (23 % 2 == 1)
	print "odd!"
else
	print "even!"
end if

##Variables assignment
##int a = 4
int b = 32
int c = 0
c = a + b
a = b
b = a - c % b
print a
print b
print c

##Scope
##// The output might surprise you
int b = 3
void change( int b)
	b = 100
end change
change(b)
print b

##gcd 
##int gcd(int a, int b)
	while (b≠0)
		int temp = b
		b = a % b
		a = temp
	end while
	return a
end gcd
print gcd(21, 35)
##Insertion Sort
##int[] arr = {3, 7, 2, 8, 4, 65, 23, 67, 2, 1}

// Function definition
void insertionSort(int n)
    for (int i = 1; i < n; i = i + 1)
        int key = arr[i]
        int j = i - 1
        while (j >= 0 and arr[j] > key)
            arr[j + 1] = arr[j]
            j = j - 1
        end while
        arr[j + 1] = key
    end for
end insertionSort

// Function call
insertionSort(10)

// Print the sorted array
for (int i = 0; i < 10; i = i + 1)
    print arr[i]
end for

##Factorial
##// this function returns the factorial of a number.
int fact(int n)
	if (n < 2)
		return n
	end if
	return n * fact(n - 1)
end fact
// try printing different numbers to test your code!
print fact(5)
different numbers to test your code!
print fact(5)

##Fibonacci
##int fibonacci(int n)
if (n <= 1)
	return n
else
	return fibonacci(n - 1) + fibonacci(n - 2)
end if
end fibonacci
print fibonacci(10)



`;

