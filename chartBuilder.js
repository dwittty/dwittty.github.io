
(function(){

      
    

    function setUpInitialPrices(){        
        document.getElementById("currentPrice").innerHTML = "<h4>Current Price of Oil:  $" + price + "</h4>"
        document.getElementById("cutPercentage").innerHTML = "<h4>Proposed Production Cut:  " + cutPercentage + "%</h4>"
        document.getElementById("priceIncrease").innerHTML = "<h4>Expected Price Increase with Full Cooperation:  " + increasePercentage + "%</h4>"        
        document.getElementById("computedPrice").innerHTML = "<h4>New Price Based on OPEC actions:  $" + computedPrice + "</h4>"        
    }

    

    setUpInitialPrices()
    buildBubbleChart()
    buildBarChart()

    

})();