// square attributes
var tileWidth = 40;
var tileHeight = 10;
var tilePadding = 90;
var tileTopPadding = 50;
var rectPerRow = 10;


function initializeData(){
    data = d3.nest()
        .key(function(d){ return d.group;})
        .entries(data);
}

var markTransform = [20, 170, 320, 470, 620, 770];
var groupNames = ['A','B','C','D','E','F'];
var rectTypes = ['个人知识','科技','性别','影视','杂七杂八','政治'];
var color = d3.scaleOrdinal().domain(rectTypes)
  .range(["#fff393","#4eb4f9","#ffd7ea","#ff9773","#00dd90","#f1ffcf"]);

// episode tooltip
var div = d3.select("body")
        .append("div")
        .attr("class","episode-tooltip")
        .style("position","absolute")
        .style("display", "none");



// data visualization legend
// 这就画这就画

function makeLegend(){
    var svg = d3.select("#graphic-legend")
        .append("svg")
        .attr("height","50")
        .attr("width","1000")
        .attr("transform","translate(100,0)")
        .data(data);

    svg
        .append("text")
        .attr("x", 120)
        .attr("y", 30) 
        .attr("dy", ".35em") 
        .text("播客类别：")
        .style("font-family","roboto")
        .style("font-size","12px");

    // 第一个圆圈
    svg
        .append("circle")
        .style("fill","#fff393")
        .attr("cx", 200)
        .attr("cy", 30)
        .attr("r", 10);

    svg
        .append("text")
        .attr("x", 215)
        .attr("y", 30) 
        .attr("dy", ".35em") 
        .text("个人知识")
        .style("font-family","roboto")
        .style("font-size","12px");

    // 第二个圆圈
    svg
        .append("circle")
        .style("fill","#4eb4f9")
        .attr("cx", 300)
        .attr("cy", 30)
        .attr("r", 10);

    svg
        .append("text")
        .attr("x", 315)
        .attr("y", 30) 
        .attr("dy", ".35em") 
        .text("科技")
        .style("font-family","roboto")
        .style("font-size","12px");


    // 第三个圆圈
    svg
        .append("circle")
        .style("fill","#ffd7ea")
        .attr("cx", 370)
        .attr("cy", 30)
        .attr("r", 10);

    svg
        .append("text")
        .attr("x", 385)
        .attr("y", 30) 
        .attr("dy", ".35em") 
        .text("性别")
        .style("font-family","roboto")
        .style("font-size","12px");

    // 影视
    // #ff977
    svg
        .append("circle")
        .style("fill","#ff9773")
        .attr("cx", 440)
        .attr("cy", 30)
        .attr("r", 10);

    svg
        .append("text")
        .attr("x", 455)
        .attr("y", 30) 
        .attr("dy", ".35em") 
        .text("影视")
        .style("font-family","roboto")
        .style("font-size","12px");


    // 杂七杂八
    // #00dd90
    svg
        .append("circle")
        .style("fill","#00dd90")
        .attr("cx", 510)
        .attr("cy", 30)
        .attr("r", 10);

    svg
        .append("text")
        .attr("x", 525)
        .attr("y", 30) 
        .attr("dy", ".35em") 
        .text("杂七杂八")
        .style("font-family","roboto")
        .style("font-size","12px");

    // // 政治
    // // #f1ffcf
    svg
        .append("circle")
        .style("fill","#f1ffcf")
        .attr("cx", 610)
        .attr("cy", 30)
        .attr("r", 10);

    svg
        .append("text")
        .attr("x", 625)
        .attr("y", 30) 
        .attr("dy", ".35em") 
        .text("政治")
        .style("font-family","roboto")
        .style("font-size","12px");


}


