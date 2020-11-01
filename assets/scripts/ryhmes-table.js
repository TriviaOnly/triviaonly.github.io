// treemap
// https://www.d3-graph-gallery.com/graph/treemap_basic.html
// https://stackoverflow.com/questions/39863270/d3-filtering-root-data-from-flare-csv-for-treemap
// https://observablehq.com/@d3/zoomable-treemap
// https://observablehq.com/@d3/treemap

// click and filter
// d3.queue()
//     .defer(d3.csv, "assets/data/frequent_rhymns_treemap2.csv")
//     .await(ready);

// function ready(error, data){
//     if(error) throw error;

//     // set up the svg
//     margin = {top:10, right:10, bottom:10, left:10};
//     width = 954 - margin.left - margin.right;
//     height = 954 - margin.top - margin.bottom;

//     x = d3.scaleLinear().rangeRound([0, width]);
//     y = d3.scaleLinear().rangeRound([0, height]);

//     svg = d3.select(".songs-treemap")
//         .append("svg")
//             .attr("width", width + margin.left + margin.right)
//             .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     group = svg.append("g")
//         .call(render, treemap())

//     initialData = data.filter(function(d){
//         return d.id=='rhymes' || d.id=='rhymes.i' || d.id.includes("rhymes.i."); 
//     });

//     root = d3.stratify()
//             .id(function(d){ return d.id; })
//             .parentId(function(d){ return d.id.substring(0, d.id.lastIndexOf(".")); })
//             (initialData);
    
//     root.sum(function(d){ return +d.value; });

//     console.log(root.children.concat(root))

//     d3.treemap()
//         .size([width, height])
//         .padding(4)
//         (root);

//     svg
//         .selectAll("rect")
//         .data(root.leaves())
//         .enter()
//         .append("rect")
//             .attr("x", function(d){ return d.x0; })
//             .attr("y", function(d){ return d.y0; })
//             .attr("width", function(d){ return d.x1 - d.x0; })
//             .attr("height", function(d){ return d.y1 - d.y0; })
//             .style("stroke", "black")
//             .style("fill", "#84a9ac");

//     svg
//         .selectAll("text")
//         .data(root.leaves())
//         .enter()
//         .append("text")
//             .attr("x", function(d){ return d.x0 + 10; })
//             .attr("y", function(d){ return d.y0 + 20; })
//             .text(function(d){ return d.data.name; })
//             .attr("font-size", "15px")
//             .attr("fill", "white");


//     // update the treemap with dropdownchange
//     rhymes = ['i','ang','ian','ou','ai','u','a','ing','en','ao','ong','e','o','an','ui','uo','ei','in','eng','uan','iang','iao','ie','ua','iu','ia','ue','uai'];

//     dropdownChange = function(){

//         var new_value = d3.select(this).property('value');
//         var new_data = data.filter(function(d){
//                 return d.id=='rhymes' || d.id=='rhymes.' + new_value || d.id.includes("rhymes." + new_value + "."); 
//             });

//         console.log(new_value)
//         console.log(new_data)
//         updateTreemap(new_data);

//     };

//     dropdown = d3.select(".chart-title-sub")
//         .append("div")
//         .attr("class","song-dropdown")
//         .insert("select", "svg")
//         .on("change", dropdownChange);

//     dropdown.selectAll("option")
//             .data(rhymes)
//         .enter().append("option")
//             .attr("value", function(d){return d;})
//             .text(function(d){
//                 return "韵脚：" + d;
//             });
    
//     // update the graph with new data
//     updateTreemap = function(data){
//         // yScale.domain([0, d3.max(data)]);

//         svg.selectAll("rect").remove();
//         svg.selectAll("text").remove();

//         root = d3.stratify()
//             .id(function(d){ return d.id; })
//             .parentId(function(d){ return d.id.substring(0, d.id.lastIndexOf(".")); })
//             (data);

//         root.sum(function(d){ return +d.value; });

//         d3.treemap()
//             .size([width-300, height-300])
//             .padding(4)
//             (root);

