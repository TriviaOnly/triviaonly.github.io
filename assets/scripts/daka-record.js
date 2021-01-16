// circles attributes
var tileWidth = 40;
var tileHeight = 10;
var tilePadding = 20;
var tileTopPadding = 30;
var tileMonthPadding = 100;
var rectPerRow = 15;
// var rowNumber = 13;

// bars attributes
var barWidth = 40;

var colorSet = ["#fff", '#000', "#edc493"]
// 白色，黑色，圆圈的颜色，

function initializeData(){
    data = data.map(function(d){
        return {
            replyDate: d.reply_date,
            bookName: d.book_name,
            replyLength: +d.content_length,
            totalPage: +d.total_page,
            replyMonth: d.reply_date.split('-')[1]
        }
    })

    data = d3.nest()
        .key(function(d){return d.bookName; }) // 以月份作为分组
        .entries(data);
    
}



function makeCircle(d,i){
    count = i + 1;

    var chart = d3.select(this)
        .attr("transform","translate(50," + tileMonthPadding*count + ")")
        .selectAll("dot")
        .data(data[i].values);

    var z = d3.scaleLinear()
        .domain([1,355])
        .range([5,tileWidth]);

    chart.enter()
        .append("circle")
        .attr("cx", function(d,i){
            return i%rectPerRow * tilePadding;
            // return i%rectPerRow;
        })
        .attr("cy", function(d,i){
            var rowNumber = Math.floor(i / rectPerRow);
            return  (rowNumber) * tileTopPadding;
        })
        .attr("r", function(d){
            if (d.replyLength == 0){
                return 0;
            } else if (d.replyLength >= 50){
                return 9;
            } else if ((d.replyLength < 50) && (d.replyLength >0)){
                return 7;
            }
        })
        // .style('fill',"#f5c51e")
        .style('fill',function(d){
            if (d.replyLength >= 50){
                return "#F38A00";
            } else if ((d.replyLength < 50) && (d.replyLength >0)){
                return "#f5c51e";
            } else {
                return "None";
            }
        })
        .style("opacity","0.7");


    chart.exit().remove();

}

var markTransform = [100, 170, 240, 340, 410, 480];
var bookNames = ['把自己作为方法','王考','走出唯一真理观','呼吸','XX散文集','傲慢与偏见'];


function makeMark(d,i){
    console.log(data)

    var count = i + 1;

    var chart = d3.select(this)
        .attr("transform", function(d){
            var a = bookNames.indexOf(d.key);
            return "translate(50," + markTransform[a] + ')'
        })
        .selectAll(".dots")
        .data(data[i].values);

    var dots = chart.enter()
        .append("path");

    var symbol = d3.symbol();

    dots.attr("d", symbol.type(function(d){
        if (d.replyLength != 0){
            return d3.symbolCircle;
        } 
        else {
            return d3.symbolCross;
        }
        }))
        .attr("transform", function(d,i){
            var rowNumber = Math.floor(i / rectPerRow);
            return "translate(" + i%rectPerRow * tilePadding + "," + (rowNumber) * tileTopPadding + ") rotate(-45)";
        })
        // .style('fill',function(d){
        //     if (d.replyLength >= 50){
        //         return "#F38A00";
        //     } else if ((d.replyLength < 50) && (d.replyLength >0)){
        //         return "#FAE28E";
        //     } else {
        //         return "None";
        //     }
        // })
        .style("fill","None")
        .style("stroke","#000");

    dots.exit().remove();

}


