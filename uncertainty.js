var lastLineShaded = false;
var currentResult = new Measurement(0.0, 0.0);
const operationSymbols = {add: "+", subtract: "-"};

function Measurement(value, uncertainty) {
    this.value = value;
    this.uncertainty = uncertainty;
}

Measurement.prototype.toString = function() {
    return this.value + " +- " + this.uncertainty;
}

Measurement.prototype.add = function(otherValue) {
    var maximumResult = this.value + this.uncertainty +
            otherValue.value + otherValue.uncertainty;
    var minimumResult = this.value - this.uncertainty +
            otherValue.value - otherValue.uncertainty;

    this.value = ((maximumResult + minimumResult) / 2);
    this.uncertainty = ((maximumResult - minimumResult) / 2);
}

Measurement.prototype.subtract = function(otherValue) {
    var maximumResult = this.value + this.uncertainty -
            otherValue.value + otherValue.uncertainty;
    var minimumResult = this.value - this.uncertainty -
            otherValue.value - otherValue.uncertainty;

    this.value = ((maximumResult + minimumResult) / 2);
    this.uncertainty = ((maximumResult - minimumResult) / 2);
}

function parseMeasurement(userInput) {
    var splitString = userInput.split(" ");
    if(splitString.length != 3 || splitString[1] != "+-") {
        return null;
    }
    return new Measurement(parseFloat(splitString[0]), parseFloat(splitString[2]));
}

function calculate(operation) {
    var userInput = $("#input").val();
    var other = parseMeasurement(userInput);
    if(other == null && userInput.split(" ").length == 1 &&
            !isNaN(parseFloat(userInput))) {
        other = new Measurement(parseFloat(userInput), 0.0);
    }
    if(other == null) {
        $("#error").html("Please enter a measurement in the form " +
                "<tt>x +- y</tt> or <tt>x</tt>.");
    } else {
        $("#error").text("");
        var valueBeforeOperation = currentResult.toString();

        switch(operation) {
        case "add":
            currentResult.add(other);
            break;
        case "subtract":
            currentResult.subtract(other);
            break;
        }
        printlnToTape(valueBeforeOperation + " " + operationSymbols[operation] +
                " " + other.toString() + " = " + currentResult.toString());
    }
    $("#currentResult").text("Current result: " + currentResult.toString());

    $("#input").val("");
}

function reset() {
    currentResult = new Measurement(0.0, 0.0);
    printlnToTape("(reset) = " + currentResult.toString());
    $("#currentResult").text("Current result: " + currentResult.toString());
}

function printlnToTape(line) {
    $("<div />", {
        class: lastLineShaded ? "tickerLine" : "tickerLine shaded",
        text: line
    }).appendTo("#tape");
    lastLineShaded = !lastLineShaded;
}