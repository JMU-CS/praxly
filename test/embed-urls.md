# Documentation

Parameter | Options               | Description             |
----------|-----------------------|-------------------------|
&editor=  | text*, blocks, both   | Which editor(s) to show |
&button=  | run*, debug, both     | Which button(s) to show |
&result=  | output*, vars, both   | Which result(s) to show |
#code     | url-encoded format    | Initial source code     |

\* = default values for embedded mode


## Default (text editor and output)

http://localhost:5173/embed.html?#code=println(5652)


## Blocks editor (and output)

http://localhost:5173/embed.html?editor=blocks#code=println(5652)


## Debug button (and output)

http://localhost:5173/embed.html?button=debug#code=print%201%0Aprint%202%0Aprint%203%0A


## Debug button and variable list

http://localhost:5173/embed.html?button=debug&result=vars#code=int%20x%20←%201%0Aint%20y%20←%202%0Ax%20←%20y%20%2B%20x%0A


## Variable list (run button)

http://localhost:5173/embed.html?result=vars#code=int%20x%20←%201%0Aint%20y%20←%202%0Ax%20←%20y%20%2B%20x%0A


## Test debugger with calculateChange

http://localhost:5173/embed.html?button=both&result=both#code=%2F%2F%20Function%20to%20calculate%20change%0Avoid%20calculateChange(int%20paidAmount%2C%20int%20itemCost)%0A%20%20%20%20int%20change%20%E2%86%90%20paidAmount%20-%20itemCost%0A%20%20%20%20int%20cents%20%E2%86%90%20change%0A%0A%20%20%20%20int%20quarters%20%E2%86%90%20cents%20%2F%2025%0A%20%20%20%20cents%20%E2%86%90%20cents%20%25%2025%0A%20%20%20%20int%20dimes%20%E2%86%90%20cents%20%2F%2010%0A%20%20%20%20cents%20%E2%86%90%20cents%20%25%2010%0A%20%20%20%20int%20nickels%20%E2%86%90%20cents%20%2F%205%0A%20%20%20%20int%20pennies%20%E2%86%90%20cents%20%25%205%0A%0A%20%20%20%20%2F%2F%20Print%20change%20breakdown%0A%20%20%20%20println%20%22Change%20to%20be%20given%3A%22%0A%20%20%20%20println%20%22Quarters%3A%20%22%20%2B%20quarters%0A%20%20%20%20println%20%22Dimes%3A%20%22%20%2B%20dimes%0A%20%20%20%20println%20%22Nickels%3A%20%22%20%2B%20nickels%0A%20%20%20%20println%20%22Pennies%3A%20%22%20%2B%20pennies%0Aend%20calculateChange%0A%0A%2F%2F%20Main%20function%0Avoid%20main()%0A%20%20%20%20int%20itemCost%20%E2%86%90%201789%0A%20%20%20%20int%20paidAmount%20%E2%86%90%202000%0A%0A%20%20%20%20%2F%2F%20Check%20if%20paid%20amount%20is%20sufficient%0A%20%20%20%20if%20(paidAmount%20%3C%20itemCost)%0A%20%20%20%20%20%20%20%20println%20%22Insufficient%20amount%20paid.%22%0A%20%20%20%20else%0A%20%20%20%20%20%20%20%20%2F%2F%20Calculate%20and%20print%20change%0A%20%20%20%20%20%20%20%20calculateChange(paidAmount%2C%20itemCost)%0A%20%20%20%20end%20if%0Aend%20main%0A%0A%2F%2F%20Run%20the%20main%20function%0Amain()%0A


## Test debugger with Fibonacci

http://localhost:5173/embed.html?editor=blocks&button=both#code=int%20fibonacci(int%20n)%0A%09if%20(n%20%3C%3D%201)%0A%09%09return%20n%0A%09else%0A%09%09return%20fibonacci(n%20-%201)%20%2B%20fibonacci(n%20-%202)%0A%09end%20if%0Aend%20fibonacci%0Aprintln%20fibonacci(10)
