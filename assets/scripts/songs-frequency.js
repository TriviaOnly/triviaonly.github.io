// bar charts
var chartPerRow = 5;
var chartWidth = 500;
var chartHeight = 500;
var chartPadding = 10;
var margin = {top:20, right:30, bottom:40, left:90};



/*
    Scroll Chart
*/
function updateLabel(d){
    var el = d3.select(this)
        .select("text.name");

    if(el.empty()){
        el = d3.select(this)
            .append("text")
            .attr("x", 124)
            .attr("y", function(d){
                return -35;
                // if (d.key.split("_")[1]==0){
                //     return -37;
                // }
                // else {
                //     return 0;
                // }
            })
            .style("font-weight","bolder")
            .style("text-anchor", "middle")
            .style("font-size", "18px")
            .style("fill","#888");
    }

    el.text(d.key.split("_")[0]);
}


function updateLeftLabel(d){
    var el = d3.select(this)
        .select("text.leftLabel");

    if(el.empty()){
        el = d3.select(this)
            .append("text")
            .attr("x", 50)
            .attr("y", function(d){
                return -3;
            })
            // .style("font-weight","reh")
            .style("text-anchor", "left")
            .style("font-size", "13px")
            .style("fill","#888");
    }

    el.text("歌曲数量");
}

function updateRightLabel(d){
    var el = d3.select(this)
        .select("text.rightLabel");

    if(el.empty()){
        el = d3.select(this)
            .append("text")
            .attr("x", 150)
            .attr("y", function(d){
                return -4;
            })
            // .style("font-weight","reh")
            .style("text-anchor", "left")
            .style("font-size", "13px")
            .style("fill","#888");
    }

    el.text("发行频率");
}

function updateAxis(d){

    var x = d3.scaleLinear()
        .domain([0, 30])
        .range([0, chartWidth/2]);

    // var xLeft = d3.scaleLinear()
    //     .domain([100, 0])
    //     .range([chartWidth/2, 0]);

    var y = d3.scaleBand()
        .range([0, chartHeight])
        .domain([2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019])
        .padding(.3);

    var u = d3.select(this)
        .append("g")
        .attr("class","song-freq-chart-axis")
        .attr("transform", "translate(98,0)")
        .call(d3.axisRight(y)
            .tickValues(
                [2000,2005,2010,2015,2019]
            )
        )
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick line")
            .remove());

}


function updateBarInit(d,i){

    var x = d3.scaleLinear()
        .domain([0, 30])
        .range([0, chartWidth]);

    var xLeft = d3.scaleLinear()
        .domain([0, 100])
        .range([0, chartWidth]);


    var y = d3.scaleBand()
        .range([0, chartHeight])
        .domain([2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019])
        .padding(.3);


    var u = d3.select(this)
        .attr("transform", function(d){
            // console.log(d.key.split("_")[1]*20)
            return "translate(200,50)"
            // if ((d.key.split("_")[2]==0) && (d.key.split("_")[1] ==0)){
            //     return "translate(10,50)";
            // } else if (d.key.split("_")[2]==0){
            //     return "translate(10," + d.key.split("_")[1]*320 + ")";
            // } else if (d.key.split("_")[1] ==0){
            //     return "translate(" + d.key.split("_")[2]*250 + ",50)";
            // } else {
            //     return "translate(" + d.key.split("_")[2]*250 + "," + d.key.split("_")[1]*320 + ")";
            // }
        });


    // right chart
    u
        .selectAll("rect.right")
        .data(d.values)
        .enter()
        .append("rect")
        .merge(u)
        .attr("x", x(0) + 150)
        .attr("y", function(d){
            return y(d.year);
        })
        .attr("class","songs-frequency-right")
        // .transition()
        // .duration(1000)
        .attr("width", function(d){return x(d.freq); })
        .attr("height", y.bandwidth())
        .attr("fill", function(d){
            if (d.freq <= 5){
                return "#f5a25d";
            } else if ((d.freq>5) && (d.freq<=10)){
                return "#fa7f72";
            } else if (d.freq> 10){
                return "#389393";
            }
        })
        .attr("stroke", "rgba(0,0,0,0.5")
        .attr("stroke-width", "0.5px");

    u.selectAll("text.rightFreq")
        .data(d.values)
        .enter().append("text")
        .attr("x", function(d){
            return x(d.freq)+148;
        })
        .attr("y", function(d){
            return y(d.year)+13;
        })
        .attr("font-size","13px")
        .attr("text-anchor","end")
        .style("fill","#fff")
        .style("font-family","'Atlas Grotesk Web','Atlas Grotesk Web',Helvetica,Arial,sans-serif")
        .style("font-weight","bolder")
        .attr("class", "rightFreq")
        .text(function(d){ return d.freq; });


    // left chart
    u
        .selectAll("rect.left")
        .data(d.values)
        .enter()
        .append("rect")
        .merge(u)
        .attr("x", function(d){
            return chartWidth - xLeft(d.num) - 398;
        })
        .attr("y", function(d){
            return y(d.year);
        })
        .attr("class","songs-frequency-left")
        // .transition()
        // .duration(1000)
        .attr("width", function(d){return xLeft(d.num); })
        .attr("height", y.bandwidth())
        .attr("fill", function(d){
            // return "#5c6e91";
            if (d.num <= 10){
                return "#c65f63";
            } else if ((d.num>10) && (d.num<=30)){
                return "#84577c";
            } else if (d.num> 30){
                return "#333644";
            }
        })
        .attr("stroke", "rgba(0,0,0,0.5")
        .attr("stroke-width", "0.5px");


    u.selectAll("text.leftNum")
        .data(d.values)
        .enter().append("text")
        .attr("x", function(d){
            return chartWidth - xLeft(d.num) - 380;
        })
        .attr("y", function(d){
            return y(d.year) + 13;
        })
        .attr("font-size","13px")
        .attr("text-anchor","end")
        .style("fill","#fff")
        .style("font-family","'Atlas Grotesk Web','Atlas Grotesk Web',Helvetica,Arial,sans-serif")
        .style("font-weight","bolder")
        .attr("class", "leftNum")
        .text(function(d){ return d.num; });
    

}


