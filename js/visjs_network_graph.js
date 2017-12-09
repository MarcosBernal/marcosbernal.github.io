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
    {id: 17, label: 'Large Scale Distributed Computing'},
    {id: 18, label: 'Field Hockey'},
    {id: 19, label: 'EIT Digital - Master 2'}
]);

var nodes_es = new vis.DataSet([
    {id: 1, label: 'Marcos'},
    {id: 2, label: 'Bernal España'},
    {id: 3, label: 'Español'},
    {id: 4, label: 'Estudiante de Ciencia de Datos'},
    {id: 5, label: 'Universidad Politécnica de Madrid(UPM)'},
    {id: 6, label: 'Intereses'},
    {id: 7, label: 'Ingeniería Informática'},
    {id: 8, label: 'Ciencia de Datos'},
    {id: 9, label: 'Mente ingenieril'},
    {id: 10, label: 'Hockey'},
    {id: 11, label: 'Redes'},
    {id: 12, label: 'Seguridad'},
    {id: 13, label: 'Desarrollo Software'},
    {id: 14, label: 'Robótica'},
    {id: 15, label: 'Minería de Datos'},
    {id: 16, label: 'Aprendizaje automático'},
    {id: 17, label: 'Computación distribuida a gran escala'},
    {id: 18, label: 'Hockey hierba'},
    {id: 19, label: 'EIT Digital - Master 2'}
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
    {from: 8, to: 16, label:"belongsTo"},
    {from: 8, to: 17, label:"belongsTo"},
    {from:10, to: 18, label:"typeOf"},
    {from: 4, to: 19, label:"situation"}
]);

var edges_es = new vis.DataSet([
    {from: 1, to: 2, label:"apellido"},
    {from: 1, to: 3, label:"nacionalidad"},
    {from: 1, to: 4, label:"ocupación"},
    {from: 4, to: 5, label:"alumnoDe"},
    {from: 1, to: 6, label:"busca"},
    {from: 6, to: 7, label:"como"},
    {from: 6, to: 8, label:"como"},
    {from: 1, to: 9, label:"resumen"},
    {from: 1, to: 10, label:"practica"},
    {from: 7, to: 11, label:"perteneceA"},
    {from: 7, to: 12, label:"perteneceA"},
    {from: 7, to: 13, label:"perteneceA"},
    {from: 7, to: 14, label:"perteneceA"},
    {from: 8, to: 15, label:"perteneceA"},
    {from: 8, to: 16, label:"perteneceA"},
    {from: 8, to: 17, label:"perteneceA"},
    {from:10, to: 18, label:"tipeDe"},
    {from: 4, to: 19, label:"situación"}
]);

// create a network
var container = document.getElementById('mynetwork');

// provide the data in the vis format
var data = {
    nodes: nodes,
    edges: edges
};
var options = {
    nodes : {
        size : 20,

        font : {
            size : 18,
            color : 'black'
        },
        borderWidth : 2
    },
    edges : {
      font: {
          size : 16
      }
    },
    interaction: {
        dragView: false,
        zoomView: false
    },
    width: '100%',
    height: '100%',
    autoResize: false
};

  options['width'] = window.screen.width*0.8+'px';

if(window.screen.width < 900)
  options['height'] = '400px';
else
  options['height'] = $('#left_text').height()+'px';


// initialize your network!
var network = "";
if(getCookie('language')!= "")
  network = new vis.Network(container, { nodes: nodes_es, edges: edges_es }, options);
else
  network = new vis.Network(container, data, options);


network.fit();


function paintNetworkAgain(){
    options['width'] = window.screen.width*0.8+'px';
    options['height'] = $('#left_text').height()+'px';

    if (window.screen.width < 900)
      options['height'] = '400px';

    network.setSize(options['width'],options['height']);
    network.fit();

}
