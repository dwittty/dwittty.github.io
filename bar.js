function buildBarChart(){

    computeRevenue()
    sortData(barChartCountryData)
    update(barChartCountryData) 
    
}


function recompute(){    
    computeRevenue()
    sortData(barChartCountryData)
    update(barChartCountryData)
}

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


function computeRevenue(){        
    barChartCountryData = []
    for(var i = 0; i < countryData.length; i++){            
        var revenue = countryData[i].Production * computedPrice                        
        if(cooperateList.includes(countryData[i].Country)){
            revenue = revenue * (1 - cutPercentage/100)
        }
        barChartCountryData.push({"Country":countryData[i].Country, "Revenue": revenue})
    }
}

function sortData(data){
    data.sort(function(a,b){
        return d3.descending(a.Revenue, b.Revenue)
    })        
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
            console.log(d)	
            var mousePos = d3.pointer(d);
            console.log(mousePos)
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div.html(this.__data__.Country + "<br/>"  + "$"+ Math.round(this.__data__.Revenue*100)/100)	 //rounded to nearest cent for formatting reasons
                .style("left", (d.pageX) + "px")		
                .style("top", (d.pageY - 30) + "px");	
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