function updateBarsInit(){
    var u = d3.select("#songs_frequency")
        .append("svg")
        .attr("class","songs_frequency_chart_01")
        .attr("width", "500px")
        .attr("height", "1000px")
    .selectAll("g")
        .data(data.filter(function(d){
            return d.key=='周杰伦_0_0';
        }));

    u.enter()
        .append("g")
        .merge(u)
        .style("fill","#3d7ea6")
        .each(updateBarInit)
        .each(updateLabel)
        .each(updateLeftLabel)
        .each(updateRightLabel)
        .each(updateAxis);

    u.exit().remove();
}

function updateBarsOne(){
    var svg = d3.select("#songs_frequency").select("svg");
    svg.remove();

    updateBarsInit();


    d3.selectAll(".songs-frequency-right")
        .attr("opacity","0.3");

    d3.selectAll(".songs-frequency-left")
        .attr("opacity","1");

    d3.select(".step-one-text1")
        .style("opacity","1");

    console.log("updatechartOne")

    // console.log(response)
}

function updateBarsTwo(){

}


function updateBarsThree(){
    var svg = d3.select("#songs_frequency").select("svg");
    svg.remove();

    updateBarsInit();

    d3.selectAll(".songs-frequency-left")
    .attr("opacity","0.3");

    d3.selectAll(".songs-frequency-right")
    .attr("opacity","1");


    console.log("updatechartThree")

}


