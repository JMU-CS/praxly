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

##array loop
##// you can use for loops when working with arrays!
int[] nums = {1, 2, 3, 4, 5, 6, 7, 8}
for (int i = 3; i < 6; i = i + 1)
	println nums[i]
end for

##if Statement
##if (23 % 2 == 1)
	println "odd!"
else
	println "even!"
end if

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
	while (b≠0)
		int temp = b
		b = a % b
		a = temp
	end while
	return a
end gcd
println gcd(21, 35)
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

// println the sorted array
for (int i = 0; i < 10; i = i + 1)
    println arr[i]
end for

##Factorial
##// this function returns the factorial of a number.
int fact(int n)
	if (n < 2)
		return n
	end if
	return n * fact(n - 1)
end fact
// try printlning different numbers to test your code!
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

`;

