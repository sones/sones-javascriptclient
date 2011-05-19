/*
 * sones GraphDB(v2.0) - OpenSource Graph Database - http://www.sones.com
 * Copyright (C) 2007-2010 sones GmbH
 *
 * This file is part of sones GraphDB(v2.0) Community Edition.
 *
 * sones GraphDB OSE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * sones GraphDB OSE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with sones GraphDB OSE. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Demo: to show the usage of the sones-javascriptclient for GraphDB(2.0)
 * Please see the README.txt
 * 
 * @author Michael (Schille) Schilonka 
 */
var cont = "<pre>";

function DemoExample(gql){
	var QueryResult = doQuery(gql)
	var QueryMeta = QueryResult.QueryMeta;
	var VertexViewList = QueryResult.VertexViewList;
	var div = document.getElementById("output");
	
	if (true) {
	
		
		// gql string
		cont += "QueryString: " + QueryMeta.getQueryString() + "<br/>";
		// result type
		cont += "ResultType: <b>" + QueryMeta.getResultType() + "</b><br/>";
		//duration in ms
		cont += "Duration: " + QueryMeta.getDuration() + "<br/>";
		
		
		//errors
		cont += "Errors:" + QueryMeta.getError() + "<br/>";
		
		
		
		//vertices
		cont += "Vertices:<br/>";
		i = 0;
		$.each(VertexViewList,function(){
		cont += printVertex(this, 0, i);
		i++;
		});
			
	}
	else {
		cont = "<b>Service unavailable!</b>"
	}
	cont += "</pre>";
	div.innerHTML = cont;
	document.getElementById("gql").value = "";
};

function printVertex(myVertex, depth, i){
	var tabs = "";
	cont = "";
	depth++;
	for (var k = 0; k <= depth; k++){
	tabs += "&#160;&#160;";
	};
	
	cont += tabs + "<div style='border:solid; padding:5px; width:90%'>" + tabs + "<b>Vertex " + i + ":</b></br>" + tabs + "\\<br/>";	
	cont += tabs + "|<br/>";
	cont += tabs +  "|Properties:<br/>";	
	cont += tabs + "|<br/>";	
	var properties = myVertex.getProperties();
		if (properties.length != 0) {
			$.each(properties, function(){
				cont += "<div style='border:solid 1px, width:90%'>"
				cont += tabs + "ID: " + this.ID + "<br/>";
				cont += tabs + "Type: " + this.Type + "<br/>";
				cont += tabs + "Value: " + this.Value + "<br/>";
				cont += "</div></br>"
			});
		}
		cont += tabs +  "|<br/>";	
		cont += tabs +  "|BinaryProperties:<br/>";
		cont += tabs +  "|<br/>";	
		var binary = myVertex.getBinaryProperties();
		if(binary != undefined){
		$.each(binary,function(){
			cont += "<div style='border:solid 1px;padding:5px;width:90%'>"
			cont += tabs + "ID: " + this.ID + "<br/>";
			cont += tabs + "Content: " + this.Content + "<br/>";
			cont += "</div></br>"
			});	
		}
		
		cont += tabs +  "|<br/>";	
		cont += tabs +  "|Edges:<br/>";
		cont += tabs +  "|has Edges: " + myVertex.hasEdges() + "</br>";	
		cont += tabs +  "|<br/>";		
		var single = myVertex.getAllSingleEdges();
		if(single.length != 0){
			
			cont += printSingleEdges(single, tabs, depth);
		}
		
		
		var hyper = myVertex.getAllHyperEdges();
		if(hyper.length != 0){
			$(hyper).each(function(){
				var sing = this.getSingleEdges();
				if (sing.length != 0) {
						cont += "<div style='border:dashed;padding:5px; width:90%'>";
						cont += tabs + "<b>  ->" + this.Name + "(" + this.type + ")" + "</b><br/>";
						cont += printSingleEdges(sing, tabs, depth);
						cont += "</div>";
				}
				
			});
			 
			
		}
		
		
	cont += "</div>";	
	
	return cont;
}

function printSingleEdges(single, tabs,depth){
	cont = "";
	$.each(single,function(){
			var props = this.getProperties();
			cont += tabs +  "  ->" + this.Name +"(" + this.type + ")"+ "<br/>";
		 	cont += "<div>"
			cont += tabs +  "     \\<br/>";	
			cont += tabs +  "     |<br/>";	
			if (props != undefined) {
				if (props.length != 0) {
					$.each(properties, function(){
						cont += "<div style='border:dotted 1px;width:90%'>"
						cont += tabs + tabs + "ID: " + this.ID + "<br/>";
						cont += tabs + tabs + "Type: " + this.Type + "<br/>";
						cont += tabs + tabs + "Value: " + this.Value + "<br/>";
						cont += "</div></br>"
					});
				}
				
			}
				
				cont += printVertex(this.getTargetVertex(), depth++, 0);
				
				cont += "</div></br>";
				
			
			});
			return cont;
}