function updateBarFour(d,i){

    var x = d3.scaleLinear()
        .domain([0, 30])
        .range([0, chartWidth]);

    var xLeft = d3.scaleLinear()
        .domain([0, 100])
        .range([0, chartWidth]);


    var y = d3.scaleBand()
        .range([0, chartHeight])
        .domain([2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019])
        .padding(.3);


    var u = d3.select(this)
        .attr("transform", function(d){
            // console.log(d.key.split("_")[1]*20)
            return "translate(200,50)"
            // if ((d.key.split("_")[2]==0) && (d.key.split("_")[1] ==0)){
            //     return "translate(10,50)";
            // } else if (d.key.split("_")[2]==0){
            //     return "translate(10," + d.key.split("_")[1]*320 + ")";
            // } else if (d.key.split("_")[1] ==0){
            //     return "translate(" + d.key.split("_")[2]*250 + ",50)";
            // } else {
            //     return "translate(" + d.key.split("_")[2]*250 + "," + d.key.split("_")[1]*320 + ")";
            // }
        });


    // right chart
    u
        .selectAll("rect.right")
        .data(d.values)
        .enter()
        .append("rect")
        .merge(u)
        .attr("x", x(0) + 150)
        .attr("y", function(d){
            return y(d.year);
        })
        .attr("class","songs-frequency-right")
        .transition()
        .duration(1000)
        .attr("width", function(d){return x(d.freq); })
        .attr("height", y.bandwidth())
        .attr("fill", function(d){
            if (d.freq <= 5){
                return "#f5a25d";
            } else if ((d.freq>5) && (d.freq<=10)){
                return "#fa7f72";
            } else if (d.freq> 10){
                return "#389393";
            }
        })
        .attr("stroke", "rgba(0,0,0,0.5")
        .attr("stroke-width", "0.5px");

    u.selectAll("text.rightFreq")
        .data(d.values)
        .enter().append("text")
        .attr("x", function(d){
            return x(d.freq)+148;
        })
        .attr("y", function(d){
            return y(d.year)+13;
        })
        .attr("font-size","13px")
        .attr("text-anchor","end")
        .style("fill","#fff")
        .style("font-family","'Atlas Grotesk Web','Atlas Grotesk Web',Helvetica,Arial,sans-serif")
        .style("font-weight","bolder")
        .attr("class", "rightFreq")
        .text(function(d){ return d.freq; });


    // left chart
    u
        .selectAll("rect.left")
        .data(d.values)
        .enter()
        .append("rect")
        .merge(u)
        .attr("x", function(d){
            return 0;
        })
        .attr("y", function(d){
            return y(d.year);
        })
        .attr("class","songs-frequency-left")
        .transition()
        .duration(1000)
        .attr("width", function(d){return xLeft(d.num); })
        .attr("x", function(d){
            return chartWidth - xLeft(d.num) - 398;
        })
        .attr("height", y.bandwidth())
        .attr("fill", function(d){
            // return "#5c6e91";
            if (d.num <= 10){
                return "#c65f63";
            } else if ((d.num>10) && (d.num<=30)){
                return "#84577c";
            } else if (d.num> 30){
                return "#333644";
            }
        })
        .attr("stroke", "rgba(0,0,0,0.5")
        .attr("stroke-width", "0.5px");


    u.selectAll("text.leftNum")
        .data(d.values)
        .enter().append("text")
        .attr("x", function(d){
            return chartWidth - xLeft(d.num) - 380;
        })
        .attr("y", function(d){
            return y(d.year) + 13;
        })
        .attr("font-size","13px")
        .attr("text-anchor","end")
        .style("fill","#fff")
        .style("font-family","'Atlas Grotesk Web','Atlas Grotesk Web',Helvetica,Arial,sans-serif")
        .style("font-weight","bolder")
        .attr("class", "leftNum")
        .text(function(d){ return d.num; });
}



function updateBarsFour(){
    var svg = d3.select("#songs_frequency").select("svg");
    svg.transition().duration(500).remove();

    var u = d3.select("#songs_frequency")
    .append("svg")
    .attr("class","songs_frequency_chart_04")
    .attr("width", "500px")
    .attr("height", "1000px")
    .selectAll("g")
        .data(data.filter(function(d){
            // return (d.key=='周杰伦_0_0') || (d.key=='张杰_0_1');
            return (d.key=='林宥嘉_1_2');
        }));

    u.enter()
        .append("g")
        .merge(u)
        .style("fill","#3d7ea6")
        .each(updateBarFour)
        .each(updateLabel)
        .each(updateLeftLabel)
        .each(updateRightLabel)
        .each(updateAxis);

    u.exit().remove();

    console.log("updatechartFour")

}



function updateBarsFive(){
    var svg = d3.select("#songs_frequency").select("svg");
    svg.transition().duration(500).remove();

    var u = d3.select("#songs_frequency")
    .append("svg")
    .attr("class","songs_frequency_chart_05")
    .attr("width", "500px")
    .attr("height", "1000px")
    .selectAll("g")
        .data(data.filter(function(d){
            // return (d.key=='周杰伦_0_0') || (d.key=='张杰_0_1');
            return (d.key=='张杰_0_1');
        }));

    u.enter()
        .append("g")
        .merge(u)
        .style("fill","#3d7ea6")
        .each(updateBarFour)
        .each(updateLabel)
        .each(updateLeftLabel)
        .each(updateRightLabel)
        .each(updateAxis);

    u.exit().remove();

    console.log("updatechartFour")

}