// data visualization
// 画出目前听完的时长
function makeListened(d,i){

    var chart = d3.select(this)
        .attr("transform", function(d){
            var a = groupNames.indexOf(d.key);
            return "translate(50," + markTransform[a] + ')'
        })
        .selectAll(".dots")
        .data(d.values);

    chart.enter()
        .append("rect")
        .attr("class",function(d){
            return d.group + '-' + d.name + '-listened';
        })
        .attr("x", function(d,i){
            return i%rectPerRow * tilePadding - 20;
        })
        .attr("width", 51)
        .attr("y", function(d,i){
            var rowNumber = Math.floor(i / rectPerRow);
            return  (rowNumber) * tileTopPadding - 10;
        })
        .attr("height", function(d,i){
            return d.listened;
        })
        .on("mouseover", function(d){
            d3.select(this)
            .transition()
            .duration('300')
            .attr("fill","#f46d6d");

            div.transition()
                .duration('300')
                .style("display","inline");

            div.html(d.name)
                .style("left", (d3.event.pageX - 35) + "px")
                .style("top", (d3.event.pageY - 34) + "px")
                .style("background-color","#fff");
        })
        .on("mouseout", function(d){
            d3.select(this)
            .transition()
            .duration('1000')
            .attr("fill","#f0d4a2");

            div.transition()
            .duration('300')
            .style("display","none");
        })
        .style("fill-opacity", "0")
        .style("stroke","#000")
        .style("stroke-width", "2")
        .style('stroke-dasharray',"3 3")
        .style("opacity","1");

    chart.enter()
        .append("text")
        .attr("x", function(d,i){
                return i%rectPerRow * tilePadding - 20;
        })
        .attr("y", function(d,i){
            // console.log(d)
            return d.listened; // 听完时长
        }) 
        .attr("dy", ".35em") 
        .text(function(d,i) { 
            if (i == 0) {
                return d.listened + "分钟"; 
            } else if (i==9){
                return d.listened + "分钟"; 
            } else {
                return d.listened;
            }
        })
        .style("font-family","roboto")
        .style("font-size","12px");


    // for legend - 竖着的
    chart.enter()
        .append("text")
        .attr("x", function(d,i){
                return i%rectPerRow * tilePadding - 35;
        })
        .attr("y", function(d,i){
            return i%rectPerRow * tilePadding - 5; // 听完时长
        }) 
        .attr("dy", ".35em") 
        .text("听")
        .text(function(d,i) { 
            if (i == 0) {
                return "听"; 
            }
        })
        .style("font-family","roboto")
        .style("font-size","12px");

    chart.enter()
        .append("text")
        .attr("x", function(d,i){
                return i%rectPerRow * tilePadding - 35;
        })
        .attr("y", function(d,i){
            return i%rectPerRow * tilePadding + 8; // 听完时长
        }) 
        .attr("dy", ".35em") 
        .text("听")
        .text(function(d,i) { 
            if (i == 0) {
                return "完"; 
            }
        })
        .style("font-family","roboto")
        .style("font-size","12px");


    chart.enter()
        .append("text")
        .attr("x", function(d,i){
                return i%rectPerRow * tilePadding - 35;
        })
        .attr("y", function(d,i){
            return i%rectPerRow * tilePadding + 21; // 听完时长
        }) 
        .attr("dy", ".35em") 
        .text("听")
        .text(function(d,i) { 
            if (i == 0) {
                return "时"; 
            }
        })
        .style("font-family","roboto")
        .style("font-size","12px");


    chart.enter()
        .append("text")
        .attr("x", function(d,i){
                return i%rectPerRow * tilePadding - 35;
        })
        .attr("y", function(d,i){
            return i%rectPerRow * tilePadding + 34; // 听完时长
        }) 
        .attr("dy", ".35em") 
        .text("听")
        .text(function(d,i) { 
            if (i == 0) {
                return "长"; 
            }
        })
        .style("font-family","roboto")
        .style("font-size","12px");



    chart.exit().remove();
}



