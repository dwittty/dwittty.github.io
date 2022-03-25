
var ourData = []
// Get the data
d3.csv("AllTotals.csv").then(function(data) {  
  ourData = data
  
  
  function CreateTable(data, columns) {
      var sortAscending = true;
      var table = d3.select("#container").append("table")                      
          tbody = table.append("tbody");
  
      // append the header row
      table.append('thead').append("tr")
          .selectAll("th")
          .data(columns)
          .enter()
          .append("th")
          .text(function(column) { return column; })
          .on('click', function(d)
            {         
                console.log(d)       
                //columnName = d.explicitOriginalTarget.textContent                                                                  
                columnName = d.srcElement.__data__
                if (sortAscending) {
                    schoolDataTable.selectAll("tbody tr")
                        .sort(function(a, b){
                            return d3.ascending(parseFloat(a[columnName]), parseFloat(b[columnName])) || d3.ascending(a[columnName], b[columnName]);                        
                        })
                    sortAscending = false;
                }
                else {
                    schoolDataTable.selectAll("tbody tr")
                        .sort(function(a, b){
                            return d3.descending(parseFloat(a[columnName]), parseFloat(b[columnName])) || d3.descending(a[columnName], b[columnName]);                        
                        })
                    sortAscending = true;
                }

                
                                                        
            });

      // create a row for each object in the data
      var rows = tbody.selectAll("tr")
          .data(data)
          .enter()
          .append("tr");
  
      // create a cell in each row for each column
      rows.selectAll("td")
          .data(function(row) {
              return columns.map(function(column) {
                  return {column: column, value: row[column]};
              });
          })
          .enter()
          .append("td")
          .attr("style", "font-family: Courier") // sets the font style
              .html(function(d) { return d.value; });
      
      return table;
  }    
  var schoolDataTable = CreateTable(data, data.columns);  

  });





