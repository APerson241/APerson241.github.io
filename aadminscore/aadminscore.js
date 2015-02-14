$(document).ready(function() {
    // From http://stackoverflow.com/a/2901298/1757964
    function numberWithCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

    const EDIT_COUNT_MULTIPLIER = 1.25;
    const BLOCK_COUNT_MULTIPLIER = 1.4;
    const ACCOUNT_AGE_MULTIPLIER = 1.25;

    var scoreComponents = {
        "Edit count":{
            url: function(username) {
                return "http://en.wikipedia.org/w/api.php?action=query&list=users&ususers=User:" + username + "&usprop=editcount&format=json&callback=?&continue=";
            },
            metric: function(data) {
                var count = data.query.users[0].editcount;
                return {raw: count, formatted: numberWithCommas(count)};
            },
            delta: function(metric) {
                return EDIT_COUNT_MULTIPLIER * (71.513 * Math.log(metric) - 621.0874);
            }
        },
        "Blocks":{
            url: function(username) {
                return "http://en.wikipedia.org/w/api.php?action=query&list=logevents&letitle=User:" + username + "&letype=block&format=json&callback=?&continue=";
            },
            metric: function(data) {
                var blockCount = data.query.logevents.length;
                if(blockCount === 0) {
                    return {raw: {count: 0, since: NaN}, formatted: "never blocked"};
                } else {
                    var sinceLast = (Date.now() - Date.parse(data.query.logevents[0].timestamp)) / MILLISECONDS_IN_DAY;
                    return {
                        raw: {count: blockCount, since: sinceLast},
                        formatted: blockCount + " blocks (last one was " + numberWithCommas(sinceLast.toFixed(1)) + " days ago)"
                    };
                }
            },
            delta: function(metric) {
                console.log("Finding delta for " + JSON.stringify(metric));
                if(metric.count === 0) {
                    return BLOCK_COUNT_MULTIPLIER * 100;
                } else {
                    var score = 0.1977 * metric.since - 92.3255;
                    score -= 10 * metric.count;
                    return BLOCK_COUNT_MULTIPLIER * score;
                }
            }
        },
        "Account age":{
            url: function(username) {
                return "http://en.wikipedia.org/w/api.php?action=query&list=users&ususers=" + username + "&usprop=registration&format=json&callback=?&continue=";
            },
            metric: function(data) {
                var count = (Date.now() - Date.parse(data.query.users[0].registration)) / MILLISECONDS_IN_DAY;
                return {raw: count, formatted: numberWithCommas(count.toFixed(1)) + " days"};
            },
            delta: function(metric) {
                return ACCOUNT_AGE_MULTIPLIER * (0.1799 * metric - 86.983);
            }
        },
        "User page":{
            url: function(username) {
                return "http://en.wikipedia.org/w/api.php?action=query&prop=info&titles=User:" + username + "&format=json&callback=?&continue=";
            },
            metric: function(data) {
                var result = data.query.pages.hasOwnProperty("-1") ? "missing" : "exists";
                return {raw: result, formatted: result};
            },
            delta: function(metric) {
                return (metric === "missing") ? -50 : 10;
            }
        }
    };

    function formatDelta(delta) {
        return $("<span>")
            .text((delta < 0 ? "" : "+") + delta.toFixed(2))
            .addClass("mw-ui-text")
            .addClass("mw-ui-" + (delta >= 0 ? "constructive" : "destructive"));
    }

    $("#submit").click(function() {
        var username = $("#username").val();
        $("#error").hide();
        $("#result").hide();
        if(username === "") {
            $("#error").empty();
            $("#error").show();
            $("#error").append($("<div>")
                               .addClass("errorbox")
                               .text("No username specified."));
            return;
        }
        $("#result").show();
        $("#score_wrapper")
            .text("Admin score for " + username + ": ")
            .append($("<span>").text("0").attr("id", "score"));
        $("#components").empty();
        $.each(scoreComponents, function(name, functions) {
            $.getJSON(functions.url(username), function(data) {
                var metric = functions.metric(data),
                    delta = functions.delta(metric.raw);
                $("#components").append($("<li>")
                                        .addClass("score_component")
                                        .append(name + ": " + metric.formatted + " (")
                                        .append(formatDelta(delta))
                                        .append(")"));
                $("#score").text((parseFloat($("#score").text()) + delta).toFixed(1));
            });
        });
    });
});
