/** 
 * Code to display an array of data with the Google Chart API. 
 * Option to turn on or off data series by clicking on their legend entries.
 * Option to turn on or off all data series by clicking on a specific "hide all"
 * legend entries. Code by Georg Schadler with modified parts of code 
 * from Andrew Gallant (see Function Header below).
 * Email: geosch@nocash.at
 * 
 * The Code is licensed under a Creative Commons 
 * Attribution-NonCommercial-ShareAlike 3.0 Unported License. 
 * See: http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US
 **/

var arrayData;
var ws;
var defaultSeries;
var allHidden;
var addedHideAllSeries;

/**
 * Function init()
 * Initialises array with data and calls the drawChart() function
 **/
function init() {
  // The array with the data:
  arrayData = [ ['Year' , 'Group1', 'Group2', 'Group3', 'Group4'],
                ['2008' ,    300,     1600  ,      0,     1200  ],
                ['2009' ,    900,     1200  ,      0,     1600  ],
                ['2010' ,   1670,     1060  ,    250,     1350  ],
                ['2011' ,   1350,      820  ,    800,     1000  ],
                ['2012' ,   1280,      600  ,   1200,      800  ],
                ['2013' ,   1030,      540  ,   1950,      350  ] ];

  addedHideAllSeries = false;
  drawChart();
}

/**
 * Function drawChart()
 * Uses the Google Chart API to draw a chart of the arrived data. 
 * See https://developers.google.com/chart/
 **/
function drawChart() {
    // Add an "Hide all" series to the given data array only once:
    if(addedHideAllSeries == false) {
        arrayData[0].splice(1, 0, 'Hide all');
        for (var i = 1; i <  arrayData.length; i++) {
            arrayData[i].splice(1, 0, 0);
        }
        addedHideAllSeries = true;
    }

    var data  = new google.visualization.arrayToDataTable(arrayData);
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    // The default series which are displayed from the beginning, it starts
    // with index '2' for the first data entry, '0' and '1' have no effect:
    defaultSeries = [ 2, /*3,*/ 4, 5 ];
    
    // if there are 0's and 1's in the defaultSeries list remove them:
    for (var i = 0; i < 1; i++) {
        while(defaultSeries.indexOf(i) > -1) {
            defaultSeries.splice(defaultSeries.indexOf(i), 1)
        }
    }

    var columns = [ ];
    var series  = { };
    for (var i = 0; i < data.getNumberOfColumns(); i++) {
        // if the column is the domain column or in the default list, display the series:
        if (i == 0 || defaultSeries.indexOf(i) > -1) {
            columns.push(i);
        }
        // otherwise, hide it:
        else {
            columns[i] = {
                label: data.getColumnLabel(i),
                type : data.getColumnType(i),
                calc : function () {
                    return null;
                }
            };
        }
        // set the default series option:
        if (i > 0) {
            series[i - 1] = { };
            // backup the default color (if set):
            if (defaultSeries.indexOf(i) == -1) {
                if (typeof(series[i - 1].color) !== 'undefined') {
                    series[i - 1].backupColor = series[i - 1].color;
                }
                series[i - 1].color = '#CCCCCC';
            }
        }
    }    

    // Hide the "Hide all" series:
    columns[1] = {
        label: data.getColumnLabel(1),
        type : data.getColumnType(1),
        calc : function () {
            return null;
        }
    };

    // if no default series is given at the beginning set the 'show all' option:
    if(defaultSeries.length == 0) {   
        allHidden = true;
        columns[1].label = 'Show all';
    }
    else {
        allHidden = false;
        series[0].color = null;
    }

    var options = {
        title: 'Title goes here',
        backgroundColor: '#F4F4F6',
        vAxis: {title: 'Score', maxValue: 2000, minValue: 0},
        hAxis: {title: 'Year'}, 
        series: series
    };

    /**
     * Function selectionHandler()
     * Needed for the interactive selection. Modified Code of Andrew Gallant 
     * with additional "Hide all" option. The code is licensed under a
     * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License. 
     * See: http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US
     *      http://jsfiddle.net/asgallant/6gz2Q/
     **/
    function selectionHandler() {
        var sel = chart.getSelection();
        // if selection length is 0, we selected an element:
        if (sel.length > 0) {
            // if row is undefined, we clicked on the legend:
            if (sel[0].row == null) {
                var col = sel[0].column;
                // If user clicked on "hide all":
                if((col == 1) && (allHidden == false)){
                    var c;
                    // Hide all data-entrys:
                    for(c = 2; c < columns.length; c++) {
                        columns[c] = {
                            label: data.getColumnLabel(c),
                            type : data.getColumnType(c),
                            calc : function () {
                                return null;
                            }
                        };
                    }
                    // Grey out the all legend entrys:
                    for(s in series) {
                        series[s].color  = '#CCCCCC';
                    }
                    columns[1].label = 'Show all';
                    allHidden = true;
                }
                // Else if user clicked on a single viewable legend entry:
                else if (columns[col] == col) {
                    // hide the data series:
                    columns[col] = {
                        label: data.getColumnLabel(col),
                        type : data.getColumnType(col),
                        calc : function () {
                            return null;
                        }
                    };
                    // grey out the legend entry:
                    series[col - 1].color = '#CCCCCC';
                }
                // else entry is not viewable, so we display it:
                else {
                    // if user klicked "Hide all" when no entry where hidden:
                    if(col == 1) {
                        // display all legend entrys:
                        for (s in series) {
                            series[s].color = null;
                            // display all data series:
                            var c;
                            for (c = 2; c < columns.length; c++) {
                                columns[c] = c;
                            }
                        }
                        columns[1].label = 'Hide all';
                        allHidden = false;
                    }
                    // user clicked on single hidden legend entry, display it:
                    else {
                        columns[col] = col;
                        series[col - 1].color = null;
                    }
                }
                var view = new google.visualization.DataView(data);
                view.setColumns(columns);
                chart.draw(view, options);
            }
        }
    } // END function selectionHandler()
    
    google.visualization.events.addListener(chart, 'select', selectionHandler); 
    chart.draw(data , options);
    
    // create a view with the default columns:
    var view = new google.visualization.DataView(data);
    view.setColumns(columns);
    chart.draw(view, options);
}