function updateAxisSix(d){

    var x = d3.scaleLinear()
        .domain([0, 30])
        .range([0, chartWidth/2]);

    // var xLeft = d3.scaleLinear()
    //     .domain([100, 0])
    //     .range([chartWidth/2, 0]);

    var y = d3.scaleBand()
        .range([0, chartHeight/3])
        .domain([2014,2015,2016,2017,2018,2019])
        .padding(.3);

    var u = d3.select(this)
        .append("g")
        .attr("class","song-freq-chart-axis")
        .attr("transform", "translate(100,0)")
        .call(d3.axisRight(y)
            .tickValues(
                [2014,2015,2016,2017,2018,2019]
            )
        )
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick line")
            .remove());

}



function updateBarSix(d,i){

    // newChartWidth = 100;
    // newChartHeight = 100;


    var x = d3.scaleLinear()
        .domain([0, 30])
        .range([0, chartWidth/2]);

    var xLeft = d3.scaleLinear()
        .domain([0, 100])
        .range([0, chartWidth/2]);


    var y = d3.scaleBand()
        .range([0, chartHeight/3])
        .domain([2014,2015,2016,2017,2018,2019])
        .padding(.3);

        // (d.key=='周深_2_2') || (d.key=='张碧晨_2_3') || (d.key=='毛不易_3_1') || (d.key=='蔡徐坤_3_3')


    var u = d3.select(this)
        .attr("transform", function(d){
            if (d.key=='周深_2_2'){
                return "translate(100,50)";
            } else if (d.key=='张碧晨_2_3'){
                return "translate(400,50)";
            } else if (d.key=='毛不易_3_1'){
                return "translate(100,300)";
            } else if (d.key=='蔡徐坤_3_3'){
                return "translate(400,300)";
            }
        });


    // right chart
    u
        .selectAll("rect.right")
        .data(d.values)
        .enter()
        .append("rect")
        .merge(u)
        .attr("x", x(0) + 150)
        .attr("y", function(d){
            return y(d.year);
        })
        .attr("class","songs-frequency-right")
        .transition()
        .duration(1000)
        .attr("width", function(d){return x(d.freq); })
        .attr("height", y.bandwidth())
        .attr("fill", function(d){
            if (d.freq <= 5){
                return "#f5a25d";
            } else if ((d.freq>5) && (d.freq<=10)){
                return "#fa7f72";
            } else if (d.freq> 10){
                return "#389393";
            }
        })
        .attr("stroke", "rgba(0,0,0,0.5")
        .attr("stroke-width", "0.5px");

    u.selectAll("text.rightFreq")
        .data(d.values)
        .enter().append("text")
        .attr("x", function(d){
            return x(d.freq)+148;
        })
        .attr("y", function(d){
            return y(d.year)+13;
        })
        .attr("font-size","13px")
        .attr("text-anchor","end")
        .style("fill","#fff")
        .style("font-family","'Atlas Grotesk Web','Atlas Grotesk Web',Helvetica,Arial,sans-serif")
        .style("font-weight","bolder")
        .attr("class", "rightFreq")
        .text(function(d){ return d.freq; });


    // left chart
    u
        .selectAll("rect.left")
        .data(d.values)
        .enter()
        .append("rect")
        .merge(u)
        .attr("x", function(d){
            return 0;
        })
        .attr("y", function(d){
            return y(d.year);
        })
        .attr("class","songs-frequency-left")
        .transition()
        .duration(1000)
        .attr("width", function(d){return xLeft(d.num); })
        .attr("x", function(d){
            return chartWidth - xLeft(d.num) - 398;
        })
        .attr("height", y.bandwidth())
        .attr("fill", function(d){
            // return "#5c6e91";
            if (d.num <= 10){
                return "#c65f63";
            } else if ((d.num>10) && (d.num<=30)){
                return "#84577c";
            } else if (d.num> 30){
                return "#333644";
            }
        })
        .attr("stroke", "rgba(0,0,0,0.5")
        .attr("stroke-width", "0.5px");


    u.selectAll("text.leftNum")
        .data(d.values)
        .enter().append("text")
        .attr("x", function(d){
            return chartWidth - xLeft(d.num) - 380;
        })
        .attr("y", function(d){
            return y(d.year) + 13;
        })
        .attr("font-size","13px")
        .attr("text-anchor","end")
        .style("fill","#fff")
        .style("font-family","'Atlas Grotesk Web','Atlas Grotesk Web',Helvetica,Arial,sans-serif")
        .style("font-weight","bolder")
        .attr("class", "leftNum")
        .text(function(d){ return d.num; });
}


