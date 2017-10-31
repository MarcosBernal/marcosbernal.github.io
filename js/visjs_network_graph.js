// create an array with nodes
var nodes = new vis.DataSet([
    {id: 1, label: 'Marcos'},
    {id: 2, label: 'Bernal España'},
    {id: 3, label: 'Spaniard'},
    {id: 4, label: 'Data Science Student'},
    {id: 5, label: 'Technical School of Madrid(UPM)'},
    {id: 6, label: 'Interests'},
    {id: 7, label: 'Computer Engineering'},
    {id: 8, label: 'Data Science'},
    {id: 9, label: 'Problem Solving Person'},
    {id: 10, label: 'Hockey'},
    {id: 11, label: 'Networking'},
    {id: 12, label: 'Security'},
    {id: 13, label: 'Software Development'},
    {id: 14, label: 'Robotics'},
    {id: 15, label: 'Data Mining'},
    {id: 16, label: 'Machine Learning'},



]);

// create an array with edges
var edges = new vis.DataSet([
    {from: 1, to: 2, label:"familyName"},
    {from: 1, to: 3, label:"nationality"},
    {from: 1, to: 4, label:"hasOccupation"},
    {from: 4, to: 5, label:"alumniOf"},
    {from: 1, to: 6, label:"seeks"},
    {from: 6, to: 7, label:"like"},
    {from: 6, to: 8, label:"like"},
    {from: 1, to: 9, label:"summary"},
    {from: 1, to: 10, label:"plays"},
    {from: 7, to: 11, label:"belongsTo"},
    {from: 7, to: 12, label:"belongsTo"},
    {from: 7, to: 13, label:"belongsTo"},
    {from: 7, to: 14, label:"belongsTo"},
    {from: 8, to: 15, label:"belongsTo"},
    {from: 8, to: 16, label:"belongsTo"}
]);

// create a network
var container = document.getElementById('mynetwork');

// provide the data in the vis format
var data = {
    nodes: nodes,
    edges: edges
};
var options = {};

// initialize your network!
var network = new vis.Network(container, data, options);
