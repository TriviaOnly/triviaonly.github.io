var isMobile = window.screen.width < 420 ? true : false

if (isMobile){
    d3.select(".g-artboard").style("display","none");
    d3.select(".grouping-mobile").style("display","inline-block").style("margin-bottom","30px");
} else {
    d3.select(".grouping-mobile").style("display","none");
}