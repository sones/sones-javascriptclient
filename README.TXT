sones Javascript Client

Simple Javascript client library to talk with a sones GraphDB - enterprise graph database management system.

Documentation:

For Usage take a glance in the Manual.pdf or the DemoExamlpe
For GQL Syntax see documentation at sones Developer-Wiki (http://developers.sones.de/category/gql/)

History:

2011-04-29 (initial release) by Michael Schilonka

	Features
		- simple connection to a GraphDB(2.0) REST service based on given URI and credentials
		- possibility to easily send GQL-Queries to the service
		- parsing methods to create a QueryResult out of the XML-Response 
		- API to handle vertices, edges and some result meta data
		- take one client to one instance of sones GraphDB Service
		- doQuery() - function for simplest access to the Database   
		
	DemoExample
		- simple javascript-pages to demonstrate the lib - with ajax support
		- use with the open source version 2.0, cause of the default port and credentials 
		- webshell like in and output (just not like a shell and parsed output) ;)
		
	!!!IMPORTANT!!!
		- because of the "Same-Origin-Policy" you will need to set up your server or use a proxy
		   ->there is a useful development proxy named PortResourceProxy 
 		     (http://github.com/schille/PortResouceProxy) - you can just set up "ResourceMap" and start to 
		     develop
		- you have to include "jquery-1.5.2.js","jquery.base64.js","jquery.urlencode" - these
		  files a not part of the Javascript Client (http://jquery.com/) and essential to the Javascript Client

		
	
	