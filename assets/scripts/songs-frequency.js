var isMobile = window.screen.width < 420 ? true : false

if (isMobile){
    d3.select("#scrolly").style("display","None");
    d3.select("#songs_frequency_all .chart-title").style("display","None");
    d3.select("#songs_frequency_all").text("still working on the mobile version...").style("color","red").style("font-size","50px");

} else {


            // bar charts
            var chartPerRow = 5;
            var chartWidth = 500;
            var chartHeight = 500;
            var chartPadding = 10;
            var margin = {top:20, right:30, bottom:40, left:90};

            var tileSize = 10;
            var tilePadding = 1;

            /*
                Scroll Chart
            */

           function getTiles(d) {
            //    console.log(d.values)
            //    console.log(d.values.length)
            //    console.log(d.key)

                var tiles = [];
                
                for (var i=0; i<d.values.length; i++){
                    tiles.push({
                        x: d.key,
                        y: i,
                        type: d.values[i].type,
                    });
                }
                
                return tiles;
            }

            function updateBars(d, i){
                // console.log(d)
                // console.log(d.num)


                var tiles = getTiles(d);
                // console.log(tiles)

                var x = d3.scaleBand()
                    .range([0, chartHeight])
                    .domain([2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019])
                    .padding(.3);

                var xLeft = d3.scaleLinear()
                    .domain([0, 100])
                    .range([0, chartWidth]);

                var y = d3.scaleLinear()
                    .domain([0, 30])
                    .range([0, chartHeight/2]);                


                var u = d3.select(this)
                    .attr("transform", "translate(0,150)")
                    .selectAll("rect")
                    .data(tiles);

                u.enter()
                    .append("rect")
                    .style("stroke", "white")
                    .style("stroke-width", "1")
                    .style("shape-rendering", "crispEdges")
                    .merge(u)
                    .attr("x", function(d){
                        return x(d.x)
                    })
                    .transition()
                    .duration(1000)
                    .attr("y", function(d){
                        return y(d.y)
                    })
                    .style("fill", function(d, i) {
                        if (d.type=='专辑'){
                            return "#ee6f57";
                        } else if (d.type=="商业"){
                            return "#6a2c70";
                        } else if (d.type=="翻唱"){
                            return "#ffd57e";
                        }
                    })
                    .attr("width", tileSize*2)
                    .attr("height", tileSize);

                u.exit().remove();
                
            }


            function updateBar(freq,num){

                // console.log(freq)
                console.log(num)

                // scale
                var x = d3.scaleBand()
                    .range([0, chartHeight])
                    .domain([2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019])
                    .padding(.3);

                var xLeft = d3.scaleLinear()
                    .domain([0, 100])
                    .range([0, chartWidth]);

                var y = d3.scaleLinear()
                    .domain([0, 30])
                    .range([0, chartHeight/2]);                

                /*
                Downside chart
                */
               var svg = d3.select("#songs_frequency")
                .append("svg")
                .attr("width", "1000px")
                .attr("height", "800px")
                .append("g")
                .attr("transform", function(d){
                    return "translate(300,50)"
                })


               svg.selectAll(".bar")
                    .data(num[0].values)
                    .enter()
                    .append("g")
                    .merge(svg)
                    .attr("class","downsideBar")
                    .each(updateBars);


                // Downside - Label
                var rightLabel = svg.select("text.rightLabel");

                if(rightLabel.empty()){
                    rightLabel = svg.append("text")
                        .attr("x", -100)
                        .attr("y", function(d){
                            return 159;
                        })
                        .style("font-weight","regular")
                        .style("text-anchor", "left")
                        .style("font-size", "13px")
                        .style("fill","#888");
                }

                rightLabel.text("歌曲数量");


                // chart axis
                svg
                    .append("g")
                    .attr("class","song-freq-chart-axis")
                    .attr("transform", "translate(0,110)")
                    .call(d3.axisBottom(x)
                        .tickValues(
                            [2000,2005,2010,2015,2019]
                        )
                    )
                    .call(g => g.select(".domain")
                        .remove())
                    .call(g => g.selectAll(".tick line")
                        .remove());

                // chart name
                var textName = svg.select("text.textName");

                if(textName.empty()){
                    textName = svg.append("text")
                        .attr("x", -73)
                        .attr("y", 75)
                        .style("font-weight","bold")
                        .style("text-anchor", "middle")
                        .style("font-size", "20px")
                        .style("fill","#000");
                }

                textName.text(num[0].key.split("_")[0]);

                // downside-lengend
                // http://jsbin.com/ubafur/3/edit?html,js,output
                var legend = svg.append("g")
                    .attr("class","legend-box");

                // 影视
                legend
                    .append('rect')
                    .attr("class","legend")
                    .attr("x",-100)
                    .attr("y",250)
                    .attr("width", 20)
                    .attr("height", 10)
                    .style("fill","#ee6f57")
                    .style("stroke","#fff");

                legend
                    .append('text')
                    .attr("class","legend")
                    .attr("x",-73)
                    .attr("y",257)
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888")
                    .text("专辑");

                // 主题曲营业类
                legend
                    .append('rect')
                    .attr("class","legend")
                    .attr("x",-100)
                    .attr("y",280)
                    .attr("width", 20)
                    .attr("height", 10)
                    .style("fill","#6a2c70")
                    .style("stroke","#fff");

                legend
                    .append('text')
                    .attr("class","legend")
                    .attr("x",-73)
                    .attr("y",287)
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888")
                    .text("商业");

                // 其它
                legend
                    .append('rect')
                    .attr("class","legend")
                    .attr("x",-100)
                    .attr("y",310)
                    .attr("width", 20)
                    .attr("height", 10)
                    .style("fill","#ffd57e")
                    .style("stroke","#fff");

                legend
                    .append('text')
                    .attr("class","legend")
                    .attr("x",-73)
                    .attr("y",317)
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888")
                    .text("翻唱/重制");

                /*
                Upside chart
                */

                // newFreq = freq[0];

                var x_list = [];
                var rad_list =  [];

                freq.forEach(function(d){
                    d.values.forEach(function(d){
                        x_list.push(x(d.year))
                        rad_list.push(d.freq*10)
                    })
                    // return d;
                    // console.log(d) 
                });

                var arc = d3.arc();

                var halfcircle = function(x,y,rad, innerRad){
                    return svg.append("path")
                    .attr("transform", 'translate(' + [x,y] + ')' )
                    .attr("d", arc({
                        innerRadius: innerRad,
                        outerRadius: rad,
                        startAngle: Math.PI*0.5,
                        endAngle: -Math.PI*0.5
                    }));
                };

                x_list.forEach(function(x_num, i){
                    
                    const x = x_num + 10;
                    const rad = rad_list[i];
                    const y = 100;
                    const innerRad = 0;
                    // console.log(y, rad)

                    var circles = halfcircle(x,y,rad, innerRad)
                        .attr("class","upsideCircle")
                        .style('opacity', 0.1)
                        .style("stroke","#fff")
                        .style("fill","#070d59");

                    // if (rad<50){
                    //     circles.style("fill","#070d59");
                    // } else if (rad >= 50){
                    //     circles.style("fill","#1717ff");
                    // }
                });
                // https://bl.ocks.org/gka/1623794a83a5daf18df0d93aa815fca7


                // Upside - label
                var leftLabel = svg.select("text.leftLabel");

                if(leftLabel.empty()){
                leftLabel = svg.append("text")
                    .attr("x", -100)
                    .attr("y", function(d){
                        return 100;
                    })
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888");
                }

                leftLabel.text("发行频率");

                // line between axis
                svg.append("line")
                    .style("stroke","black")
                    .attr("x1", -20)
                    .attr("x2", 560)
                    .attr("y1", 100)
                    .attr("y2",100)
                    .style("stroke-width", "2px")
                    .style("fill","#000");

                svg.append("line")
                    .style("stroke","black")
                    .attr("x1", -20)
                    .attr("x2", 560)
                    .attr("y1", 150)
                    .attr("y2",150)
                    .style("stroke-width", "2px")
                    .style("fill","#000");
            }
            // end of update bar (the first chart)



            // update charts after first chart
            function updateBarAfter(freq,num){

                // console.log(freq)
                console.log(num)

                // scale
                var x = d3.scaleBand()
                    .range([0, chartHeight])
                    .domain([2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019])
                    .padding(.3);

                var xLeft = d3.scaleLinear()
                    .domain([0, 100])
                    .range([0, chartWidth]);

                var y = d3.scaleLinear()
                    .domain([0, 30])
                    .range([0, chartHeight/2]);                

                /*
                Downside chart
                */
               var svg = d3.select("#songs_frequency")
               .append("svg")
               .attr("width", "1000px")
               .attr("height", "1000px")
               .append("g")
               .attr("transform", function(d){
                   return "translate(300,50)"
               });


               svg.selectAll(".bar")
                    .data(num[0].values)
                    .enter()
                    .append("g")
                    .merge(svg)
                    .attr("class","downsideBar")
                    .each(updateBars);


                // Downside - Label
                var rightLabel = svg.select("text.rightLabel");

                if(rightLabel.empty()){
                    rightLabel = svg.append("text")
                        .attr("x", -100)
                        .attr("y", function(d){
                            return 159;
                        })
                        .style("font-weight","regular")
                        .style("text-anchor", "left")
                        .style("font-size", "13px")
                        .style("fill","#888");
                }

                rightLabel.text("歌曲数量");


                // chart axis
                svg
                    .append("g")
                    .attr("class","song-freq-chart-axis")
                    .attr("transform", "translate(0,110)")
                    .call(d3.axisBottom(x)
                        .tickValues(
                            [2000,2005,2010,2015,2019]
                        )
                    )
                    .call(g => g.select(".domain")
                        .remove())
                    .call(g => g.selectAll(".tick line")
                        .remove());

                // chart name
                var textName = svg.select("text.textName");

                if(textName.empty()){
                    textName = svg.append("text")
                        .attr("x", -73)
                        .attr("y", 75)
                        .style("font-weight","bold")
                        .style("text-anchor", "middle")
                        .style("font-size", "20px")
                        .style("fill","#000");
                }

                textName.text(num[0].key.split("_")[0]);


                // downside-lengend
                // http://jsbin.com/ubafur/3/edit?html,js,output
                var legend = svg.append("g")
                    .attr("class","legend-box");

                // 影视
                legend
                    .append('rect')
                    .attr("class","legend")
                    .attr("x",-100)
                    .attr("y",250)
                    .attr("width", 20)
                    .attr("height", 10)
                    .style("fill","#ee6f57")
                    .style("stroke","#fff");

                legend
                    .append('text')
                    .attr("class","legend")
                    .attr("x",-73)
                    .attr("y",257)
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888")
                    .text("专辑");

                // 主题曲营业类
                legend
                    .append('rect')
                    .attr("class","legend")
                    .attr("x",-100)
                    .attr("y",280)
                    .attr("width", 20)
                    .attr("height", 10)
                    .style("fill","#6a2c70")
                    .style("stroke","#fff");

                legend
                    .append('text')
                    .attr("class","legend")
                    .attr("x",-73)
                    .attr("y",287)
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888")
                    .text("商业");


                // 其它
                legend
                    .append('rect')
                    .attr("class","legend")
                    .attr("x",-100)
                    .attr("y",310)
                    .attr("width", 20)
                    .attr("height", 10)
                    .style("fill","#ffd57e")
                    .style("stroke","#fff");

                legend
                    .append('text')
                    .attr("class","legend")
                    .attr("x",-73)
                    .attr("y",317)
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888")
                    .text("翻唱/重制");


                /*
                Upside chart
                */

                // newFreq = freq[0];

                var x_list = [];
                var rad_list =  [];

                freq.forEach(function(d){
                    d.values.forEach(function(d){
                        x_list.push(x(d.year))
                        rad_list.push(d.freq*10)
                    })
                    // return d;
                    // console.log(d) 
                });

                var arc = d3.arc();

                var halfcircle = function(x,y,rad, innerRad){
                    return svg.append("path")
                    .attr("transform", 'translate(' + [x,y] + ')' )
                    .attr("d", arc({
                        innerRadius: innerRad,
                        outerRadius: rad,
                        startAngle: Math.PI*0.5,
                        endAngle: -Math.PI*0.5
                    }));
                };

                x_list.forEach(function(x_num, i){
                    
                    const x = x_num + 10;
                    const rad = rad_list[i];
                    const y = 100;
                    const innerRad = 0;
                    // console.log(y, rad)

                    var circles = halfcircle(x,y,rad, innerRad)
                        .attr("class","upsideCircle")
                        .style('opacity', 0)
                        .transition()
                        .duration(1000)
                        .style('opacity',0.5)
                        .style("stroke","#fff")
                        .style("fill","#070d59");
                });
                // https://bl.ocks.org/gka/1623794a83a5daf18df0d93aa815fca7


                // Upside - label
                var leftLabel = svg.select("text.leftLabel");

                if(leftLabel.empty()){
                leftLabel = svg.append("text")
                    .attr("x", -100)
                    .attr("y", function(d){
                        return 100;
                    })
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888");
                }

                leftLabel.text("发行频率");

                // line between axis
                svg.append("line")
                    .style("stroke","black")
                    .attr("x1", -20)
                    .attr("x2", 560)
                    .attr("y1", 100)
                    .attr("y2",100)
                    .style("stroke-width", "2px")
                    .style("fill","#000");

                svg.append("line")
                    .style("stroke","black")
                    .attr("x1", -20)
                    .attr("x2", 560)
                    .attr("y1", 150)
                    .attr("y2",150)
                    .style("stroke-width", "2px")
                    .style("fill","#000");
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
                var figureMarginTop = (window.innerHeight - figureHeight) / 4;

                figure
                    .style("height", figureHeight + "px")
                    .style("top", figureMarginTop + "px");

                // 3. tell scrollama to update new element dimensions
                scroller.resize();
            }

            function update1(){
                d3.select("#songs_frequency").select("svg").transition().duration(200).remove();

                var newFreq = freq.filter(function(d){
                    return d.key=='周杰伦_0_0';
                })

                var newNum = num.filter(function(d){
                    return d.key=='周杰伦_0_0';
                })


                updateBar(newFreq, newNum);
                d3.selectAll(".downsideBar").style("opacity",0.1);

                d3.select(".legend-box").style("opacity",0.1);
                // d3.selectAll(".upsideCircle").style("opacity",0);

            }

            function update1_1(){
                
            }

            function update1_up(){
                d3.selectAll(".downsideBar").transition().duration(1000).style("opacity",0.1);

                d3.select(".legend-box").transition().duration(1000).style("opacity",0.1);
                
            }

            function update2(){
                d3.selectAll(".downsideBar").transition().duration(1000).style("opacity",1);
                d3.select(".legend-box").transition().duration(1000).style("opacity",1);

                d3.selectAll(".upsideCircle").transition().duration(1000).style("opacity",0.1);
            }

            function update2_up(){
                d3.selectAll(".upsideCircle").transition().duration(1000).style("opacity",0.1);

                d3.selectAll(".downsideBar").transition().duration(1000).style("opacity",1);
                d3.select(".legend-box").transition().duration(1000).style("opacity",1);
            }

            function update3(){
                d3.selectAll(".upsideCircle").transition().duration(1000).style("opacity",0.5);

                d3.selectAll(".downsideBar").transition().duration(1000).style("opacity",0.1);
                d3.select(".legend-box").transition().duration(1000).style("opacity",0.1);
            }

            function update3_up(){
                d3.select("#songs_frequency").select("svg").transition().duration(200).remove();

                var newFreq = freq.filter(function(d){
                    return d.key=='周杰伦_0_0';
                })

                var newNum = num.filter(function(d){
                    return d.key=='周杰伦_0_0';
                })

                updateBar(newFreq, newNum);

                d3.selectAll(".upsideCircle").transition().duration(1000).style("opacity",0.5);
                d3.selectAll(".downsideBar").transition().duration(1000).style("opacity",0.1);
                // d3.select(".legend-box").transition().duration(1000).style("opacity",0.1);

            }

            function update4(){
                d3.select("#songs_frequency").select("svg").transition().duration(200).remove();

                var newFreq = freq.filter(function(d){
                    return d.key=='林宥嘉_1_2';
                })

                var newNum = num.filter(function(d){
                    return d.key=='林宥嘉_1_2';
                })

                updateBarAfter(newFreq, newNum);
            }

            function update5(){
                d3.select("#songs_frequency").select("svg").transition().duration(200).remove();

                d3.selectAll(".upsideCircle").transition().duration(1000).style("opacity",0.5);

                var newFreq = freq.filter(function(d){
                    return d.key=='张杰_0_1';
                })

                var newNum = num.filter(function(d){
                    return d.key=='张杰_0_1';
                })

                updateBarAfter(newFreq, newNum);
            }

            function update6(){
                d3.select("#songs_frequency").select("svg").transition().duration(200).remove();

                d3.selectAll(".upsideCircle").transition().duration(1000).style("opacity",0.5);

                var newFreq = freq.filter(function(d){
                    return d.key=='周深_2_2';
                })

                var newNum = num.filter(function(d){
                    return d.key=='周深_2_2';
                })

                updateBarAfter(newFreq, newNum);
            }


            function update7(){
                d3.select("#songs_frequency").select("svg").transition().duration(1000).remove();
            }



            let updates = [
                // update1,
                update1_1,
                update2,
                update3,
                update4,
                update5,
                update6,
                update7,
            ];

            let updates_up = [
                update1_up,
                update2_up,
                update3_up,
                update4,
                update5,
                update6,
                update7,
            ];



            // scrollama event handlers
            function handleStepEnter(response) {
                console.log(response)
                // console.log(updates[response.index])

                if (response.direction =="down"){
                    console.log(updates[response.index])
                    updates[response.index]();
                } else if (response.direction == "up"){
                    console.log(updates_up[response.index])
                    updates_up[response.index]();
                };
            }

            function setupStickyfill() {
                d3.selectAll(".sticky").each(function() {
                    Stickyfill.add(this);
                });
            }

            function init() {
                
                update1();

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


            d3.csv("assets/data/202011/freq_of_publication.csv", function(error1, csv1) {
                d3.csv("assets/data/202011/number_of_songs.csv", function(error2, csv2) {
                  // do something with the data
                    freq = d3.nest()
                        .key(function(d){ return d.singer_index; })
                        .entries(csv1);

                    num = d3.nest()
                        .key(function(d){ return d.singer_index; })
                        .key(function(d){ return d.year; })
                        // .rollup(function(v){ return d3.sum(v, function(d){ return d.num; })})
                        .entries(csv2);

                    init()
                });
            });





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
                        if (d.key.split("_")[1]==0){
                            return "translate(" + d.key.split("_")[2]*220 + ",70)";
                        } else if (d.key.split("_")[1] ==1){
                            return "translate(" + d.key.split("_")[2]*220 + ",350)";
                        } else if (d.key.split("_")[1] ==2){
                            return "translate(" + d.key.split("_")[2]*220 + ",630)";
                        } else if (d.key.split("_")[1] ==3){
                            return "translate(" + d.key.split("_")[2]*220 + ",910)";
                        } 
                    });


                // right chart
                u.selectAll("rect.right")
                    .data(d.values)
                    .enter()
                    .append("rect")
                    .merge(u)
                    .attr("x", x(0) + 135)
                    .attr("y", function(d){
                            return y(d.year);
                    })
                    .attr("height", y.bandwidth())
                    .transition()
                    .duration(1000)
                    .attr("width", function(d){return x(d.freq); })
                    .attr("fill", function(d){
                        if (d.freq <= 5){
                            return "#9f5f80";
                        } else if (d.freq>5){
                            return "#583d72";
                        }
                    });

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
                            return chartHeightAll - xLeft(d.num) - 103;
                        })
                        .attr("height", y.bandwidth())
                        .attr("fill", function(d){
                            if (d.num<25){
                                return "#ffba93";
                            } else if (d.num >= 25){
                                return "#ff8e71";
                            }
                        });

                // legend
                var legend = u.append("g")
                    .attr("class","legend_" + d.key.split("_")[2]);
                    // .attr("class","legend-box-all");

                // 左边：歌曲数量
                legend
                    .append('text')
                    .attr("x",0)
                    .attr("y",10)
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888")
                    .text("歌曲数量");
                
                // < 25
                legend
                    .append('rect')
                    .attr("class","legend")
                    .attr("x",0)
                    .attr("y",20)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill","#ffba93")
                    .style("stroke","#fff");

                legend
                    .append('text')
                    .attr("class","legend")
                    .attr("x",19)
                    .attr("y",29)
                    .style("font-family","'Roboto Mono', monospace")
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888")
                    .text("< 25");

                // >= 25
                legend
                    .append('rect')
                    .attr("class","legend")
                    .attr("x",0)
                    .attr("y",40)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill","#ffba93")
                    .style("stroke","#fff");

                legend
                    .append('text')
                    .attr("class","legend")
                    .attr("x",19)
                    .attr("y",49)
                    .style("font-family","'Roboto Mono', monospace")
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888")
                    .text(">=25");


                // 右边：发歌频率
                legend
                    .append('text')
                    .attr("x",180)
                    .attr("y",10)
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888")
                    .text("发歌频率");
                
                // <= 5
                legend
                    .append('rect')
                    .attr("class","legend")
                    .attr("x",181)
                    .attr("y",20)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill","#9f5f80")
                    .style("stroke","#fff");

                legend
                    .append('text')
                    .attr("class","legend")
                    .attr("x",207)
                    .attr("y",29)
                    .style("font-family","'Roboto Mono', monospace")
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888")
                    .text("<=5");

                // > 5
                legend
                    .append('rect')
                    .attr("class","legend")
                    .attr("x",181)
                    .attr("y",40)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill","#583d72")
                    .style("stroke","#fff");

                legend
                    .append('text')
                    .attr("class","legend")
                    .attr("x",207)
                    .attr("y",49)
                    .style("font-family","'Roboto Mono', monospace")
                    .style("font-weight","regular")
                    .style("text-anchor", "left")
                    .style("font-size", "13px")
                    .style("fill","#888")
                    .text(">5");
                
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
                    .attr("transform", "translate(96,0)")
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
                        .style("fill","#000");
                }

                el.text(d.key.split("_")[0]);
            }


            // function updateAxisLine(d){

            // }



            function updateBarsAll(){
                var u = d3.select("#songs_frequency_all")
                    .append("svg")
                    .attr("width", "1200px")
                    .attr("height", "1135px")
                    .selectAll("g")
                    .data(data);

                u.enter()
                    .append("g")
                    .merge(u)
                    .style("fill","#3d7ea6")
                    .each(updateBarAll)
                    .each(updateLabelAll)
                    .each(updateAxisAll);


                u.append("g")
                    .attr("class","divide");


                u.exit().remove();
            }


            d3.csv("assets/data/202011/songs_frequency_data.csv", function(error, csv){
                data = d3.nest()
                    .key(function(d){ return d.singer_index; })
                    .entries(csv);

                // kick things off
                // init(data);
                updateBarsAll();

            })

        }
