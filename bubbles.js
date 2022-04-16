
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
            
            document.getElementById("computedPrice").innerHTML = price
            document.getElementById("cutPercentage").value = 12
            document.getElementById("priceIncrease").value = 30            
            var cooperateList = [] 
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
            computedPrice = price * (1 +cooperativeProductionFraction * increasePercentage/100)
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

    let guaranteedCooperators = []    
    let possibleCooperators = []
    let previousLength = -1   
    let currentLength = 0
    while(currentLength > previousLength)
    {
        let cooperationArray = []        
        for(var i = 0; i < countryData.length; i++) {
            if(guaranteedCooperators.some(e => e.index === i)){
                cooperationArray.push(1)    
            }
            else{
                cooperationArray.push(0)
            }
        }       
        console.log("cooperationArray")
        console.log(cooperationArray)
        possibleCooperators= getPossibleCooperators(cooperationArray, guaranteedCooperators)
        console.log("possibleCooperators")
        console.log(possibleCooperators)    
        cooperateDominant = checkIfCooperationIsDominantStrategy(possibleCooperators)
        for(var i = 0; i < cooperateDominant.length; i++){
            if(guaranteedCooperators.some(e => e.index === cooperateDominant[i].index)){
                //do nothing, it's already in the list
            }
            else{ 
                //add it to the list
                guaranteedCooperators.push(cooperateDominant[i])
            }
        }   
        console.log(currentLength)
        console.log(previousLength)
        console.log(guaranteedCooperators)
        previousLength = currentLength
        currentLength = guaranteedCooperators.length
    }
    return guaranteedCooperators.map(x => x.Country)       
 }

 
 // cooperation is most valuable (relatively speaking) when all other countries defect; 
 // under these conditions, would a country choose to cooperate? If not, cooperation is a dominated strategy for that country
function getPossibleCooperators(cooperationArray, guaranteedCooperators){
    let possibleCooperators = []

    for(var i = 0; i < countryData.length; i++){      
        //guaranteed cooperators are always possible cooperators, just add them to the list and move on
        if(guaranteedCooperators.some(x => x.index === i)){
            possibleCooperators.push({"Country": countryData[i].Country, "index" : i})
            continue;
        }  

        console.log(increasePercentage)

        let tempArray = [...cooperationArray] //deep copy of array so cooperationArray is unaffected by modifications
        
        let defectRatio = getCooperativeProductionRatioByArray(tempArray) //ratio with all defecting
        let defectPrice = price + (defectRatio * increasePercentage)
        let defectRevenue = countryData[i].Production * defectPrice
        
        tempArray[i] = 1   //assign one cooperator
        
        let cooperateRatio = getCooperativeProductionRatioByArray(tempArray)  //ratio with one cooperator        
        let cooperatePrice = price + (cooperateRatio * increasePercentage)        
        let cooperateRevenue = countryData[i].Production * cooperatePrice * (1-cutPercentage/100)        

        
        log = cooperateRevenue - defectRevenue
        console.log(countryData[i].Country + " " + log)
        if(cooperateRevenue >= defectRevenue){
            possibleCooperators.push({"Country": countryData[i].Country, "index" : i})
        }
    }
    
    return possibleCooperators
}

 //pass in an array of 1's and 0's the same length as the countryData array; 0 = defection, 1 = cooperation
function getCooperativeProductionRatioByArray(cooperationArray){    
    let totalProductionCapacity = 0
    let cooperativeProduction = 0

    for(let i = 0; i < countryData.length; i++){
        totalProductionCapacity += parseFloat(countryData[i].Production, 10)
        if(cooperationArray[i] == 1){            
            cooperativeProduction += parseFloat(countryData[i].Production, 10)
        }
    }    
    return cooperativeProduction/totalProductionCapacity
}

//if all possible cooperators choose to cooperate, is cooperation still a dominant choice? 
function checkIfCooperationIsDominantStrategy(possibleCooperators){
    let dominantStrategy = []
    let cooperationArray = []
     //create array of length countryData.length. Initialize nonpossible cooperators to 0, initialize possible cooperators to 1
    for(var i = 0; i < countryData.length; i++) {
        if(possibleCooperators.some(e => e.index === i)){
            cooperationArray.push(1)    
        }
        else {
            cooperationArray.push(0)
        }
    }    

    for(var i=0; i < possibleCooperators.length; i++){
        let countryIndex = possibleCooperators[i].index
        console.log("country: " + countryData[possibleCooperators[i].index].Country)        

        let tempArray = [...cooperationArray] //deep copy of array so cooperationArray is unaffected by modifications
        
        let cooperateRatio = getCooperativeProductionRatioByArray(tempArray)  //ratio with all possible cooperators coopearting
        let cooperatePrice = price + (cooperateRatio * increasePercentage)   
        let cooperateRevenue = countryData[countryIndex].Production * cooperatePrice * (1-cutPercentage/100)  
        
        tempArray[countryIndex] = 0 //set one possible cooperator to defect
        
        defectRatio = getCooperativeProductionRatioByArray(tempArray) //ratio with the one defector         
        let defectPrice = price + (defectRatio * increasePercentage)        
        let defectRevenue = countryData[countryIndex].Production * defectPrice 

        // console.log("cooperateRatio: " + cooperateRatio)
        // console.log("cooperatePrice: " + cooperatePrice)
        // console.log("cooperateRevenue: " + cooperateRevenue)        
        // console.log("defectRatio: " + defectRatio)
        // console.log("defectPrice: " + defectPrice)              
        // console.log("defectRevenue:" + defectRevenue)
        if(cooperateRevenue > defectRevenue){
            console.log("DOMINANT")
            dominantStrategy.push(possibleCooperators[i])
        }
    }
    console.log("Cooperation is a dominant strategy for:")
    console.log(dominantStrategy)
    return dominantStrategy
}

