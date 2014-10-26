var lastLineShaded = false;
var currentResult = new Measurement(0.0, 0.0);
const operationSymbols = {add: "+", subtract: "-", multiply: "*", divide: "/"};

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
    
    return new MaxMinResult(maximumResult, minimumResult);
}

Measurement.prototype.subtract = function(otherValue) {
    var maximumResult = this.value + this.uncertainty -
            otherValue.value + otherValue.uncertainty;
    var minimumResult = this.value - this.uncertainty -
            otherValue.value - otherValue.uncertainty;

    this.value = ((maximumResult + minimumResult) / 2);
    this.uncertainty = ((maximumResult - minimumResult) / 2);
    
    return new MaxMinResult(maximumResult, minimumResult);
}

Measurement.prototype.multiply = function(otherValue) {
    var maximumResult = (this.value + this.uncertainty) *
            (otherValue.value + otherValue.uncertainty);
    var minimumResult = (this.value - this.uncertainty) *
            (otherValue.value - otherValue.uncertainty);

    this.value = ((maximumResult + minimumResult) / 2);
    this.uncertainty = ((maximumResult - minimumResult) / 2);
    
    return new MaxMinResult(maximumResult, minimumResult);
}

Measurement.prototype.divide = function(otherValue) {
    var maximumResult = (this.value + this.uncertainty) /
            (otherValue.value + otherValue.uncertainty);
    var minimumResult = (this.value - this.uncertainty) /
            (otherValue.value - otherValue.uncertainty);

    this.value = ((maximumResult + minimumResult) / 2);
    this.uncertainty = ((maximumResult - minimumResult) / 2);
    
    return new MaxMinResult(maximumResult, minimumResult);
}

function MaxMinResult(max, min) {
    this.max = max;
    this.min = min;
}

MaxMinResult.prototype.toMeasurement = function() {
    return new Measurement((this.max + this.min) / 2,
            (this.max - this.min) / 2);
}

MaxMinResult.prototype.toString = function() {
    return this.max + ", " + this.min;
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
                "<code>x +- y</code> or <code>x</code>.");
    } else {
        $("#error").text("");
        var valueBeforeOperation = currentResult.toString();
        var calculationResult = null;

        switch(operation) {
        case "add":
            calculationResult = currentResult.add(other);
            break;
        case "subtract":
            calculationResult = currentResult.subtract(other);
            break;
        case "multiply":
            calculationResult = currentResult.multiply(other);
            break;
        case "divide":
            calculationResult = currentResult.divide(other);
            break;
        }
        printCalculationToTape("(" + valueBeforeOperation + ") " +
                operationSymbols[operation] + " (" + other.toString() +
                ") = " + currentResult.toString(), calculationResult);
    }
    $("#currentResult").text("Current result: " + currentResult.toString());
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

function printCalculationToTape(line, calculationResult) {
    var newLine = $("<div />", {
        class: lastLineShaded ? "tickerLine" : "tickerLine shaded",
    });
    
    $("<span />", {
        text: line + " "
    }).appendTo(newLine);
    
    $("<span />", {
        class: "maxmin",
        text: "(max/min)"
    }).mouseover(function() {
        $(this).text(calculationResult.toString())
    }).mouseout(function() {
        $(this).text("(max/min)")
    }).appendTo(newLine);
    
    newLine.appendTo("#tape");
    lastLineShaded = !lastLineShaded;
}

function clearTape() {
    $("#tape").empty();
}
