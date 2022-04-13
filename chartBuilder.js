
(function(){

      
    

    function setUpInitialPrices(){ 
        
        //Make API call to EIA.gov site for latest oil prices (data is several days delayed, but its a free API)
        d3.json("https://api.eia.gov/series/?api_key=hYPPIWgyqbEj2ceHFqVy3dYzf1KK999ZG5qljHOu&series_id=PET.RWTC.D")
            .then(function(data){                
                console.log(data)
                console.log(data.series[0].data[0])
                let latestData = data.series[0].data[0]
                price = latestData[1] //newest price available in the API
                document.getElementById("currentPrice").innerHTML = "<h4>Current Price of Oil:  $" + price + "</h4>"
            })
            .catch(function(error){
                console.log("Encountered an error:")
                console.log(error)
            });
        


        const test = async () => {
            console.log("Test?")
            const response = await fetch("https://api.eia.gov/series/?api_key=hYPPIWgyqbEj2ceHFqVy3dYzf1KK999ZG5qljHOu&series_id=PET.RWTC.D")
            const json = await response.json().then(data => {
                console.log("Json")
                console.log("Json" + data)
            })            
        }

        
        document.getElementById("cutPercentage").innerHTML = "<h4>Proposed Production Cut:  " + cutPercentage + "%</h4>"
        document.getElementById("priceIncrease").innerHTML = "<h4>Expected Price Increase with Full Cooperation:  " + increasePercentage + "%</h4>"        
        document.getElementById("computedPrice").innerHTML = "<h4>New Price Based on OPEC actions:  $" + computedPrice + "</h4>"        
    }

    

    setUpInitialPrices()
    buildBubbleChart()
    buildBarChart()

    

})();