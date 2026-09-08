package main

#use "my-project/test"

const MaxCount = 100

const pi = 3.14

var* gCounter = 0

fn add(a, b) {
    return a + b
}

fn main() {
    var* x = 10
    var* y = 20
    var* explicitNum + {int} = 42

    const greeting = "Hello World\n"
    print(greeting)

    call& = ("add", x, y)
    var* sum = call& = ("add", x, y)
    println("Sum: ", sum)

    call& = ("PrintResult", sum)

    gCounter++
    output("Counter: ", gCounter)

    var* maxVal = drawcall& = ("MaxCount")
    output("Max: ", maxVal)
    var* ok = true
    if ok {
        output("ok is true!")
    } else {
        output("ok is false")
    }

    var* area = 3.14 * 5.0
    output("Area approx: ", area)

    var* iterations = 3
    while iterations > 0 {
        iterations--
        output("Loop ticks left: ", iterations)
    }
    println("Hello World")
    print("Hello World")
}

return 0