//         svg
//             .selectAll("rect")
//             .data(root.leaves())
//             .enter()
//             .append("rect")
//                 .attr("x", function(d){ return d.x0; })
//                 .attr("y", function(d){ return d.y0; })
//                 .attr("width", function(d){ return d.x1 - d.x0; })
//                 .attr("height", function(d){ return d.y1 - d.y0; })
//                 .style("stroke", "black")
//                 .style("fill", "#84a9ac");

//         svg
//             .selectAll("text")
//             .data(root.leaves())
//             .enter()
//             .append("text")
//                 .attr("x", function(d){ return d.x0 + 10; })
//                 .attr("y", function(d){ return d.y0 + 20; })
//                 .text(function(d){ return d.data.name; })
//                 .attr("font-size", "15px")
//                 .attr("fill", "white");

//     };

//     // initialData = data.filter(function(d){
//     //     return d.id=='rhymes' || d.id=='rhymes.ian' || d.id.includes("rhymes.ian."); 
//     // });
//     // updateTreemap(initialData);

// };


// click and change
// d3.queue()
//     .defer(d3.csv, "assets/data/frequent_rhymns_treemap2.csv")
//     .await(ready);

// function ready(error, data){
//     if(error) throw error;

//     // set up the svg
//     margin = {top:10, right:10, bottom:10, left:10};
//     width = 954 - margin.left - margin.right;
//     height = 954 - margin.top - margin.bottom;

//     x = d3.scaleLinear().rangeRound([0, width]);
//     y = d3.scaleLinear().rangeRound([0, height]);

//     svg = d3.select(".songs-treemap")
//         .append("svg")
//             .attr("width", width + margin.left + margin.right)
//             .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     initialData = data.filter(function(d){
//         return d.id=='rhymes' || d.id=='rhymes.i' || d.id.includes("rhymes.i."); 
//     });

//     root = d3.stratify()
//             .id(function(d){ return d.id; })
//             .parentId(function(d){ return d.id.substring(0, d.id.lastIndexOf(".")); })
//             (initialData);
    
//     root.sum(function(d){ return +d.value; });

//     console.log(root.children.concat(root))

//     d3.treemap()
//         .size([width, height])
//         .padding(4)
//         (root);

//     svg
//         .selectAll("rect")
//         .data(root.leaves())
//         .enter()
//         .append("rect")
//             .attr("x", function(d){ return d.x0; })
//             .attr("y", function(d){ return d.y0; })
//             .attr("width", function(d){ return d.x1 - d.x0; })
//             .attr("height", function(d){ return d.y1 - d.y0; })
//             .style("stroke", "black")
//             .style("fill", "#84a9ac");

//     svg
//         .selectAll("text")
//         .data(root.leaves())
//         .enter()
//         .append("text")
//             .attr("x", function(d){ return d.x0 + 10; })
//             .attr("y", function(d){ return d.y0 + 20; })
//             .text(function(d){ return d.data.name; })
//             .attr("font-size", "15px")
//             .attr("fill", "white");


//     // update the treemap with dropdownchange
//     rhymes = ['i','ang','ian','ou','ai','u','a','ing','en','ao','ong','e','o','an','ui','uo','ei','in','eng','uan','iang','iao','ie','ua','iu','ia','ue','uai'];

//     dropdownChange = function(){

//         var new_value = d3.select(this).property('value');
//         var new_data = data.filter(function(d){
//                 return d.id=='rhymes' || d.id=='rhymes.' + new_value || d.id.includes("rhymes." + new_value + "."); 
//             });

//         console.log(new_value)
//         console.log(new_data)
//         updateTreemap(new_data);

//     };

//     dropdown = d3.select(".chart-title-sub")
//         .append("div")
//         .attr("class","song-dropdown")
//         .insert("select", "svg")
//         .on("change", dropdownChange);

//     dropdown.selectAll("option")
//             .data(rhymes)
//         .enter().append("option")
//             .attr("value", function(d){return d;})
//             .text(function(d){
//                 return "韵脚：" + d;
//             });
    
