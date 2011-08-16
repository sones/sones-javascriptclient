/**
* sones GraphDB JavaScript Client Library 
* Copyright (C) 2007-2011 sones GmbH - http://www.sones.com
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU Lesser General Public
* License as published by the Free Software Foundation; either
* version 2.1 of the License, or (at your option) any later version.
* 
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
* Lesser General Public License for more details.
* 
* You should have received a copy of the GNU Lesser General Public
* License along with this library; if not, write to the Free Software
* Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*/

/**
 * GraphDB(2.0) Javascript Client
 * This client depends on:jquery-1.5.2.js, jquery.base64.js, jquery.urlencode.js
 * You have to include these files to use the client
 * !!!Please mind the Same-Origin-Policy of the browser!!!
 * For further information take a glance at the manual.pdf or README.TXT
 *  
 * @author Michael (Schille) Schilonka
 */
 
 //Add dependencies
function addDependencies() {
	addJavascript('lib/jquery/jquery-1.6.2.min.js');
	addJavascript('lib/jquery/jquery.base64.js');
	//addJavascript('lib/jquery/jquery.urlencode.js');
};


//simple add function, to add some used javascript files or other
function addJavascript(jsfile){
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.setAttribute('src', jsfile);
	head.appendChild(script);
}; 


//function to execute the query
function doQuery(gql){
			
			var Client = new GraphDBClient('localhost','test','test',80);
			var QueryResponse = Client.Query(gql);
			delete Client;
			return QueryResponse;
};


//featured core function to use
function GraphDBClient(myHost,myUsername,myPassword,myPort){
	
	this.Host = myHost;
	this.Username = myUsername;
	this.Password = myPassword;
	
	if(myPort == undefined){
		this.Port = '80';	
	} 
	else{
		this.Port = myPort;
	}
	
	this.UriTemplate = 'gql';
	this.Url = this.setUriFormat(this.Host,this.Port,this.UriTemplate);
	
};
GraphDBClient.prototype = {
	 /**
     * Generate the FQDN for the service
     * 
     */
	setUriFormat : function(myHost,myPort,myUriTemplate){
		return 'http://' + myHost + ':' + myPort + '/' + myUriTemplate;
	},
	/**
     * Insert a GQL Command to the GraphDB instance.
     * @param myGQLQuery the Query to insert
     * @return QueryResult Object if the Response was Successful - null if not!
     */
	Query: function(myGQLQuery){
		//encodedQuery = $.URLEncode(myGQLQuery);
		result = new GQLRestRequest(this.Url, myGQLQuery, this.Username, this.Password);
		return GenerateQueryResult(result);
	},
	/**
     * Returns the Uri of the specified Host.
     * 
     * @return String
     */
	 getHost: function(){
		return this.Host;
	}
};

//RESTful request to the GraphDB 
function GQLRestRequest(myRestUri, myGQLString,myUsername,myPassword){
	this.RestUri = myRestUri;
	
	var auth = 'Basic '+ $.base64Encode(myUsername+':'+myPassword);
	
	
	
	 
	 var jqxhr = $.ajax({
    	url : this.RestUri,
    	type : 'POST',
		cache: false,
        async: false,
        data: myGQLString,
		beforeSend: function(xhr){
			xhr.setRequestHeader('Accept','application/xml');
			xhr.setRequestHeader('Authorization',auth);
		}		
		});
	
	 //Return XHR
	 return jqxhr;
};

//method to parse the resceived xml response to 'prototypes' 
function GenerateQueryResult(resultxml){
	
	var result = resultxml.responseXML;
	if (result != undefined) {
	
		query = $(result).find("Query").attr("Value");
		language = $(result).find("Query").attr("Language");
		error = $(result).find("Query").attr("Error");
		duration = $(result).find("Query").attr("Duration");
		resulttype = $(result).find("Query").attr("ResultType");
		
		var ResultMeta = new QueryMeta(language, query, error, duration, resulttype);
		var VertexViews = ParseVertices($(result).children().children()[1]);
		
		queryResult = new QueryResult(VertexViews, ResultMeta);
		return queryResult;
	}
	return undefined;
};

