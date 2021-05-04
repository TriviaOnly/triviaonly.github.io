// circles attributes
var tileWidth = 40;
var tileHeight = 10;
var tilePadding = 80;
var tileTopPadding = 50;
var tileMonthPadding = 100;
var rectPerRow = 5;
// var rowNumber = 13;

// bars attributes
var barWidth = 40;


function initializeData(){

    data = d3.nest()
        .key(function(d){ return d.hours;})
        .entries(data);

}

var markTransform = [100, 300, 400, 800, 950, 1050];
var bookNames = ['Less than 1 hour', '1-5 hours', '5-10 hours', '10-20 hours', '20-30 hours', '30-40 hours'];


function makeCircle(d,i){

    count = i + 1;
    var chart = d3.select(this)
        .attr("transform", function(d){
            var a = bookNames.indexOf(d.key);
            return "translate(50," + markTransform[a] + ')'
        })
        .selectAll("dot")
        .data(d.values);

    var undergraduateCircles = chart.enter()
        .append("circle")
        .attr("class",function(d){
            return "undergraduate-circles";
        })
        .attr("cx", function(d,i){
            if (d.hours!='1-5 hours') {
                return i%rectPerRow * tilePadding + 495;
            } else if (d.hours == '1-5 hours'){
                return i%rectPerRow * tilePadding - 5;
            }
        })
        .attr("cy", function(d,i){
            var rowNumber = Math.floor(i / rectPerRow);
            return  (rowNumber) * tileTopPadding;
        })
        .attr("r", 10)
        .style('fill',function(d){
            if (d.undergraduate_short == 'science-related'){
                return "#ff8e71";
            } else if (d.undergraduate_short == 'not-science-related'){
                return "#583d72";
            }
        })
        .style("opacity","1");

    
    // add mouseover effect
    var tooltip = d3.select(".undergraduate-circles")
            .append("div")
            .attr("class","legend")
            .style("opacity",0)
            .style("background-color", "black")
            .style("border-radius", "5px")
            .style("padding","10px")
            .style("color","white");


    var showTooltip = function(d){
        console.log("hover!")
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 1)
            .html(d.undergraduate_major)
            .style("left", (d3.event.pageX + 30) + "px")
            .style("top", (d3.event.pageY + 30) + "px")
    }

    // var moveTooltip = function(d){
    //     console.log("move!!")
    //     tooltip
    //         .style("left", (d3.mouse(this)[0]) + "px")
    //         .style("top", (d3.mouse(this)[1]) + "px")
    // }

    var hideTooltip = function(d){
        console.log("hide!!")
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    undergraduateCircles
        .on("mouseover", showTooltip)
        // .on("mousemove", moveTooltip)
        .on("mouseout", hideTooltip);


    chart.exit().remove();
}

function makeCircleGraduate(d,i){

    count = i + 1;
    var chart = d3.select(this)
        .attr("transform", function(d){
            var a = bookNames.indexOf(d.key);
            return "translate(50," + markTransform[a] + ')'
        })
        .selectAll("dot")
        .append("circle")
        .data(d.values);

    chart.enter()
        .append("circle")
        .attr("class",function(d){
            return d.hours;
        })
        .attr("cx", function(d,i){
            if (d.hours!='1-5 hours') {
                return i%rectPerRow * tilePadding + 525;
            } else if (d.hours == '1-5 hours'){
                return i%rectPerRow * tilePadding + 25;
            }
        })
        .attr("cy", function(d,i){
            var rowNumber = Math.floor(i / rectPerRow);
            return  (rowNumber) * tileTopPadding;
        })
        .attr("r", function(d){
            if (d.graduate_short == 'science-related'){
                return 10;
            } else if (d.graduate_short == 'not-science-related'){
                return 10;
            } else {
                return 8;
            }
        })
        .style('fill',function(d){
            if (d.graduate_short == 'science-related'){
                return "#ff8e71";
            } else if (d.graduate_short == 'not-science-related'){
                return "#583d72";
            } else {
                return "rgb(255, 200, 92)";
            }
        })
        .style("stroke", function(d){
            if (d.graduate_short == 'science-related'){
                return "None";
            } else if (d.graduate_short == 'not-science-related'){
                return "None";
            } else {
                return "#000";
            }
        })
        .style("opacity","1");


    chart.exit().remove();

}

