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

/**
 * Function init()
 * Initialises array with data and calls the drawChart() function
 **/
function init() {
  // The array with the data. The second column is needed for
  // the "Hide/Show all" entry and the value of the data doesn''t matter, but 
  // it must be the same as the other data types:
  arrayData = [ ['Year' , 'Hide all', 'Group1', 'Group2', 'Group3', 'Group4'],
                ['2008' ,     0,         300,     1600  ,      0,     1200  ],
                ['2009' ,     0,         900,     1200  ,      0,     1600  ],
                ['2010' ,     0,        1670,     1060  ,    250,     1350  ],
                ['2011' ,     0,        1350,      820  ,    800,     1000  ],
                ['2012' ,     0,        1280,      600  ,   1200,      800  ],
                ['2013' ,     0,        1030,      540  ,   1950,      350  ] ];
  drawChart();
}

/**
 * Function drawChart()
 * Uses the Google Chart API to draw a chart of the arrived data. 
 * See https://developers.google.com/chart/
 **/
function drawChart() {
    google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(drawChart);
    
    var data  = google.visualization.arrayToDataTable(arrayData);
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    // The default series which are displayed from the beginning:
    defaultSeries = [  ];
    
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

    // if no no series are displayed at the beginning set the show all option:
    if(defaultSeries.length == 0) {   
        allHidden = true;
        columns[1].label = 'Show all';
    }
    // else if user only gave the 'hide all series as default':
    else if( (defaultSeries.length == 1) && (defaultSeries[0] == 1) ) {
        allHidden = true;
        columns[1].label = 'Show all';
        series[0].color = '#CCCCCC';
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
            if (typeof(sel[0].row) === 'undefined') {
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