//     // update the graph with new data
//     updateTreemap = function(data){
//         // yScale.domain([0, d3.max(data)]);

//         svg.selectAll("rect").remove();
//         svg.selectAll("text").remove();

//         root = d3.stratify()
//             .id(function(d){ return d.id; })
//             .parentId(function(d){ return d.id.substring(0, d.id.lastIndexOf(".")); })
//             (data);

//         root.sum(function(d){ return +d.value; });

//         d3.treemap()
//             .size([width-300, height-300])
//             .padding(4)
//             (root);

//         svg
//             .selectAll("rect")
//             .data(root.leaves())
//             .enter()
//             .append("rect")
//                 .attr("x", function(d){ return d.x0; })
//                 .attr("y", function(d){ return d.y0; })
//                 .attr("width", function(d){ return d.x1 - d.x0; })
//                 .attr("height", function(d){ return d.y1 - d.y0; })
//                 .style("stroke", "black")
//                 .style("fill", "#84a9ac");

//         svg
//             .selectAll("text")
//             .data(root.leaves())
//             .enter()
//             .append("text")
//                 .attr("x", function(d){ return d.x0 + 10; })
//                 .attr("y", function(d){ return d.y0 + 20; })
//                 .text(function(d){ return d.data.name; })
//                 .attr("font-size", "15px")
//                 .attr("fill", "white");

//     };

//     // initialData = data.filter(function(d){
//     //     return d.id=='rhymes' || d.id=='rhymes.ian' || d.id.includes("rhymes.ian."); 
//     // });
//     // updateTreemap(initialData);

// };



// basic treemap

d3.queue()
    .defer(d3.csv, "assets/data/frequent_rhymns_treemap1.csv")
    .await(ready);

function ready(error, data){
    if(error) throw error;

    margin = {top:10, right:10, bottom:10, left:10};
    width = 1100 - margin.left - margin.right;
    height = 1000 - margin.top - margin.bottom;

    svg = d3.select(".songs-treemap")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color = d3.scaleOrdinal()
        .range(['#f46d6d','#f0d4a2']);
    
    root = d3.stratify()
        .id(function(d){ return d.id; })
        .parentId(function(d){ return d.id.substring(0, d.id.lastIndexOf(".")); })
        (data);

    root.sum(function(d){ return +d.value; });

    d3.treemap()
        .size([width, height])
        .padding(4)
        (root);

    svg
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
            .attr("x", function(d){ return d.x0; })
            .attr("y", function(d){ return d.y0; })
            .attr("width", function(d){ return d.x1 - d.x0; })
            .attr("height", function(d){ return d.y1 - d.y0; })
            .attr("fill", d => { return color(d.data.group); })
            .style("stroke", "black");
            // .style("fill", "#84a9ac");

    svg
        .selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
            .attr("x", function(d){ return d.x0 + 5; })
            .attr("y", function(d){ return d.y0 + 20; })
            .text(function(d){ return d.data.name; })
            .attr("font-size", "15px")
            .attr("font-weight", "400")
            .attr("fill", "black");


};



// console.log("Attribute to the pudding, quantifying emotional lyrics in emo rap.")

// d3.queue()
//     .defer(d3.csv, "assets/data/frequent_rhymns_df2.csv")
//     .await(ready);

// function ready(error, data){
//     if(error) throw error;

//     console.log(data.slice(0,100))
//     // console.log(rhymes.length)
//     // console.log(data.filter(function(d){return d.rhymns_this=='i'}))

//     var J = d3.select(".songs-rhymes");

//     var updateTable = function(data){
//         var Q = J.selectAll("div")
//                 .data(data)
//                 .enter()
//                 .append("div")
//                 .attr("class","songs-rhymes-div")
//                 .on("mouseover", function(t){
//                     Q.classed("songs-rhymes-annotation-highlited", !1),
//                     d3.select(this).classed("songs-rhymes-annotation-highlited", !0)
//                 });

