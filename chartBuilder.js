
(function(){

      
    

    function setUpInitialPrices(){ 
        
        //Make API call to EIA.gov site for latest oil prices (data is several days delayed, but its a free API)
        d3.json("https://api.eia.gov/series/?api_key=hYPPIWgyqbEj2ceHFqVy3dYzf1KK999ZG5qljHOu&series_id=PET.RWTC.D")
            .then(function(data){                
                console.log(data)
                console.log(data.series[0].data[0])
                let latestData = data.series[0].data[0]
                price = latestData[1] //newest price available in the API
                console.log(latestData)
                console.log(price)
                document.getElementById("currentPrice").innerHTML = price
                document.getElementById("computedPrice").innerHTML = price        
            })
            .catch(function(error){
                console.log("Encountered an error:")
                console.log(error)
                document.getElementById("currentPrice").innerHTML = 100
                document.getElementById("computedPrice").innerHTML = 100        
            });        
        
        
    }

    setUpInitialPrices()
    buildBubbleChart()
    buildBarChart()

})();

