$(document).ready(function() {
    var score_components = {
        "Edit count":{
            url: function(username) {
                return "http://en.wikipedia.org/w/api.php?action=query&list=users&ususers=User:" + username + "&usprop=editcount&format=json&callback=?&continue=";
            },
            metric: function(data) {
                return data.query.users[0].editcount;
            },
            delta: function(metric) {
                return 1.25 * (71.513 * Math.log(metric) - 621.0874);
            }
        },
        "Block count":{
            url: function(username) {
                return "http://en.wikipedia.org/w/api.php?action=query&list=logevents&letitle=User:" + username + "&letype=block&format=json&callback=?&continue=";
            },
            metric: function(data) {
                return data.query.logevents.length;
            },
            delta: function(metric) {
                return 1.4 * (100 - 10 * metric);
            }
        },
        "Account age (days)":{
            url: function(username) {
                return "http://en.wikipedia.org/w/api.php?action=query&list=users&ususers=" + username + "&usprop=registration&format=json&callback=?&continue=";
            },
            metric: function(data) {
                return (Date.now() - Date.parse(data.query.users[0].registration))/(1000 * 60 * 60 * 24);
            },
            delta: function(metric) {
                return 1.25 * (0.1799 * metric - 86.983);
            }
        },
        "User page":{
            url: function(username) {
                return "http://en.wikipedia.org/w/api.php?action=query&prop=info&titles=User:" + username + "&format=json&callback=?&continue=";
            },
            metric: function(data) {
                return data.query.pages.hasOwnProperty("-1") ? "missing" : "exists";
            },
            delta: function(metric) {
                return (metric === "missing") ? -50 : 10;
            }
        }
    };
                
    function format_metric(metric) {
        return (!isNaN(metric) && (metric % 1) != 0) ? metric.toFixed(2) : metric;
    }

    function format_delta(delta) {
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
        $.each(score_components, function(name, functions) {
            $.getJSON(functions.url(username), function(data) {
                var metric = functions.metric(data),
                    delta = functions.delta(metric);
                $("#components").append($("<li>")
                                        .addClass("score_component")
                                        .append(name + ": " + metric + " (")
                                        .append(format_delta(delta))
                                        .append(")"));
                $("#score").text((parseFloat($("#score").text()) + delta).toFixed(1));
            });
        });
    });
});
