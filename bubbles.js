(function(){
        var width = 1200;
        var height = 800;        
        var svg = d3.select("#svg")        
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


        var radiusScale = d3.scaleSqrt().domain([1,10.4]).range([15,120])
        
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
            return radiusScale(d[1])+1
        })

        var simulation = d3.forceSimulation()
            //bring toward the middle:
            .force("x", forceX)
            .force("y", forceY)
            //prevent collision:
            .force("collide", forceCollide)

        var promises = []
        //promises.push(d3.csv("ChessRating.csv"))
        var countryData = [{"Country": "Algeria", "Reserves":"12.2", "Production":"1.3"},
                        {"Country": "Angola", "Reserves":"8.4", "Production":"1.7"},
                        {"Country": "Republic of the Congo", "Reserves":"1.6", "Production":"1"},
                        {"Country": "Equatorial Guinea", "Reserves":"1", "Production":"1"},
                        {"Country": "Gabon", "Reserves":"157", "Production":"1"},
                        {"Country": "Iran", "Reserves":"157", "Production":"3.99"},
                        {"Country": "Iraq", "Reserves":"143", "Production":"4.45"},
                        {"Country": "Kuwait", "Reserves":"101", "Production":"2.9"},
                        {"Country": "Libya", "Reserves":"48", "Production":"1"},
                        {"Country": "Nigeria", "Reserves":"37", "Production":"1.99"},                                                
                        {"Country": "Saudi Arabia", "Reserves":"266", "Production":"10.46"},
                        {"Country": "United Arab Emirates", "Reserves":"97", "Production":"3.1"},
                        {"Country": "Venezuela", "Reserves":"299", "Production":"2.27"}]
        promises.push(countryData)
        Promise.all(promises)
        .then(function(values){
            console.log(values[0])
            data = values[0]
            countryCount = {}            
            for(var i = 0; i < data.length; i++){  
                countryCount[data[i].Country] = data[i].Production
            }
            console.log(countryCount)
            countryCountArray = Object.entries(countryCount)
            console.log(countryCountArray)
            ready(null, countryCountArray)
        })


        function ready(error, datapoints){
            console.log(datapoints)
            
            var tooltip = d3.select("body")
                .append("div")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
	            .text("a simple tooltip");
            var tooltip = d3.select("div.tooltip.mouse")
            var SVGexactTip = d3.select("g.tooltip.exact");
            var SVGmouseTip = d3.select("g.tooltip.mouse");
            var HTMLmouseTip = d3.select("div.tooltip.mouse")

            var circles = svg.selectAll(".country")
            .data(datapoints)
            .enter().append("circle")
            .attr("class", "country")            
            .attr("name", function(d){
                return d[0]
            })            
            .attr("r", function(d){
                return radiusScale(d[1])
            })
            .attr("fill", function(d){
                return "url(#" + d[0].replace(/ /g, "-") + ")"
            })           
            .on('click', function(d){
                console.log(d)
            })
            .on("mouseover", function(d){tooltip.text(d); return tooltip.style("visibility", "visible");})
                .on("mousemove", function(event){                    
                    return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
                })
                .on("mouseout", function(){
                    return tooltip.style("visibility", "hidden");
                });
            // .on("mouseover", function () {
            //     let pos = d3.select(this).node().getBoundingClientRect();
            //     let x = (window.pageXOffset + pos['x'] - 500)
            //     let y = (window.pageYOffset + pos['y'] - 150)
            //     console.log(pos)
            //     console.log(x)
            //     console.log(y)
            //     d3.select("#tooltip")
            //         .style('left', `${x}px`)
            //         .style('top', `${y}px`)
            //         .style("opacity", "1");

            // })            
            // .on("mouseout", function () {
            //     d3.select('#tooltip').style('opacity', "0");
            // });     
            
            

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
            })
            d3.select("#equilibrium").on("click", function() {
                simulation
                .force("x", forceXSplit.strength(0.05))                               
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
        
        var cooperateList = []       
            
    }
)();