function updateBarsSix(){
    var svg = d3.select("#songs_frequency").select("svg");
    svg.transition().duration(500).remove();

    var u = d3.select("#songs_frequency")
    .append("svg")
    .attr("class","songs_frequency_chart_06")
    .attr("width", "758px")
    .attr("height", "1000px")
    .selectAll("g")
        .data(data.filter(function(d){
            // return (d.key=='周杰伦_0_0') || (d.key=='张杰_0_1');
            return (d.key=='周深_2_2') || (d.key=='张碧晨_2_3') || (d.key=='毛不易_3_1') || (d.key=='蔡徐坤_3_3');
        }));

    u.enter()
        .append("g")
        .merge(u)
        .style("fill","#3d7ea6")
        .each(updateBarSix)
        .each(updateLabel)
        // .each(updateLeftLabel)
        // .each(updateRightLabel)
        .each(updateAxisSix);

    u.exit().remove();

    console.log("updatechartFour")

}

function updateBarsSeven(){
    var svg = d3.select("#songs_frequency").select("svg");
    svg.transition().duration(500).remove();

}



/*
    Scrollama
*/
var main = d3.select("main");
var scrolly = main.select("#scrolly");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");

// initialize the scrollama
var scroller = scrollama();

// generic window resize listener event
function handleResize() {
    // 1. update height of step elements
    var stepH = Math.floor(window.innerHeight * 0.65);
        step.style("height", stepH + "px");

    var figureHeight = window.innerHeight / 2;
    var figureMarginTop = (window.innerHeight - figureHeight) / 2;

    figure
        .style("height", figureHeight + "px")
        .style("top", figureMarginTop + "px");

    // 3. tell scrollama to update new element dimensions
    scroller.resize();
}


let activationFunctions = [
    // updateBarsInit,
    updateBarsOne,
    updateBarsTwo,
    updateBarsThree,
    updateBarsFour,
    updateBarsFive,
    updateBarsSix,
    updateBarsSeven,
]

let lastIndex, activeIndex = 0;

// scrollama event handlers
function handleStepEnter(response) {
    console.log(response);
    // response = { element, direction, index }

    activationFunctions[response.index]();
    activeIndex = response.index + 1;

    console.log(activationFunctions[response.index]);
    // chartName = allChartNames[response.index];
    // clean(chartName);
    // console.log(chartName)

}

function setupStickyfill() {
    d3.selectAll(".sticky").each(function() {
        Stickyfill.add(this);
    });
}

function init() {
    updateBarsInit();

    setupStickyfill();

    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize();

    // 2. setup the scroller passing options
    // 		this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller
        .setup({
            step: "#scrolly article .step",
            offset: 0.6,
            // debug: true
        })
        .onStepEnter(handleStepEnter);

    // setup resize event
    window.addEventListener("resize", handleResize);

}


d3.csv("assets/data/songs_frequency_data.csv", function(error, csv){
    data = d3.nest()
        .key(function(d){ return d.singer_index; })
        .entries(csv);

    // kick things off
    // init(data);
    // updateBars();
    init();

})



/*
   All Chart
*/
// 生成多个bar charts
var chartWidthAll = 200;
var chartHeightAll = 200;