//         Q.filter(function(t,e){
//             return 0==e
//         }).classed("songs-rhymes-annotation-highlited",!0);

//         Q.append("p")
//             .attr("class", "songs-rhymes-content")
//             .html(function(d,e){
//                 return "<span class='songs-rhymes-number'>" + (e+1) + ".</span>" +  "<span class='songs-rhymes-word'>" + d.rhymes_word + "</span>" + "<span class='songs-rhymes-this'>（" + d.rhymes_this + "）</span>" + "<span class='songs-rhymes-count'>" + d.count + "</span>";
//             });

//         var V = Q.append("div").attr("class", "songs-rhymes-annotation");

//         // V.append("svg").attr("xmlns", "http://www.w3.org/2000/svg").attr("width", 24).attr("height", 24).attr("viewBox", "0 0 24 24").attr("fill", "none").attr("stroke", "#29A9D1").attr("stroke-width", "2").attr("stroke-linecap", "round").attr("stroke-linejoin", "round").append("polyline").attr("points", "15 18 9 12 15 6");

//         // V.append("div")
//         //     .attr("class","songs-rhymes-examples")
//         //     .selectAll("p")
//         //     .data(function(d){
//         //         // var e = d.
//         // });

//         V.append("div")
//             .attr("class","songs-rhymes-examples")
//             .append("p")
//             .attr("class", "songs-rhymes-examples-songs")
//             .html(function(d){
//                 // console.log(d)
//                 return d.song;
//             });
//             // .selectAll("p")
//             // .data(data).enter()
//             // .append("span")
//             // .attr("class","songs-rhymes-example")
//             // .text(function(d){
//             //     // return d.song[0];
//             //     // console.log(d)
//             //     console.log(d)
//             // });
    
//     };

//     var dropdownChange = function(){
//         d3.selectAll(".songs-rhymes-div").remove();

//         var new_value = d3.select(this).property('value');
//         var new_data = data.filter(function(d){return d.rhymes_this==new_value; });

//         console.log(new_data)
//         updateTable(new_data);
//     };

//     var rhymes = ['i','ang','ian','ou','ai','u','a','ing','en','ao','ong','e','o','an','ui','uo','ei','in','eng','uan','iang','iao','ie','ua','iu','ia','ue','uai'];

//     var dropdown = d3.select(".chart-title-sub")
//         .append("div")
//         .attr("class","song-dropdown")
//         .insert("select","svg")
//         .on("change", dropdownChange);

//     dropdown.selectAll("option")
//             .data(rhymes)
//         .enter().append("option")
//             .attr("value", function(d){return d; })
//             .text(function(d){
//                 return "韵脚：" +d;
//             });

//     var initialData = data.filter(function(d){return d.rhymes_this=="i"; });
//     updateTable(initialData);

//     /**
//     基本表格
//     */
//     // var Q = J.selectAll("div")
//     //         .data(rhymes)
//     //         .enter()
//     //         .append("div")
//     //         .attr("class","songs-rhymes-div")
//     //         .style("display", function(t,e){
//     //             return e<25 ? null: "none"
//     //         }).on("mouseover", function(t){
//     //             Q.classed("songs-rhymes-annotation-highlited", !1),
//     //             d3.select(this).classed("songs-rhymes-annotation-highlited", !0)
//     //         });

//     // Q.append("p")
//     //     .attr("class", "songs-rhymes-content")
//     //     .html(function(d,e){
//     //         return "<span class='songs-rhymes-number'>" + (e+1) + ".</span>" +  "<span class='songs-rhymes-word'>" + d.index + "</span>" + "<span class='songs-rhymes-this'>（" + d.rhymns_this + "）</span>" + "<span class='songs-rhymes-count'>" + d.count + "</span>";
//     //     });

//     // var updateTable = function(){
//     //     var Q = J.selectAll("div")
//     //             .data(rhymes.filter(function(d){
//     //                 return d.rhymns_this == select-rhymes
//     //             }))
//     // }
    
// };