// basic treemap

d3.queue()
    .defer(d3.csv, "assets/data/frequent_rhymns_treemap.csv")
    .await(ready);

function ready(error, data){
    if(error) throw error;

    var margin = {top:10, right:10, bottom:10, left:10};
    var width = 1100 - margin.left - margin.right;
    var height = 1000 - margin.top - margin.bottom;

    var svg = d3.select(".songs-treemap")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var div = d3.select("body")
        .append("div")
        .attr("class","song-rhymes-tooltip")
        .style("position","absolute")
        .style("display", "none");
    
    var root = d3.stratify()
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
            .attr("class",function(d){
                return "rect_" + d.data.group;
            })
            .attr("fill", function(d){
                if (d.data.name =='里'){
                    return "#f46d6d"
                } else {
                    return '#f0d4a2'
                }
            })
            .on("mouseover", function(d){
                d3.select(this)
                .transition()
                .duration('300')
                .attr("fill","#f46d6d");

                div.transition()
                    .duration('300')
                    .style("display","inline");

                div.html("<span>韵脚：</span>" +d.data.group.split('.')[1] + "<br>" + "<span>例曲：</span>" + d.data.song)
                    .style("left", (d3.event.pageX - 150) + "px")
                    .style("top", (d3.event.pageY - 34) + "px");
            })
            .on("mouseout", function(d){
                d3.select(this)
                .transition()
                .duration('300')
                .attr("fill","#f0d4a2");

                div.transition()
                .duration('300')
                .style("display","none");
            })
            .style("stroke", "black");

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