function makeProgress(d,i){
    var count = i + 1;

    var barScale = d3.scaleLinear()
            .domain([0,100])
            .range([0, barWidth]);

    var chart = d3.select(this)
        // .attr("transform","translate(50," + tileMonthPadding*count + ")")
        .attr("transform", function(d){
            var a = bookNames.indexOf(d.key);
            return "translate(50," + markTransform[a] + ')'
        })
        .selectAll(".dots")
        .data(data[i].values);

    // chart.enter()
    //     .append("rect")
    //     .attr("x", function(d,i){
    //         return i%rectPerRow * tilePadding;
    //     })
    //     .attr("y", function(d,i){
    //         var rowNumber = Math.floor(i / rectPerRow);
    //         return  (rowNumber) * tileTopPadding;
    //     })
    //     .attr("transform","translate(10,-5)")
    //     .style("fill","#000")
    //     .attr("width", function(d){return barScale(d.readingProgress); })
    //     .attr("height", tileHeight);


    // 每逢新书必标注
    chart.enter()
        .append("text")
        .attr("x", function(d,i){
            return i%rectPerRow * tilePadding - 6;
        })
        .attr("y", function(d,i){
            var rowNumber = Math.floor(i / rectPerRow);
            return  (rowNumber) * tileTopPadding - 20;
        })
        .attr("class","book-names")
        .text(function(d){
            if ((d.bookName != "0") && (d.replyDate == "2020-08-01" || d.replyDate == "2020-08-05" || d.replyDate=='2020-09-05' || d.replyDate == "2020-08-15" || d.replyDate == "2020-09-14" || d.replyDate == "2020-09-21")){
                return d.bookName; 
            } 
        });

    
    // 标注这本书的页数后面的黑箱子
    chart.enter()
        .append("rect")
        .attr("x", function(d,i){
            var bookname = d.bookName;
            return bookname.length*18 - 13;
        })
        .attr("y", -30)
        .attr("transform","translate(10,-5)")
        .style("fill","#000")
        .attr("width", 30)
        .attr("height", 20);


    // 标注这本书的页数
    chart.enter()
        .append("text")
        .attr("x", function(d,i){
            var bookname = d.bookName;
            return bookname.length*18;
        })
        .attr("y", function(d,i){
            var rowNumber = Math.floor(i / rectPerRow);
            return  (rowNumber) * tileTopPadding - 20;
        })
        .attr("class","book-pages")
        .text(function(d){
            if ((d.bookName != "0") && (d.replyDate == "2020-08-01" || d.replyDate == "2020-08-05" || d.replyDate=='2020-09-05' || d.replyDate == "2020-08-15" || d.replyDate == "2020-09-14" || d.replyDate == "2020-09-21")){
                return d.totalPage; 
            } 
        })
        .style("fill","#fff");


    

    // progress text
    // chart.enter()
    //     .append("text")
    //     .attr("x", function(d,i){
    //         return i%rectPerRow * tilePadding + barScale(d.readingProgress) + 15;
    //     })
    //     .attr("y", function(d,i){
    //         var rowNumber = Math.floor(i / rectPerRow);
    //         return  (rowNumber) * tileTopPadding + 2.5;
    //     })
    //     .attr("class","progress-pages")
    //     .text(function(d){ 
    //         if (d.readingProgress != 0){
    //             return d.readingProgress; 
    //         } 
    //     });

    chart.exit().remove();

}


// function addLegend(d){

//     var el = d3.select(this)
//     .select("text");

//     if(el.empty()) {
//         el = d3.select(this)
//         .append("text")
//         .attr("x", 180)
//         .attr("y", -30)
//         .style("font-weight", "700")
//         .style("text-anchor", "left")
//         .style("font-size", "20px")
//         .style("font-family","'Noto Sans', sans-serif")
//         .style("fill", "#000");
//     }

//     let label = d.values[0].replyDate.split('-')[1] + "月";
//     el.text(label);
// }


function makeCharts(){
    // console.log(data)

    var u = d3.select("#chart")
        .select("svg")
        .selectAll("g")
        .data(data);

    u.enter()
        .append("g")
        .merge(u)
        .each(makeCircle)
        .each(makeMark)
        // .each(addLegend)
        .each(makeProgress);
        // .each(drawLines);

    u.exit().remove();
}



d3.csv("data/reading_example3.csv", function(err, csv) {
  data = csv;

//   console.log(data)

  initializeData();
  makeCharts();

});