(function(){
        var width = 800;
        var height = 800;        
        var svg = d3.select("#chart")
        .append("svg")
        .attr("height", height)
        .attr("width", width)             
        .append("g")
        .attr("transform", "translate(0,0)")

        var defs = svg.append("defs");
        
        defs.append("pattern")
        .attr("id", "china")
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("height",1)
        .attr("width", 1)
        .attr("preserveAspectRatio", "none")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("xlink:href", "Flags/China.png")


        var radiusScale = d3.scaleSqrt().domain([1,24]).range([15,120])
        
        // var forceX = d3.forceX(function(d){
        //     return width/2
        //     }).strength(0.05)
        // var forceY = d3.forceY( function(d){
        //         return height/2
        //     }).strength(0.05)
        // var forceCollide = d3.forceCollide(function(d){
        //     return radiusScale(d[1]+0.25)
        // })
        var forceX = d3.forceX(function(d){
            return width /2 
        }).strength(0.05)
        var forceY = d3.forceY(function(d){
            return height /2 
        }).strength(0.05)
        var forceXSplit = d3.forceX(function(d){
            if(europeList.includes(d[0])){                
                return 450
            }
            else if(asiaList.includes(d[0])){                
                return 600
            }
            else if(africaList.includes(d[0])){
                return 300
            }
            else if(northAmericaList.includes(d[0])){
                return 100
            }
            else{                
                return 75
            }
            }).strength(0.05)
        var forceYSplit = d3.forceY( function(d){
            if(europeList.includes(d[0])){                
                return 200
            }
            else if(asiaList.includes(d[0])){                
                 return 600
            }
            else if(africaList.includes(d[0])){
                 return 450
            }
            else if(northAmericaList.includes(d[0])){
                 return 200
             }
            else{                
                return 600
            }
            }).strength(0.05)
        var forceCollide = d3.forceCollide(function(d){
            return radiusScale(d[1]+0.25)
        })

        var simulation = d3.forceSimulation()
            //bring toward the middle:
            .force("x", forceX)
            .force("y", forceY)
            //prevent collision:
            .force("collide", forceCollide)

        var promises = [];
        promises.push(d3.csv("ChessRating.csv"))
        Promise.all(promises)
        .then(function(values){
            console.log(values[0])
            data = values[0]
            countryCount = {}
            for(var i = 0; i < data.length; i++){  
                if(data[i].Country in countryCount){                               
                    countryCount[data[i].Country] = countryCount[data[i].Country] + 1
                }
                else{
                    countryCount[data[i].Country] = 1
                }
            }
            console.log(countryCount)
            countryCountArray = Object.entries(countryCount)
            console.log(countryCountArray)
            ready(null, countryCountArray)
        })
        

        function ready(error, datapoints){
            console.log(datapoints)
            
            var circles = svg.selectAll(".country")
            .data(datapoints)
            .enter().append("circle")
            .attr("class", "country")
            .attr("r", function(d){
                return radiusScale(d[1])
            })
            .attr("fill", function(d){
                return "url(#" + d[0].replace(/ /g, "-") + ")"
            })           
            .on('click', function(d){
                console.log(d)
            })

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
            
            d3.select("#combine").on("click", function() {
                simulation.force("x", d3.forceX(width/2).strength(0.05))
                simulation.force("y", d3.forceY(height/2).strength(0.05))
                .alphaTarget(0.5)
                .restart()
            })
            d3.select("#continent").on("click", function() {
                simulation
                .force("x", forceXSplit.strength(0.05))               
                .force("y", forceYSplit.strength(0.05))
                .alphaTarget(0.5)
                .restart()
            })

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

        d3.select("#continent").on('click', function(){
            console.log("You Clicked me")
        })

        var europeList = [ "Norway","Netherlands","France","Hungary","Poland",
        "Bulgaria", "England", "Spain",  "Czech Republic",  "Ukraine",  "Croatia", 
        "Austria",  "Sweden", "Latvia", "Romania"]
        var asiaList = ["China", "Russia", "Armenia", "Azerbaijan", 
        "India", "Vietnam", "Iran", "UAE", "Israel",  "Uzbekistan", "Kazakhstan"] 
        var northAmericaList = ["USA"]
        var southAmericaList = ["Peru"]
        var africaList = ["Egypt"]
    
        
    }
)();