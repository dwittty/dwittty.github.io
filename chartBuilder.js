
(function(){

      
    

    function getOilPrice(){        
        document.getElementById("currentPrice").innerHTML = "<h3>Current Price of Oil:  $" + price + "</h3>"
        document.getElementById("cutPercentage").innerHTML = "<h3>Proposed Production Cut:  " + cutPercentage + "%</h3>"
        document.getElementById("priceIncrease").innerHTML = "<h3>Expected Price Increase with Full Compliance:  " + increasePercentage + "%</h3>"        
    }

    getOilPrice()
    buildBubbleChart()
    buildBarChart()

})();