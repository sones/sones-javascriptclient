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
 * This client depends on:jquery-1.4.2.js, jquery.base64.js, jquery.urlencode.js
 * You have to include these files to use the client
 * !!!Please mind the Same-Origin-Policy of the browser!!!
 * For further information takle a glance at the manual.pdf or README.TXT
 *  
 * @author Michael (Schille) Schilonka
 */

//Add dependencies
function addDependencies() {
	addJavascript('lib/jquery/jquery-1.5.2.js');
	addJavascript('lib/jquery/jquery.base64.js');
	//addJavascript('lib/jquery/jquery.urlencode.js');
};

//function to execute the query
function doQuery(gql){
			
			var Client = new GraphDBClient('localhost','test','test',9970);
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
		if (window.location.port != "")
		{
			this.Port= window.location.port
		}
		else
		{
			this.Port = "80";
		}
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
	Query : function(myGQLQuery){
		encodedQuery = myGQLQuery //$.URLEncode(myGQLQuery);
		result = new GQLRestRequest(this.Url+ encodedQuery,this.Username,this.Password);
		
		if(result.status == "200"){
				
		var xml = $(result.responseXML)['0'];
		querystring = $(xml).find('query').text();
		queryresulttype = $(xml).find('result').text();
		duration = ($(xml).find('duration').text()) + 'ms';
		
		queryerrors='';
		querywarnings='';
		queryresult='';
		
		if($(xml).find('errors').children()['0'] != undefined){
			queryerrors = this.readErrors($(xml).find('errors'));
		}
		if($(xml).find('warnings').children()['0'] != undefined){
			querywarnings = this.readWarnings($(xml).find('warnings'));
		}
		if($(xml).find('results').children()['0'] != undefined){
			queryresult = readVertices($(xml).find('results'));
		}
		
		
		
		return new QueryResult(queryresult,querywarnings,queryerrors,querystring,queryresulttype,duration);
		}
		else{
		return result;	
		}
		
	},
	/**
     * Returns the Uri of the specified Host.
     * 
     * @return String
     */
	 getHost : function(){
		return this.Host;
	},
	readErrors: function(myErrorNodes){
		var errorlist = new Array();
		i = 0;
		$(myErrorNodes).children().each(function(){
			id = $(this).attr('code');
			message = $(this).text();
			errorlist[i] = new UnspecifiedError(id, message);
			i++
		});
		return errorlist;
	},
	readWarnings : function (myWarningNodes){
		var warninglist = new Array();
		i = 0;
		$(myWarningNodes).children().each(function(){
			id = $(this).attr('code');
			message = $(this).text();
			warninglist[i] = new UnspecifiedWarning(id, message);
			i++
		});
		return warninglist;
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


// Prototyped structure of DBObjects...
function DBObject(){ObjectType = "DBObject"};
DBObject.prototype = {
	Attributes : new Object(),
	getObjectType : function(){
		return this.ObjectType;
	},
	getAttributes : function(){
		return this.Attributes;
	},
	getUUID : function(){
		if(this.Attributes['UUID'] != undefined){
			return new ObjectUUID(this.Attributes['UUID']);
		}
	},
	setUUID : function(myObjectUUID){
		this.Attributes['UUID'] = myObjectUUID;
	},
	setType : function(myType){
		this.Attributes['Type'] = myType;
	},
	getType : function(){
		if(this.Attributes['Type'] != undefined){
			return this.Attributes['Type'];
		}
	},
	setEdition : function(myEdition){
		this.Attributes['EDITION'] = myEdition;
	},
	getEdition : function(){
		if(this.Attributes['EDITION'] != undefined){
			return this.Attributes['EDITION'];
		}
	},
	setRevisionID : function(myRevision){
		this.Attributes['REVISION'] = myRevision;
	},
	getEdition : function(){
		if(this.Attributes['REVISION'] != undefined){
			return this.Attributes['REVISION'];
		}
	},
	setComment : function(myComment){
		this.Attributes['COMMENT'] = myComment;
	},
	getComment : function(){
		if(this.Attributes['COMMENT'] != undefined){
			return this.Attributes['COMMENT'];
		}
	},
	getAttributesCount : function(){
		return Attributes.length;
	},
	hasAttribute : function(myAttribute){
		return this.Attributes[myAttribute];
	},
	removeAttribute : function(myAttribute){
		delete this.Attributes[myAttribute]
	}
};

function Vertex(myAttributes){
	this.Attributes = myAttributes;
	this.ObjectType = "Vertex"
};

Vertex.prototype = {
	hasProperty : function(myPropertyName){
		property = this.getProperty(myPropertyName);
		if(property == undefined){
			return false;
		}
		if(property instanceof Vertex){
			return false;
		}
		return true;
	},
	getProperty : function(myPropertyName){
		return this.Attributes(myPropertyName);
	},
	hasEdge : function(myEdgeName){
		if(this.Attributes(myEdgeName)){
			return true;
		}
		return false;	
	},
	getEdge : function(myEdgeName){
		return this.Attributes(myEdgeName);
	},
	getNeighbour : function(myEdgeName){
		targetvertices = this.getNeighbours(myEdgeName);
		
		if(targetvertices != undefined){
			for(target in targetvertices){
				return target;
			}
		}
	},
	getNeighbours : function(myEdgeName){
		if((tmp = this.Attributes[myEdgeName]) instanceof Edge){
			return tmp.getTargetVertices();
		}
		return null;
	}	
};
Vertex.prototype = new DBObject();

function Edge(mySourceVertex,myTargetVertex,myAttributes){
	this.SourceVertex = mySourceVertex;
	this.TargetVertex = myTargetVertex;
	if(myAttributes != null || myAttributes != undefined){
		this.Attributes = myAttributes;
	}
	this.ObjectType = "Edge"
	return this;
};

Edge.prototype =  {
	setEdgeTypeName : function(myEdgeTypeName){
		this.EdgeTypeName = myEdgeTypeName;
	},
	getEdgeTypeName : function(){
		return this.EdgeTypeName;
	},
	getSourceVertex : function(){
		return this.SourceVertex;
	},
	getTargetVertices : function(){
		return this.TargetVertices;
	},
	getTargetVertex : function(){
		return this.TargetVertex;
	}
};
Edge.prototype = new DBObject();

function VertexGroup(myAttributes,myGroupedVertices){
	this.Attributes = myAttributes;
	this.GroupedVertices = myGroupedVertices;
}

VertexGroup.prototype = {
	getGroupedVertices : function(){
		return this.GroupedVertices;
	}
};
VertexGroup.prototype = new Vertex();

function VertexWeightedEdge(myAttributes,myWeight,myTypeName){
	this.Attributes = myAttributes;
	this.Weight = myWeight;
	this.TypeName = myTypeName;
}

VertexWeightedEdge.prototype = {
	getWeight : function(){
		return this.Weight;
	},
	setWeight : function(myWeight){
		this.Weight = myWeight; 
	},
	getTypeName : function(){
		return this.TypeName;
	},
	setTypeName : function(myTypeName){
		this.TypeName = myTypeName;
	}
};
VertexWeightedEdge.prototyp = new Vertex();

/**
 * An ObjectRevisionID is the identifier for an object revision.
 */
function ObjectRevisionID(myObjectRevisionID){
	
	//TODO: find a way to parse TimeStamp
	revisionID_Timestamp = myObjectRevisionID.substring(0,myObjectRevisionID.indexOf('('));
	revision_UUID = myObjectRevisionID.substring((revisionID_Timestamp.length) + 1,(myObjectRevisionID.length) - 1);
	this.ObjectType = "ObjectRevisionID"
	this.TimeStamp = revisionID_Timestamp;
	this.ObjectUUID = new ObjectUUID(revision_UUID);
};
ObjectRevisionID.prototype = {
	getTimeStamp : function(){
		return this.TimeStamp;
	},
	getObjectUUID : function(){
		return this.ObjectUUID;
	}
};

function ObjectUUID(myObjectUUID){
	this.ObjectType = "ObjectUUID";
	if(myObjectUUID == undefined){
		//TODO: MD5 Unique ID 
	}
	else{
		this.UUID = myObjectUUID;
	}
};
ObjectUUID.prototype = {
	getUUID : function(){
		return this.UUID;
	}
};

function UnspecifiedError(myID,myMessage){
	this.ID = myID;
	this.Message = myMessage;
};
UnspecifiedError.prototype = {
	getID : function(){
		return this.ID;
	},
	getMessage : function(){
		return this.Message;
	}
};

function UnspecifiedWarning(myID,myMessage){
	this.ID = myID;
	this.Message = myMessage;
};
UnspecifiedWarning.prototype = {
	getID : function(){
		return this.ID;
	},
	getMessage : function(){
		return this.Message;
	}
};

function QueryResult(myVertices,myWarnings,myErrors,myQueryString,myResultType,myDuration){
	this.Vertices = myVertices;
	this.Errors = myErrors;
	this.Warnings = myWarnings;
	this.QueryString = myQueryString;
	this.ResultType = myResultType;
	this.Duration = myDuration;
};
QueryResult.prototype = {
	getResultType : function(){
		return this.ResultType;
	},
	getErrors : function(){
		return this.Errors;
	},
	getWarnings : function(){
		return this.Warnings;
	},
	getQueryString : function(){
		return this.QueryString;
	},
	getDuration : function(){
		return this.Duration;
	},
	getVertices : function(){
		return this.Vertices;
	},
	setVertices : function(myVertices){
		this.Vertices = myVertices;
	}
};

function parseAttribute(myAttributeType, myAttributeValue){
		if (('Double' == myAttributeType) || ('Float' == myAttributeType)) {
			return parseFloat(myAttributeValue);
		}
		if (('Integer' == myAttributeType) || ('Int64' == myAttributeType) || ('Int32' == myAttributeType) || ('UInt64' == myAttributeType) || ('UInt32' == myAttributeType)) {
			return parseInt(myAttributeValue);
		}
		if ('ObjectUUID' == myAttributeType) {
			return new ObjectUUID(myAttributeValue);
		}
		if ('ObjectRevisionID' == myAttributeType) {
			return new ObjectRevisionID(myAttributeValue);
		}
		if ('DateTime' == myAttributeType) {
			//TODO: Parse Timereturn myAttributeValue;
		}
		return myAttributeValue;
};

 function generateEdgeContent(myEdge){
		var targetvertices = new Array();
		i = 0;
		
		$(myEdge).children().each(function(){
		targetvertices[i] = readVertex(this);
		i++;	
		});
		
		return targetvertices;
		
};

function readVertex(myVertex){
		var payload = new Object();
		
		$(myVertex).children().each(function(){
			attributename = $(this).attr('name');
			attributetype = $(this).attr('type');
			attributevalue = $(this).text();
			payload[attributename] = parseAttribute(attributetype,attributevalue);
		});
		
		$(myVertex).find('edge').children().each(function(){
			edgename = $(this).attr('name');
			edgetype = $(this).attr('type');
			targetvertices = generateEdgeContent(this);
			
			tmpEdge = new Edge('',targetvertices,'');
			tmpEdge.setEdgeTypeName(edgetype);
			
			payload['edgename'] = tmpEdge;
			
		});
		return new Vertex(payload);	
		
		//TODO: Add HyperEdge EdgeLabel	
};

function readVertices(myVertexNodes){
		var payload = new Array()
		i = 0;
		$(myVertexNodes).children().each(function(){
			payload[i] = readVertex(this);
			i++;	
		});
		return payload;
};

//simple add function, to add some used javascript files or other
function addJavascript(jsfile){
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.setAttribute('src', jsfile);
	head.appendChild(script);
}; 















