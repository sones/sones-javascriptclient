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
 * DemoExample: to show the usage of the sones-javascriptclient for GraphDB(2.0)
 * Please see the README.txt
 * 
 * @author Michael (Schille) Schilonka 
 */


function DemoExample(gql){
	var QueryResult = doQuery(gql)
	var QueryMeta = QueryResult.QueryMeta;
	var VertexViewList = QueryResult.VertexViewList;
	var div = document.getElementById("output");
	
	if (true) {
	
		var cont = "<pre>";
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
		cont += "<h4>Vertex " + i + ":</h4>";	
		var properties = this.getProperties();
			$.each(properties,function(){
			cont += "<div style='padding:5px'>"
			cont += "ID: " + this.ID + "<br/>";
			cont += "Type: " + this.Type + "<br/>";
			cont += "Value: " + this.Value + "<br/>";
			cont += "</div>"
			});
			i++;
		});
			
	}
	else {
		cont = "<b>Service unavailable!</b>"
	}
	div.innerHTML = cont;
	document.getElementById("gql").value = "";
};
