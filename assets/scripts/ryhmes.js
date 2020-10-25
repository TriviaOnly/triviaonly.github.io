console.log("hi!")

d3.queue()
    .defer(d3.csv, "assets/data/frequent_rhymes_df.csv")
    .await(ready);

function ready(error, data){
    if(error) throw error;

    // console.log(data.slice(0,100))
    // console.log(rhymes.length)
    // console.log(data.filter(function(d){return d.rhymns_this=='i'}))

    var J = d3.select(".songs-rhymes");

    var updateTable = function(data){
        var Q = J.selectAll("div")
                .data(data)
                .enter()
                .append("div")
                .attr("class","songs-rhymes-div")
                .on("mouseover", function(t){
                    Q.classed("songs-rhymes-annotation-highlited", !1),
                    d3.select(this).classed("songs-rhymes-annotation-highlited", !0)
                });

        Q.append("p")
            .attr("class", "songs-rhymes-content")
            .html(function(d,e){
                return "<span class='songs-rhymes-number'>" + (e+1) + ".</span>" +  "<span class='songs-rhymes-word'>" + d.rhymes_word + "</span>" + "<span class='songs-rhymes-this'>（" + d.rhymes_this + "）</span>" + "<span class='songs-rhymes-count'>" + d.count + "</span>";
            });

        var V = Q.append("div").attr("class", "songs-rhymes-annotation");

        V.append("svg").attr("xmlns", "http://www.w3.org/2000/svg").attr("width", 24).attr("height", 24).attr("viewBox", "0 0 24 24").attr("fill", "none").attr("stroke", "#29A9D1").attr("stroke-width", "2").attr("stroke-linecap", "round").attr("stroke-linejoin", "round").append("polyline").attr("points", "15 18 9 12 15 6");

        // V.append("div")
        //     .attr("class","songs-rhymes-examples")
        //     .selectAll("p")
        //     .data(function(d){
        //         // var e = d.
        // });

        V.append("div")
            .attr("class","songs-rhymes-examples")
            .selectAll("p")
            .data(data).enter()
            .append("span")
            .attr("class","songs-rhymes-example")
            .text(function(d){
                return d.song;
                // console.log(d)
            });
    
    
    };

    var dropdownChange = function(){
        d3.selectAll(".songs-rhymes-div").remove();

        var new_value = d3.select(this).property('value');
        var new_data = data.filter(function(d){return d.rhymes_this==new_value; });

        console.log(new_data)
        updateTable(new_data);
    };

    var rhymes = ['i','ang','ian','ou','ai','u','a','ing','en','ao','ong','e','o','an','ui','uo','ei','in','eng','uan','iang','iao','ie','ua','iu','ia','ue','uai'];

    var dropdown = d3.select(".chart-title-sub")
        .append("div")
        .attr("class","song-dropdown")
        .insert("select","svg")
        .on("change", dropdownChange);

    dropdown.selectAll("option")
            .data(rhymes)
        .enter().append("option")
            .attr("value", function(d){return d; })
            .text(function(d){
                return "韵脚：" +d;
            });

    var initialData = data.filter(function(d){return d.rhymes_this=="i"; });
    updateTable(initialData);

    /**
    基本表格
    */
    // var Q = J.selectAll("div")
    //         .data(rhymes)
    //         .enter()
    //         .append("div")
    //         .attr("class","songs-rhymes-div")
    //         .style("display", function(t,e){
    //             return e<25 ? null: "none"
    //         }).on("mouseover", function(t){
    //             Q.classed("songs-rhymes-annotation-highlited", !1),
    //             d3.select(this).classed("songs-rhymes-annotation-highlited", !0)
    //         });

    // Q.append("p")
    //     .attr("class", "songs-rhymes-content")
    //     .html(function(d,e){
    //         return "<span class='songs-rhymes-number'>" + (e+1) + ".</span>" +  "<span class='songs-rhymes-word'>" + d.index + "</span>" + "<span class='songs-rhymes-this'>（" + d.rhymns_this + "）</span>" + "<span class='songs-rhymes-count'>" + d.count + "</span>";
    //     });

    // var updateTable = function(){
    //     var Q = J.selectAll("div")
    //             .data(rhymes.filter(function(d){
    //                 return d.rhymns_this == select-rhymes
    //             }))
    // }
    
};