// 画出每集播客的总时长
function makeRect(d,i){

    // draw the chart!
    var chart = d3.select(this)
        .attr("transform", function(d){
            var a = groupNames.indexOf(d.key);
            return "translate(50," + markTransform[a] + ')'
        })
        .selectAll(".dots")
        .data(d.values);

    chart.enter()
        .append("rect")
        .attr("class",function(d){
            return d.group + '-' + d.name + '-total';
        })
        .attr("x", function(d,i){
            return i%rectPerRow * tilePadding - 20;
        })
        .attr("width", 50)
        .attr("y", function(d,i){
            var rowNumber = Math.floor(i / rectPerRow);
            return  (rowNumber) * tileTopPadding - 10;
        })
        .attr("height", function(d,i){
            return d.length;
        })
        .on("mouseover", function(d){
            d3.select(this)
            .transition()
            .duration('300')
            .attr("fill","#f46d6d");

            div.transition()
                .duration('300')
                .style("display","inline");

            div.html(d.name)
                .style("left", (d3.event.pageX - 35) + "px")
                .style("top", (d3.event.pageY - 34) + "px")
                .style("background-color","#fff");
        })
        .on("mouseout", function(d){
            d3.select(this)
            .transition()
            .duration('1000')
            .attr("fill","#f0d4a2");

            div.transition()
            .duration('300')
            .style("display","none");
        })
        .style('fill',function(d){
            return color(d.type);
        })
        .style("opacity","1");

    chart.enter()
        .append("text")
        .attr("x", function(d,i){
            return i%rectPerRow * tilePadding - 20;
        })
        .attr("y", function(d,i){
            // console.log(d)
            return d.length;
        })
        .attr("dy", ".35em") // 单集时长
        .text(function(d,i) { 
            if (i == 0) {
                return d.length + "分钟"; 
            } else if (i==9){
                return d.length + "分钟"; 
            } else {
                return d.length;
            }
        })
        .style("font-family","roboto")
        .style("font-size","12px");


    // for legend - 竖着的
    chart.enter()
        .append("text")
        .attr("x", function(d,i){
                return i%rectPerRow * tilePadding + 32;
        })
        .attr("y", function(d,i){
            if (d.name == '互联网“打工人”的“囚徒困境”怎么解？'){
                return 44 - 13 - 13;
            } else if (d.name == '詹青云：性别意识有了就不会再消失，判断是非需要法律更需要人性'){
                return 37 - 13 - 13;
            } else if (d.name == '被绞杀的真相，被议论的女人们'){
                return 28 - 13 - 13;
            } else if (d.name == 'All Podcasts Are Political'){
                return 26 - 13 - 13;
            } else if (d.name == '沈大成对话葛宇路：小职员作家的人生信条'){
                return 75 - 13 - 13;
            } else {
                return i%rectPerRow * tilePadding - 5;
            }
        }) 
        .attr("dy", ".35em") 
        .text(function(d,i) { 
            if (i == 0) {
                return "单"; 
            }
        })
        .style("font-family","roboto")
        .style("font-size","12px");

    chart.enter()
        .append("text")
        .attr("x", function(d,i){
            return i%rectPerRow * tilePadding + 32;
    })
        .attr("y", function(d,i){
            if (d.name == '互联网“打工人”的“囚徒困境”怎么解？'){
                return 44 - 13;
            } else if (d.name == '詹青云：性别意识有了就不会再消失，判断是非需要法律更需要人性'){
                return 37 - 13;
            } else if (d.name == '被绞杀的真相，被议论的女人们'){
                return 28 - 13;
            } else if (d.name == 'All Podcasts Are Political'){
                return 26 - 13;
            } else if (d.name == '沈大成对话葛宇路：小职员作家的人生信条'){
                return 75 - 13;
            } else {
                return i%rectPerRow * tilePadding + 8;
            }
        }) 
        .attr("dy", ".35em") 
        .text(function(d,i) { 
            if (i == 0) {
                return "集"; 
            }
        })
        .style("font-family","roboto")
        .style("font-size","12px");


    chart.enter()
        .append("text")
        .attr("x", function(d,i){
            return i%rectPerRow * tilePadding + 32;
    })
        .attr("y", function(d,i){
            if (d.name == '互联网“打工人”的“囚徒困境”怎么解？'){
                return 44;
            } else if (d.name == '詹青云：性别意识有了就不会再消失，判断是非需要法律更需要人性'){
                return 37;
            } else if (d.name == '被绞杀的真相，被议论的女人们'){
                return 28;
            } else if (d.name == 'All Podcasts Are Political'){
                return 26;
            } else if (d.name == '沈大成对话葛宇路：小职员作家的人生信条'){
                return 75;
            } else {
                return i%rectPerRow * tilePadding + 21;
            }
        }) 
        .attr("dy", ".35em") 
        .text(function(d,i) { 
            if (i == 0) {
                return "时"; 
            }
        })
        .style("font-family","roboto")
        .style("font-size","12px");


    chart.enter()
        .append("text")
        .attr("x", function(d,i){
            return i%rectPerRow * tilePadding + 32;
    })
        .attr("y", function(d,i){ // 单集时长
            if (d.name == '互联网“打工人”的“囚徒困境”怎么解？'){
                return 57;
            } else if (d.name == '詹青云：性别意识有了就不会再消失，判断是非需要法律更需要人性'){
                return 50;
            } else if (d.name == '被绞杀的真相，被议论的女人们'){
                return 41;
            } else if (d.name == 'All Podcasts Are Political'){
                return 39;
            } else if (d.name == '沈大成对话葛宇路：小职员作家的人生信条'){
                return 88;
            } else {
                return i%rectPerRow * tilePadding + 34;
            }
        }) 
        .attr("dy", ".35em") 
        .text(function(d,i) { 
            if (i == 0) {
                return "长"; 
            }
        })
        .style("font-family","roboto")
        .style("font-size","12px");



    chart.exit().remove();

}


function makeCharts(){

    var u = d3.select("#graphic")
        .append("svg")
        .attr("height","920")
        .attr("width","1000")
        .attr("transform","translate(100,0)")
        .selectAll("g")
        .data(data);

    u.enter()
        .append("g")
        .merge(u)
        .each(makeRect) // 画出每集播客的总时长
        .each(makeListened); // 画出目前听完的时长

    u.exit().remove();
}



d3.csv("assets/data/202106/unlistened-podcast.csv", function(err, csv){
    data = csv;
    initializeData();
    makeCharts();
    makeLegend();
})