//---Parser---
function ParseVertices(myVertexList){
	
	var payload = new Array()
	var k = 0;
	$(myVertexList).children().each(function(){
		payload[k] = ParseVertex(this);
		k++;	
	});
	
	return payload;
};
//Parser
function ParseVertex(myVertexView){
	var properties = new Array();
	var binaryproperties = new Array();
	var edges = new Array();
		
	var prop = $(myVertexView).children();
	if(prop != undefined){
		$.each(prop,function(){
			if (this.tagName == 'Properties') {
				properties = parseProperties(this);
			}
			if (this.tagName == 'BinaryProperties') {
				binaryproperties = parseBinaryProperties(this);
			}
			if (this.tagName == 'Edges') {
				edges = parseEdges(this);				
			}
			
		});
	}
	return new Vertex(properties,binaryproperties,edges);
};
//Parser
function parseProperties(myPropertyList){
	var properties = new Array()
	k = 0;
	$(myPropertyList).children().each(function(){	
		id = $(this).find('ID').text();
		type = $(this).find('Type').text();
		value = $(this).find('Value').text();
		properties[k] =  new Property(id, type, value);
		k++;
	});
	return properties;	
};
//Parser
function parseBinaryProperties(myBinaryPropertyList){
	var binaryproperties = new Array()
	k = 0;
	$(myBinaryPropertyList).children().each(function(){	
		id = $(this).find('ID').text();
		content = $(this).find('Content').text();
		binaryproperties[k] = new BinaryProperty(id,content);
		k++
	});
	return binaryproperties;	
};
//Parser
function parseEdges(myEdges){
	
	var edges = new Array();	
	k = 0;
	$(myEdges).children().each(function(){	
	
		type = $(this).attr("xsi:type");
	
		if(type == 'HyperEdgeView'){
			name = $(this).find("Name").text();
			edges[k] = parseHyperEdge(this);
			k++
		}
		
		if(type == 'SingleEdgeView'){
			name = $(this).find("Name").text();
			edges[k] = parseSingleEdge(this);
			k++;
		}
				
		});
		
			
	return edges;

};

function parseSingleEdge(mySingleEdge){
	var name = $(mySingleEdge).find("Name").text();
	var prop = $(mySingleEdge).children();
	if (prop != undefined) {
		$.each(prop, function(){
			if (this.tagName == 'Properties') {
				properties = parseProperties(this);
			}
			if (this.tagName == 'BinaryProperties') {
				binaryproperties = parseBinaryProperties(this);
			}
			if (this.tagName == 'TargetVertex') {
				targetvertex = ParseVertex(this);
			}
			
		});
		return new SingleEdge(name, properties, targetvertex);
	}
}

function parseHyperEdge(myHyperEdge){
	var name = $(myHyperEdge).find("Name:first").text();
	var singleEdges = new Array();
	var prop = $(myHyperEdge).children();
	var k = 0;
	if (prop != undefined) {
		$.each(prop, function(){
			if (this.tagName == 'Properties') {
				properties = parseProperties(this);
			}
			if (this.tagName == 'SingleEdge') {
				singleEdges[k] = parseSingleEdge(this);
				k++;
			}
			
		});
		return new HyperEdge(name, properties, singleEdges);
	}
}
//---Parser End---

//IGraphElements
function QueryResult(myVertexViewList,myQueryMeta){
	this.VertexViewList = myVertexViewList;
	this.QueryMeta = myQueryMeta;
};
QueryResult.prototyp = {
	getAllFetchedVertices: function(){
		return this.VertexViewList;
	},
	getQueryMeta: function(){
		return this.QueryMeta;
	}
};


function HyperEdge(myEdgeName,myEdgeProperties,mySingleEdges){
	this.type = "HyperEdge";
	this.Name = myEdgeName;
		
	if(!$.isEmptyObject(myEdgeProperties)){
		this.Properties = myEdgeProperties;
	}
	if(!$.isEmptyObject(mySingleEdges)){
		this.SingleEdges = mySingleEdges;
	}	
	
};
HyperEdge.prototype = {
	getName: function(){
		return this.Name;
	},
	hasProperties: function(){
		if (this.Properties != undefined) {
			return true;
		}
		return false;
	},
	getProperties: function(){
		return this.Properties;
	},
	hasProperty: function(myPropertyName){
		var found = false;
		$(this.Properties).each(function(){
			if (this.ID == myPropertyName) {
				found = true;
			}
		});
		return found;
	},
	getPropertyByID: function(myProperty){
		var proper = undefined;
		if (this.hasProperty(myProperty)) {
			$(this.Properties).each(function(){
				if (this.ID == myProperty) {
					proper = this
				}
			});
		}
		return proper;
	},
	getSingleEdges: function(){
		return this.SingleEdges;
	}
};

