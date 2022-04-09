function buildBarChart(){

    const margin = {top: 40, bottom: 10, left: 120, right: 20};
    const width = 800 - margin.left - margin.right;
    const height = 800 //- margin.top - margin.bottom;

    var svg = d3.select("#svg_bar")        
    .attr("height", height)
    .attr("width", width)             
    .append("g")
    .attr("transform", "translate(0,0)")
    
    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")    
    .attr("x", width -120)
    .attr("y", height - 785)
    .text("Revenue from daily oil production (millions)");

    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 60)
    .attr("x", -300)
    //.attr("dy", "2em")
    .text("Nation")
    .attr("transform", "rotate(-90)");

    // Group used to enforce margin
    const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

    // Global variable for all data
    let data;
    let currentData; 

    // Scales setup
    const xscale = d3.scaleLinear().range([0, width*.8]);
    const yscale = d3.scaleBand().rangeRound([0, height*.9]).paddingInner(0.1);

    // Axis setup
    const xaxis = d3.axisTop().scale(xscale); 

    const g_xaxis = g.append('g').attr('class','x axis');

    const yaxis = d3.axisLeft().scale(yscale);
    const g_yaxis = g.append('g').attr('class','y axis');

    /////////////////////////

    // d3.csv('forbesathletes.csv').then((csv) => {
    
    // data = csv;

    // update(data);
    // });


    var years = ["1990","1991","1992","1993","1994","1995","1996","1997","1998","1999","2000","2001","2002","2003","2004",
    "2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017","2018","2019","2019","2020", "2021"]


    computeRevenue()
    update(barChartCountryData)

    function computeRevenue(){        
        for(var i = 0; i < countryData.length; i++){            
            var revenue = countryData[i].Production * computedPrice                        
            if(cooperateList.includes(countryData[i].Country)){
                revenue = revenue * (1 - cutPercentage/100)
                console.log("reducedRevenue" + revenue)
            }
            barChartCountryData.push({"Country":countryData[i].Country, "Revenue": revenue})
        }
    }

    function update(new_data) {
        //update the scales
        console.log("The data:")
        console.log(new_data)  

        xscale.domain([0, Math.max.apply(Math, new_data.map(function(o) {return (Math.floor(o.Revenue/100)+1)*100}))]);
        yscale.domain(new_data.map((d) => d.Country));
        //render the axis
        g_xaxis.transition().call(xaxis);
        g_yaxis.transition().call(yaxis);        

        // Render the chart with new data

        // DATA JOIN use the key argument for ensuring that the same DOM element is bound to the same data-item
        const rect = g.selectAll('rect').data(new_data, (d) => d.Country).join(
            // ENTER 
            // new elements
            (enter) => {
            const rect_enter = enter.append('rect').attr('x', 0);
            rect_enter.append('title');
            return rect_enter;
            },
            // UPDATE
            // update existing elements
            (update) => update,
            // EXIT
            // elements that aren't associated with data
            (exit) => exit.remove()
        )
            .on("mouseover", function(d) {
                console.log(this.__data__)	
                console.log(d)	
                div.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                div	.html(this.__data__.Country + "<br/>"  + this.__data__.Revenue)	
                    .style("left", (d.clientX-30) + "px")		
                    .style("top", (d.clientY+150) + "px");	
                })					
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });

        // ENTER + UPDATE
        // both old and new elements
        rect.transition()
            .attr('height', yscale.bandwidth())
            .attr('width', (d) => xscale(d.Revenue))
            .attr('y', (d) => yscale(d.Country));

        rect.select('title').text((d) => d.Country);  

    }

    var div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);

    //interactivity
    d3.selectAll('.radiobutton').on('change', function() {
    // This will be triggered when the user selects or unselects the checkbox
    console.log(this)  
    if (this.value === "Mixed Martial Arts") { 
        //filter data    
        const filtered_data = data.filter((d) => d.Sport === this.value || d.Sport === "MMA");
        update(filtered_data);  // Update the chart with the filtered data
    } 
    else if (this.value === "Basketball") { 
        //filter data    
        const filtered_data = data.filter((d) => d.Sport === this.value || d.Sport === "Basketbal");
        update(filtered_data);  // Update the chart with the filtered data
    } 
    else if (this.value === "Auto Racing") { 
        //filter data    
        const filtered_data = data.filter((d) => d.Sport === this.value || d.Sport === "Racing");
        update(filtered_data);  // Update the chart with the filtered data
    } 
    else if (this.value === "Baseball") { 
        //filter data    
        const filtered_data = data.filter((d) => d.Sport === this.value || d.Sport === "Football/Baseball");
        update(filtered_data);  // Update the chart with the filtered data
    } 
    else if (this.value === "Football") { 
        //filter data    
        const filtered_data = data.filter((d) => d.Sport === this.value || d.Sport === "Football/Baseball");
        update(filtered_data);  // Update the chart with the filtered data
    } 
    else if (this.value === "All"){
        //return all the data    
        update(data);  
    }
    else{
        const filtered_data = data.filter((d) => d.Sport === this.value);
        update(filtered_data);
    }
    });
}