/*
 * sones GraphDB - OpenSource Graph Database - http://www.sones.com
 * Copyright (C) 2007-2010 sones GmbH
 *
 * This file is part of sones GraphDB OpenSource Edition.
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
 * DemoExample: to show the usage of the sones-javascriptclient for GraphDB
 * Please see the README.txt
 * 
 * @author Michael (Schille) Schilonka 
 */


function DemoExample(gql){
	var result = doQuery(gql)
	var div = document.getElementById("output");
	
	if(result.status != 503 && result.status != 0){
		
		var cont =  "<pre>";
        // gql string
        cont += "QueryString: " + result.getQueryString() + "<br/>";
      	// result type
		cont +=  "ResultType: <b>" + result.getResultType() + "</b><br/>";
        //duration in ms
        cont += "Duration: " + result.getDuration() + "<br/>";
        //warnings
        cont += "Warnings:<br/>";
		var warnings = result.getWarnings();
		if(warnings != ''){
			
		
		for(warning in warnings){
			warning = warnings[warning];
			cont += "&#160;&#160;" + warning.getID() + "&#160;&#160;" + warning.getMessage() + "<br/>"; 
		}
		}
		//errors
		cont += "Errors:<br/>";
		
		var errors = result.getErrors();
		if(errors != ''){
			
		
		for(error in errors){
			error = errors[error];
			cont += "&nbsp&nbsp" + error.getID() + "&nbsp&nbsp" + error.getMessage() + "<br/>"; 
		}
		}
		//vertices
		cont += "Vertices:<br/>";
		var vertices = result.getVertices();
		if(vertices != ''){
			
		
		for(vertex in vertices){
			var v = vertices[vertex];
			if(v.ObjectType == 'Vertex'){
				cont += printVertex(v,1);
			}
			
		}
		}
	}
	else{
		cont = "<b>Service unavailable!</b>"
	}
	div.innerHTML = cont;
	document.getElementById("gql").value = "";
};

function printVertex(myVertex, depth){
	var tabs = "";
	var content = "";
	
	for (var index = 0; index < depth; index++) {
		tabs += "&nbsp&nbsp";
	}
	//sometime occurs an error
	var attributes = myVertex.getAttributes();
	for (att in attributes) {
		
		if (attributes[att] instanceof Object) {
			if (attributes[att].ObjectType == "Edge") {
				content += tabs + attributes[att] + ":" + "<br/>";
				targetvertices = attributes[att].getTargetattertex();
				for (vertex in targetvertices) {
					printVertex(vertex, depth + 1);
				}
			}
			if (attributes[att].ObjectType == "ObjectUUID") {
				content += tabs + att + ":" + attributes[att].getUUID() + "<br/>";
			}
			if (attributes[att].ObjectType == "ObjectRevisionID") {
				content += tabs + att + ":" + attributes[att].TimeStamp + "<br/>";
			}
		}
		else {
			content += tabs + att + ":" + attributes[att] + "<br/>";
		}
				
	}
	return content;
};