function makeRect(d,i){
    count = i + 1;
    var chart = d3.select(this)
        .attr("transform", function(d){
            var a = bookNames.indexOf(d.key);
            return "translate(50," + markTransform[a] + ')'
        })
        .selectAll(".dots")
        .data(d.values);

    chart.enter()
        .append("rect")
        .attr("class",function(d){
            return d.hours;
        })
        .attr("x", function(d,i){
            if (d.hours!='1-5 hours') {
                return i%rectPerRow * tilePadding + 480;
            } else if (d.hours == '1-5 hours'){
                return i%rectPerRow * tilePadding - 20;
            }
        })
        .attr("y", function(d,i){
            
            if (d.hours!='1-5 hours') {
                var rowNumber = Math.floor(i / rectPerRow);
                return  (rowNumber) * tileTopPadding - 10;
            } else if (d.hours == '1-5 hours'){
                var rowNumber = Math.floor(i / rectPerRow);
                return  (rowNumber) * tileTopPadding - 10;
            }
        })
        .attr("rx", function(d){
            if (d.role == 'Analyst'){
                return 0;
            } else if (d.role == 'Leadership'){
                return 80;
            } else if(d.role == 'Scientist'){
                return 0;
            } else if (d.role == 'Developer'){
                return 0;
            } else if (d.role == 'Desish'){
                return 80;
            } else if (d.role=='Journalist'){
                return 80;
            } else if (d.role=='Engineer'){
                return 0;
            } else {
                return 80;
            }
        })
        .attr("height", 20)
        .attr("width", 60)
        .style('fill',function(d){
            return "#ffc85c";
        })
        .style("opacity","1");

    chart.enter()
        .append("text")
        .attr("x", 50)
        .attr("y", 100)
        .text(function(d){
            return d.key;
        });


    chart.exit().remove();

}


function writeTitles(d,i){
    count = i + 1;

    var chart = d3.select(this)
        .attr("transform", function(d){
            var a = bookNames.indexOf(d.key);
            return "translate(50," + markTransform[a] + ')'
        })
        .selectAll(".dots")
        .data(d.values);

    chart.enter()
        .append("text")
        // .attr("x", function(d,i){
        //     return i%rectPerRow * tilePadding - 20;
        // })
        .attr("x", function(d,i){
            if (d.hours!='1-5 hours') {
                return i%rectPerRow * tilePadding + 480;
            } else if (d.hours == '1-5 hours'){
                return i%rectPerRow * tilePadding - 20;
            }
        })
        .attr("y", function(d,i){
            var rowNumber = Math.floor(i / rectPerRow);
            return  (rowNumber) * tileTopPadding - 20;
        })
        .style("font-family","'Roboto Mono', monospace")
        .text(function(d,i){
            if (i==0){
                return "每周花费时间：" + d.hours_chinese;
            }
        });


    chart.exit().remove();
}



function makeCharts(){

    var u = d3.select("#graphic")
        .append("svg")
        .attr("height","1100")
        .attr("width","1000")
        .attr("transform","translate(100,0)")
        .selectAll("g")
        .data(data);

    u.enter()
        .append("g")
        .merge(u)
        .each(makeRect)
        .each(makeCircle)
        .each(makeCircleGraduate)
        .each(writeTitles)
        // Add image for the legend
        .append("svg:image")
        .attr("xlink:href", function(d){
            return "assets/img/dsChallenge_legend.png"
        })
        .attr("class", function(d,i){
            return "ds_legend_" + i
        })
        .attr("x", function(d){
            return -20;
        })
        .attr("y", function(d){
            return -10;
        })
        .attr("width", "380px")
        .style("display",function(d,i){
            if (i != 2){
                return "None";
            }
        });


    u.exit().remove();
}






d3.csv("assets/data/dschallenge.csv", function(err, csv){
    data = csv;

    initializeData();
    makeCharts();

    // addImage();
})

