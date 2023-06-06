$(function(){$mapusa=$(".map-usa"),$mapusa.mapael({map:{name:"usa_states",defaultArea:{attrs:{fill:"#ffffff",stroke:"#e3eaef"},attrsHover:{fill:"#4a81d4"}},zoom:{enabled:!0,maxLevel:10}},legend:{plot:{title:"American cities",slices:[{size:24,attrs:{fill:"#4a81d4"},label:"Product One",sliceValue:"Value 1"},{size:24,attrs:{fill:"#4fc6e1"},label:"Product Two",sliceValue:"Value 2"},{size:24,attrs:{fill:"#f1556c"},label:"Product Three",sliceValue:"Value 3"}]}},plots:{ny:{latitude:40.717079,longitude:-74.00116,tooltip:{content:"New York"},value:"Value 3"},an:{latitude:61.2108398,longitude:-149.9019557,tooltip:{content:"Anchorage"},value:"Value 3"},sf:{latitude:37.792032,longitude:-122.394613,tooltip:{content:"San Francisco"},value:"Value 1"},pa:{latitude:19.493204,longitude:-154.8199569,tooltip:{content:"Pahoa"},value:"Value 2"},la:{latitude:34.025052,longitude:-118.192006,tooltip:{content:"Los Angeles"},value:"Value 3"},dallas:{latitude:32.784881,longitude:-96.808244,tooltip:{content:"Dallas"},value:"Value 2"},miami:{latitude:25.789125,longitude:-80.205674,tooltip:{content:"Miami"},value:"Value 3"},washington:{latitude:38.905761,longitude:-77.020746,tooltip:{content:"Washington"},value:"Value 2"},seattle:{latitude:47.599571,longitude:-122.319426,tooltip:{content:"Seattle"},value:"Value 1"}}}),$mapusa.on("mousewheel",function(t){return 0<t.deltaY?($mapusa.trigger("zoom",$mapusa.data("zoomLevel")+1),console.log("zoom")):$mapusa.trigger("zoom",$mapusa.data("zoomLevel")-1),!1}),$(".mapcontainer").mapael({map:{name:"world_countries",defaultArea:{attrs:{fill:"#ffffff",stroke:"#7c8e9a"},attrsHover:{fill:"#4a81d4",stroke:"#4a81d4"}},defaultLink:{factor:.4,attrsHover:{stroke:"#f06292"}},defaultPlot:{text:{attrs:{fill:"#98a6ad"},attrsHover:{fill:"#98a6ad"}}}},plots:{paris:{latitude:48.86,longitude:2.3444,tooltip:{content:"Paris<br />Population: 500000000"}},newyork:{latitude:40.667,longitude:-73.833,tooltip:{content:"New york<br />Population: 200001"}},sanfrancisco:{latitude:37.792032,longitude:-122.394613,tooltip:{content:"San Francisco"}},brasilia:{latitude:-15.781682,longitude:-47.924195,tooltip:{content:"Brasilia<br />Population: 200000001"}},roma:{latitude:41.827637,longitude:12.462732,tooltip:{content:"Roma"}},miami:{latitude:25.789125,longitude:-80.205674,tooltip:{content:"Miami"}},tokyo:{latitude:35.687418,longitude:139.692306,size:0,text:{content:"Tokyo"}},sydney:{latitude:-33.917,longitude:151.167,size:0,text:{content:"Sydney"}},plot1:{latitude:22.906561,longitude:86.84017,size:0,text:{content:"Plot1",position:"left",margin:5}},plot2:{latitude:-.390553,longitude:115.586762,size:0,text:{content:"Plot2"}},plot3:{latitude:44.065626,longitude:94.576079,size:0,text:{content:"Plot3"}}},links:{link1:{factor:-.3,between:[{latitude:24.708785,longitude:-5.402427},{x:560,y:280}],attrs:{"stroke-width":2},tooltip:{content:"Link"}},parisnewyork:{factor:-.3,between:["paris","newyork"],attrs:{"stroke-width":2},tooltip:{content:"Paris - New-York"}},parissanfrancisco:{factor:-.5,between:["paris","sanfrancisco"],attrs:{"stroke-width":4},tooltip:{content:"Paris - San - Francisco"}},parisbrasilia:{factor:-.8,between:["paris","brasilia"],attrs:{"stroke-width":1},tooltip:{content:"Paris - Brasilia"}},romamiami:{factor:.2,between:["roma","miami"],attrs:{"stroke-width":4},tooltip:{content:"Roma - Miami"}},sydneyplot1:{factor:-.2,between:["sydney","plot1"],attrs:{stroke:"#6658dd","stroke-width":3,"stroke-linecap":"round",opacity:.6},tooltip:{content:"Sydney - Plot1"}},sydneyplot2:{factor:-.1,between:["sydney","plot2"],attrs:{stroke:"#6658dd","stroke-width":8,"stroke-linecap":"round",opacity:.6},tooltip:{content:"Sydney - Plot2"}},sydneyplot3:{factor:.2,between:["sydney","plot3"],attrs:{stroke:"#6658dd","stroke-width":4,"stroke-linecap":"round",opacity:.6},tooltip:{content:"Sydney - Plot3"}},sydneytokyo:{factor:.2,between:["sydney","tokyo"],attrs:{stroke:"#6658dd","stroke-width":6,"stroke-linecap":"round",opacity:.6},tooltip:{content:"Sydney - Plot2"}}}})});