function SingleEdge(myEdgeName,myEdgeProperties,myTargetVertex){
	this.Name = myEdgeName;
	this.type = "SingleEdge";	
	if(!$.isEmptyObject(myEdgeProperties)){
		this.Properties = myEdgeProperties;
	}
	if(!$.isEmptyObject(myTargetVertex)){
		this.TargetVertex = myTargetVertex;
	}	
	
};

SingleEdge.prototype = {
	getName: function(){
		return this.Name;
	},
	getProperties: function(){
		return this.Properties;
	},
	getTargetVertex: function(){
		return this.TargetVertex;
	}
};

function Vertex(myPropertyList, myBinaryPropertyList, myEdges){

	if (!$.isEmptyObject(myPropertyList)) {
		this.Properties = myPropertyList;
	}
	if (!$.isEmptyObject(myBinaryPropertyList)) {
		this.BinaryProperties = myBinaryPropertyList;
	}
	if (!$.isEmptyObject(myEdges)) {
		this.Edges = myEdges;
	}
};

Vertex.prototype = {
	getProperties: function(){
		return this.Properties;
	},
	hasProperty: function(myPropertyName){
		var found = false;
		$(this.Properties).each(function(){
			if(this.ID == myPropertyName){
				found =  true;
			}
		});
		return found; 		
	},
	getPropertyByID: function(myProperty){
		var proper = undefined;
		if (this.hasProperty(myProperty)) {
		
			$(this.Properties).each(function(){
				if (this.ID == myProperty) {
					proper = this
				}
			});
		}
		return proper;
	},
	hasEdges: function(){
		if(this.Edges != undefined){
			return true
		}
		return false;
	},
	hasBinaryProperties: function(){
		if(this.BinaryProperties != undefined){
			return true
		}
		return false;
	},
	hasEdge: function(myEdge){
		var found = false;
		$(this.Edges).each(function(){
			if (this.getName() == myEdge) {
				found = true;
			}
		});
		return found;
	},
	getEdgeByName: function(myEdge){
		var edge = undefined;
		if (this.hasEdge(myEdge)) {
		
			$(this.Edges).each(function(){
				if (this.Name == myProperty) {
					return this;
				}
			});
		}
		return undefined;
	},
	hasBinaryProperty: function(myBinaryProperty){
		var found = false;
		$(this.BinaryProperties).each(function(){
			if (this.ID == myBinaryProperty) {
				found = true;
			}
		});
		return found;
	},
	getBinaryPropertybyID: function(myBinaryProperty){
		var binprop = undefined;
		if (this.hasBinaryProperty(myBinaryProperty)) {
			$(this.BinaryProperties).each(function(){
				if (this.ID == myBinaryProperty) {
					binprop = this
				}
			});
		}
		return binprop;
	},
	getBinaryProperties: function(){
		return this.BinaryProperties;
	},
	getAllSingleEdges: function(){
		var payload = new Array();
		k = 0;
		$(this.Edges).each(function(){
			if(this.type == "SingleEdge"){
				payload[k] = this;
				k++
			}
		});
		return payload;
	},
	getAllHyperEdges: function(){
		var payload = new Array();
		k = 0;
		$(this.Edges).each(function(){
			if(this.type == "HyperEdge"){
				payload[k] = this;
				k++
			}
		});
		return payload;
	}
};

function QueryMeta(myLanguage,myQueryString,myError,myDuration,myResulttype){
	this.QueryLanguage = myLanguage;
	this.QueryString = myQueryString;
	this.Error = myError;
	this.Duration = myDuration;
	this.ResultType = myResulttype; 
};
QueryMeta.prototype = {
	getQueryLanguage : function(){
		return this.QueryLanguage;
	},
	getQueryString : function(){
		return this.QueryString;
	},
	getError : function(){
		return this.Error;
	},
	getDuration : function(){
		return this.Duration;
	},
	getResultType : function(){
		return this.ResultType;
	},
};

function Property(myID,myType,myValue){

	this.ID = myID;
	this.Type = myType;
	this.Value = myValue;
};

function BinaryProperty(myID,myContent){
	this.ID = myID;
	this.Content = myContent;
};





