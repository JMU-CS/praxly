export const codeText = `
##Example Programs: 
## // click on the blue links above to browse 
// and try out example code! 
// Refresh the page to go back to any code
// you may have had before browsing.
##recursion
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
`;

console.log(codeText);


console.log(codeText);
