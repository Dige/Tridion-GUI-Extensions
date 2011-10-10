/*

**					Extensions.Configuration.Web

** Description

***	This is the web service coordinator for the Extensions Manager.
*** This is an internal object meant to only be used by the Manager object and not by any client code.

** Version

***	0.3

** By 

***	Yoav Niran (SDL Tridion)
*/

Type.registerNamespace("Extensions.Configuration");

Extensions.Configuration.Web = function ()
{
	this._baseUrl = "/WebUI/Editors/2011extensions/server/ExtensionsConfigurationManager/services/ExtensionsManagerService.svc/json/";
};

Extensions.Configuration.Web.prototype.test = function (success, error, state)
{
	this._doAjax("Test", null, success, error, "POST", state);
};

Extensions.Configuration.Web.prototype.fetchExtension = function (name, success, error, state)
{
	var data = { "name": name };

	this._doAjax("GetExtension", data, success, error, "GET", state);
}

Extensions.Configuration.Web.prototype.storeExtensionDefinition = function (name, description, title, fields, success, error, state)
{
	var data = { "name": name, "description": description, "title": title, "Fields": fields };
	
	this._doAjax("StoreExtensionDefinition", data, success, error, "POST", state);
};

Extensions.Configuration.Web.prototype.storeUserValues = function (extensionsValues, success, error, state)
{
	var data = { "extensionsValues": extensionsValues };

	this._doAjax("SaveUserValues", data, success, error, "POST", state);
};

Extensions.Configuration.Web.prototype.reloadValues = function (name, success, error, state)
{
	var data = { "name": name };

	this._doAjax("GetExtensionValues", data, success, error, "GET", state);
};

Extensions.Configuration.Web.prototype._doAjax = function (method, data, fnSuccess, fnError, type, state)
{
	if (!data) data = {};

	if (!type) type = "GET";

	if (type == "POST")
	{
		data = JSON.stringify(data);
	}

	var requestUrl = this._baseUrl + method;

	$j.ajax({
		type: type,
		cache: false,
		url: requestUrl,
		data: data,
		context: state,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (data, textStatus, jqXHR)
		{
			//$log.message("[Web._doAjax.success]: returned for method: '{0}' - data is: ".format(method) + data);
			//console.debug(data);

			if (data.hasOwnProperty("d")) data = data.d;

			fnSuccess(data, this);
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			fnError(jqXHR, this, textStatus, errorThrown);
		}
		//		,
		//		dataFilter: function (data)
		//		{
		//			var response;

		//			if (typeof (JSON) !== "undefined" && typeof (JSON.parse) === "function")
		//				response = JSON.parse(data);
		//			else
		//				response = eval("(" + data + ")");
		//			try
		//			{
		//				if (response.hasOwnProperty("d"))
		//					return response.d;
		//				else
		//					return response;
		//			}
		//			catch (error)
		//			{
		//				$log.error("failed to get d property!");
		//			}

		//			return response;
		//		}
	});
}