function updateBarAll(d,i){

    var x = d3.scaleLinear()
        .domain([0, 30])
        .range([0, chartWidthAll/2]);

    var xLeft = d3.scaleLinear()
        .domain([0, 100])
        .range([0, chartWidthAll/2]);

    var y = d3.scaleBand()
        .range([0, chartHeightAll])
        .domain([2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019])
        .padding(.3);


    var u = d3.select(this)
        .attr("transform", function(d){
            // console.log(d.key.split("_")[1]*20)
            if ((d.key.split("_")[2]==0) && (d.key.split("_")[1] ==0)){
                return "translate(10,50)";
            } else if (d.key.split("_")[2]==0){
                return "translate(10," + d.key.split("_")[1]*320 + ")";
            } else if (d.key.split("_")[1] ==0){
                return "translate(" + d.key.split("_")[2]*200 + ",50)";
            } else {
                return "translate(" + d.key.split("_")[2]*200 + "," + d.key.split("_")[1]*320 + ")";
            }
        });


    // right chart
    u.selectAll("rect.right")
        .data(d.values)
        .enter()
        .append("rect")
        .merge(u)
        .attr("x", x(0) + 130)
        .attr("y", function(d){
                return y(d.year);
        })
        .attr("height", y.bandwidth())
        .transition()
        .duration(1000)
        .attr("width", function(d){return x(d.freq); })
        .attr("fill", function(d){
            if (d.freq <= 5){
                return "#f5a25d";
            } else if ((d.freq>5) && (d.freq<=10)){
                return "#fa7f72";
            } else if (d.freq> 10){
                return "#389393";
            }
        })
        .attr("stroke", "rgba(0,0,0,0.5")
        .attr("stroke-width", "0.5px");

    // repeatRight();

    // function repeatRight(){

    //     timeBarRight
    //         .attr("y", function(d){
    //             return y(d.year);
    //         })
    //         // .attr("class",function(d){ return d.singer + d.year; })
    //         .attr("height", y.bandwidth())
    //         .transition()
    //         .duration(1000)
    //         .attr("width", function(d){return x(d.freq); })
    //         .delay(1000)
    //         // .delay(function(d,i){console.log(i) ; return(i*50)})
    //         .transition()
    //         .duration(1000)
    //         .attr("width", function(d){return 8; })
    //         .on("end", repeatRight);
    // };



    // left chart
    u.selectAll("rect.left")
            .data(d.values)
            .enter()
            .append("rect")
            .merge(u)
            .attr("x", function(d){
                return x(0);
            })
            .attr("y", function(d){
                return y(d.year);
            })
            // .attr("class","songs-frequency-left")
            .transition()
            .duration(1000)
            .attr("width", function(d){return xLeft(d.num); })
            .attr("x", function(d){
                return chartHeightAll - xLeft(d.num) - 98;
            })
            .attr("height", y.bandwidth())
            .attr("fill", function(d){
                // return "#5c6e91";
                if (d.num <= 10){
                    return "#c65f63";
                } else if ((d.num>10) && (d.num<=30)){
                    return "#84577c";
                } else if (d.num> 30){
                    return "#333644";
                }
            })
            .attr("stroke", "rgba(0,0,0,0.5")
            .attr("stroke-width", "0.5px");
    
}


function updateAxisAll(d){

    var x = d3.scaleLinear()
        .domain([0, 30])
        .range([0, chartHeightAll/2]);

    // var xLeft = d3.scaleLinear()
    //     .domain([100, 0])
    //     .range([chartWidth/2, 0]);

    var y = d3.scaleBand()
        .range([0, chartHeightAll])
        .domain([2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019])
        .padding(.3);

    var u = d3.select(this)
        .append("g")
        .attr("class","song-freq-chartAll-axis")
        .attr("transform", "translate(97,0)")
        .call(d3.axisRight(y)
            .tickValues(
                [2000,2005,2010,2015,2019]
            )
        )
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick line")
            .remove());

}




function updateLabelAll(d){
    var el = d3.select(this)
        .select("text.labelAll");

    if(el.empty()){
        el = d3.select(this)
            .append("text")
            .attr("x", 118)
            .attr("y", function(d){
                return -15;
            })
            .style("font-weight","bold")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .style("fill","#777");
    }

    el.text(d.key.split("_")[0]);
}

function updateBarsAll(){
    var u = d3.select("#songs_frequency_all")
        .append("svg")
        .attr("width", "1000px")
        .attr("height", "1200px")
    .selectAll("g")
        .data(data);

    u.enter()
        .append("g")
        .merge(u)
        .style("fill","#3d7ea6")
        .each(updateBarAll)
        .each(updateLabelAll)
        .each(updateAxisAll);

    u.exit().remove();
}


d3.csv("assets/data/songs_frequency_data.csv", function(error, csv){
    data = d3.nest()
        .key(function(d){ return d.singer_index; })
        .entries(csv);

    // kick things off
    // init(data);
    updateBarsAll();

})
