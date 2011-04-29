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
 * GraphDB Javascript Client
 * This client depends on:jquery-1.5.2.js, jquery.base64.js, jquery.urlencode.js
 * You have to include these files to use the client
 * !!!Please mind the Same-Origin-Policy of the browser!!!
 * For further information take a glance at the manual.pdf or README.TXT
 *  
 * @author Michael (Schille) Schilonka
 */
 
 //Add dependencies
function addDependencies() {
	addJavascript('lib/jquery/jquery-1.5.2.min.js');
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
	
	this.UriTemplate = 'gql?';
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
		result = new GQLRestRequest(this.Url + myGQLQuery, this.Username, this.Password);
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
function GQLRestRequest(myRestUri,myUsername,myPassword){
	this.RestUri = myRestUri;
	
	var auth = 'Basic '+ $.base64Encode(myUsername+':'+myPassword);
	
	
	this.Verb = 'GET';
	this.AcceptType = 'application/xml';
	 
	 jqxhr = $.ajax({
    	url : this.RestUri,
    	method : this.Verb,
		cache: false,
        async: false,
        timeout: 0,
		username : this.Username,
		password : this.Password,
		accepts : 'text/xml',
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
		var VertexViewList = ParseVertices($(result).children().children()[1]);
		
		queryResult = new QueryResult(VertexViewList, ResultMeta);
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
				edges = parseEdge(this);				
			}
			
		});
	}
	return new Vertex(properties,binaryproperties,edges);
};
//Parser
function parseProperties(myPropertyList){
	var properties = new Array()
	var m = 0;
	$(myPropertyList).children().each(function(){	
		id = $(this).find('ID').text();
		type = $(this).find('Type').text();
		value = $(this).find('Value').text();
		properties[m] =  new Property(id, type, value);
	m++;
	});
	return properties;	
};
//Parser
function parseBinaryProperties(myBinaryPropertyList){
	var binaryproperties = new Array()
	var i = 0;
	$(myBinaryPropertyList).children().each(function(){	
		id = $(this).find('ID').text();
		content = $(this).find('Content').text();
		binaryproperties[i] = new BinaryProperty(id,content);
		i++;
	});
	return binaryproperties;	
};
//Parser
function parseEdge(myEdges){
	var edgetupel = new Array()
	var a = 0;
	$(myEdges).children().each(function(){	
		name = $(this).find('Name').text();
		edge = $(this).find('Edge');
		$(edge).children().each(function(){	
			if (this.tagName == 'CountOfProperties') {
				countofproperties = $(this).text();
			}
			if (this.tagName == 'Properties') {
				edgeproperties = parseProperties(this);
			}
			if (this.tagName == 'VertexViewList') {
				targetVertices = ParseVertices(this);			
			}
		});
		edgetupel[a] = new Edge(name,countofproperties,edgeproperties,targetVertices);
		a++;
		});
	
	return edgetupel;

};
//---Parser---

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


function Edge(myEdgeName,myCountOfProperties,myEdgeProperties,myTargetVertices){
	
	this.Name = myEdgeName;
	this.CountOfProperties = myCountOfProperties;
	
	if(!$.isEmptyObject(myEdgeProperties)){
		this.Properties = myEdgeProperties;
	}
	if(!$.isEmptyObject(myTargetVertices)){
		this.TargetVertices = myTargetVertices;
	}	
	
};
Edge.prototype = {
	getName: function(){
		return this.Name;
	},
	getCountOfProperties: function(){
		return this.CountOfProperties;
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
	getProperty: function(myProperty){
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
	hasTargetVertices: function(){
		if (this.TargetVertices != undefined) {
			return true;
		}
		return false;
	},
	getTargetVertices: function(){
		if (this.hasTargetVertices) {
			return this.TargetVertices;
		}
		return undefined;
	}
};

function Vertex(myPropertyList,myBinaryPropertyList,myETupelList){
	
	if(!$.isEmptyObject(myPropertyList)){
		this.Properties = myPropertyList;
	}
	if(!$.isEmptyObject(myBinaryPropertyList)){
		this.BinaryProperties = myBinaryPropertyList;
	}
	if(!$.isEmptyObject(myETupelList)){
		this.Edges = myETupelList;
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
	getProperty: function(myProperty){
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
			if (this.Name == myEdge) {
				found = true;
			}
		});
		return found;
	},
	getEdge: function(myEdge){
		var edge = undefined;
		if (this.hasEdge(myEdge)) {
		
			$(this.Edges).each(function(){
				if (this.Name == myProperty) {
					edge = this
				}
			});
		}
		return edge;
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
	getBinaryProperty: function(myBinaryProperty){
		var binprop = undefined;
		if (this.hasBinaryProperty(myBinaryProperty)) {
			$(this.BinaryProperties).each(function(){
				if (this.ID == myBinaryProperty) {
					binprop = this
				}
			});
		}
		return binprop;
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





