# Documentation

Parameter | Values (default*)   | Description
----------|---------------------|------------------------
?embed    |                     | Turn on embedded mode
&editor=  | text*, blocks, both | Which editor(s) to show
&button=  | run*, debug, both   | Which button(s) to show
&result=  | output*, vars, both | Which result(s) to show
#code     | url-encoded format  | Initial source code


# Default (text editor and output)

http://localhost:5173/?embed#code=println(5652)


# Blocks editor (and output)

http://localhost:5173/?embed&editor=blocks#code=println(5652)


# Debug button (and output)

http://localhost:5173/?embed&button=debug#code=print%201%0Aprint%202%0Aprint%203%0A


# Debug button and variable list

http://localhost:5173/?embed&button=debug&result=vars#code=int%20x%20←%201%0Aint%20y%20←%202%0Ax%20←%20y%20%2B%20x%0A


# Variable list (run button)

http://localhost:5173/?embed&result=vars#code=int%20x%20←%201%0Aint%20y%20←%202%0Ax%20←%20y%20%2B%20x%0A
