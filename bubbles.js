
function buildBubbleChart(){
    var width = 1200;
    var height = 800;
    var svg = d3.select("#svg_bubble")
    .attr("height", height)
    .attr("width", width)
    .append("g")
    .attr("transform", "translate(0,0)")

    actionlabels = svg.append("div")
    actionlabels.append("div")
        .text("Cooperate")
    actionlabels.append("div")
        .text("Defect")

    var defs = svg.append("defs");

    defs.append("pattern")
    .attr("id", "algeria")
    .attr("height", "100%")
    .attr("width", "100%")
    .attr("patternContentUnits", "objectBoundingBox")
    .append("image")
    .attr("height",1)
    .attr("width", 1)
    .attr("preserveAspectRatio", "none")
    .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
    .attr("xlink:href", "Flags/Algeria.png")


    var radiusScale = d3.scaleSqrt().domain([0.21,10.46]).range([10,120])
    var forceX = d3.forceX(function(d){
        return width /2
    }).strength(0.05)
    var forceY = d3.forceY(function(d){
            return height /2
        }).strength(0.05)
    var forceXSplit = d3.forceX(function(d){
            if(cooperateList.includes(d[0])){
                return width/4
            }
            else{
                return 3*width/4
            }
        }).strength(0.05)
    var forceCollide = d3.forceCollide(function(d){
        return radiusScale(d[1])
    })

    var simulation = d3.forceSimulation()
        //bring toward the middle:
        .force("x", forceX)
        .force("y", forceY)
        //prevent collision:
        .force("collide", forceCollide)

    var promises = []
    //promises.push(d3.csv("ChessRating.csv"))

    promises.push(countryData)
    Promise.all(promises)
    .then(function(values){        
        data = values[0]
        countryCount = {}
        for(var i = 0; i < data.length; i++){
            countryCount[data[i].Country] = data[i].Production
        }        
        countryCountArray = Object.entries(countryCount)        
        ready(null, countryCountArray)
    })


    function ready(error, datapoints){
        var circles = svg.selectAll(".country")
        .data(datapoints)
        .enter().append("circle")
        .attr("class", "country")
        .attr("name", function(d){
            return d[0]
        })
        .attr("r", function(d){
            var value = parseFloat(d[1],10);
            value = Math.ceil(value)
            return radiusScale(d[1])
        })
        .attr("fill", function(d){
            return "url(#" + d[0].replace(/ /g, "-") + ")"
        })
        .on('click', function(){
            toggleAction(this)
        })
        .on("mouseover", function(d) {            
            tooltipdivBubble.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipdivBubble.html(this.getAttribute('name'))	 //rounded to nearest cent for formatting reasons
                .style("left", (d.pageX) + "px")
                .style("top", (d.pageY - 30) + "px");
            })
        .on("mouseout", function(d) {
            tooltipdivBubble.transition()
                .duration(500)
                .style("opacity", 0);
        });

        defs.selectAll(".country-pattern")
        .data(datapoints)
        .enter().append("pattern")
        .attr("class", "country-pattern")
        .attr("id", function(d){
            return d[0].replace(/ /g, "-")
        })
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("height",1)
        .attr("width", 1)
        .attr("preserveAspectRatio", "none")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("xlink:href", function(d){
            return "Flags/" + d[0].replace(/ /g, "-") + ".png"
        })

        simulation.nodes(datapoints)
        .on('tick', ticked)

        d3.select("#reset").on("click", function() {
            simulation.force("x", d3.forceX(width/2).strength(0.05))
            simulation.force("y", d3.forceY(height/2).strength(0.05))
            .alphaTarget(0.5)
            .restart()
            recompute()
        })
        d3.select("#equilibrium").on("click", function() {
            //should probably show how this is calculated more explictly but for now, move all to defect:
            cooperateList = computeEquilibrium()            
            simulation
            .force("x", forceXSplit.strength(0.05))
            .alphaTarget(0.5)
            .restart()
            setCalculatedOilPrice()
            recompute()
            
        })


        function toggleAction(clickedCircle){
            let country = clickedCircle.getAttribute("name")
            if(cooperateList.includes(country)){
                //filter the list to remove the clicked country from cooperate list
                const filtered_data = cooperateList.filter((d) => d !== country);
                cooperateList = filtered_data
            }
            else{
                cooperateList.push(country)
            }
            simulation
            .force("x", forceXSplit.strength(0.1))
            .alphaTarget(0.5)
            .restart()

            setCalculatedOilPrice()
            recompute()
        }

        function setCalculatedOilPrice(){
            let cooperativeProductionFraction = getCooperativeProduction()
            computedPrice = price + (cooperativeProductionFraction * increasePercentage)
            //round to nearest cent for dollar formatting:
            computedPrice = Math.round(computedPrice*100)/100
            document.getElementById("computedPrice").innerHTML = computedPrice

        }

        function getCooperativeProduction(){
            let totalProductionCapacity = 0
            let cooperativeProduction = 0
            for(let i = 0; i < countryData.length; i++){
                totalProductionCapacity += parseFloat(countryData[i].Production, 10)
                if(cooperateList.includes(countryData[i].Country)){
                    cooperativeProduction += parseFloat(countryData[i].Production, 10)
                }
            }
            console.log("Cooperative Capacity: " + cooperativeProduction)
            console.log("Total Capacity: " + totalProductionCapacity)
            return cooperativeProduction/totalProductionCapacity
        }

        function ticked(){
            circles
            .attr("cx", function(d){
                return d.x
            })
            .attr("cy", function(d){
                return d.y
            })
        }
    }

}


var tooltipdivBubble = d3.select("body").append("div")
    .attr("class", "tooltipBubble")
    .style("opacity", 0)


function computeEquilibrium(){
    let copyOfCountryData = countryData
    let possibleCooperators = []
    let cooperationArray = []
    for(var i = 0; i < countryData.length; i++) {
        cooperationArray.push(0)
    }

    for(var i = 0; i < countryData.length; i++){
        let tempArray = cooperationArray
        let baselineRatio = getCooperativeProductioByArray(tempArray)
        tempArray[i] = 1
        cooperateRatio = getCooperativeProductioByArray(tempArray)
        let baselinePrice = price + (baselineRatio * increasePercentage)
        let cooperatePrice = price + (cooperateRatio * increasePercentage)
        let baselineRevenue = countryData[i].Production * baselinePrice
        let cooperateRevenue = countryData[i].Production * cooperatePrice * (1-cutPercentage/100)
        console.log(cooperateRevenue - baselineRevenue)
        if(cooperateRevenue > baselineRevenue){
            possibleCooperators.push(countryData[i].Country)
        }
    }
    console.log("Possible cooperators: " + possibleCooperators)
    return possibleCooperators
 }

function getCooperativeProductioByArray(cooperationArray){    
    let totalProductionCapacity = 0
    let cooperativeProduction = 0

    for(let i = 0; i < countryData.length; i++){
        totalProductionCapacity += parseFloat(countryData[i].Production, 10)
        if(cooperationArray[i] == 1){            
            cooperativeProduction += parseFloat(countryData[i].Production, 10)
        }
    }
    console.log("Cooperative Capacity: " + cooperativeProduction)
    console.log("Total Capacity: " + totalProductionCapacity)
    return cooperativeProduction/totalProductionCapacity
}