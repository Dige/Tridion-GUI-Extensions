/*

**					Extensions.Configuration.Client

** Description

***	This is the interface point for extensions wishing to register their settings and consume user values
*** To create an extension configuratio in the Manager an extension will need to create a new instance
*** of the client with a unique name ('extensionId').

** Events

*** @initialized : raised after the extension definition and values are loaded from the server. 
***					note that this event will be raised regardless of whether the definition and/or values
***					are already stored on the server		
*** @created : raised when the commiting of the extension definition is successfully stored on the server
*** @reloaded : raised when the extension's values are returned from the server when the reload method is called

** Version

***	0.3

** By 

***	Yoav Niran (SDL Tridion)
*/

Type.registerNamespace("Extensions.Configuration");

Extensions.Configuration.Client = function Client(extensionId)
{
	Tridion.OO.enableInterface(this, "Extensions.Configuration.Client");
	this.addInterface("Tridion.ObjectWithEvents");

	this.properties._isInit = false;
	this.properties.id = extensionId;

	this.properties.description = "";
	this.properties.title = "";
	this.properties.fields = new Array();
	this.properties.fieldsNames = new Array();
			
	this.properties._serverDescription = "";
	this.properties._serverTitle = "";
	this.properties._serverFields = null;
	this.properties._serverFieldsNames = new Array();

	$extConfManager.registerClient(this);
};

///
///init: should be called after the create method and before any other method!
/// --callback: the callback method will be called when initializing completes with the definition retrieved, a boolean stating that it was found, and the state if its provided
Extensions.Configuration.Client.prototype.init = function (callback, state)
{
	var p = this.properties;
	var context = this;

	if (!state) state = null;

	$extConfManager.createExtension(p.id);

	$extConfManager.fetch(p.id, function (definition, state) //fetch config from server (if already there)
	{
		var loaded = false;

		if (definition)
		{
			if (definition.Exists)
			{
				//not setting p.fields to the definition fields. to allow for updating to occur //p.fields = definition.Fields
				p.description = definition.Description;
				p.title = definition.Title;

				//update server data so its possible to compare to client data
				p._serverFields = Object.deepCopy(definition.Fields); //need to get a clone of the array and not a reference to be able to keep them separated
				p._serverDescription = definition.Description;
				p._serverTitle = definition.Title;

				$log.message("[Configuration.Client.init]: received {0} fields from the server for extension: '{1}'".format(p._serverFields.length, p.id));

				for (var f = 0; f < definition.Fields.length; f++)
				{
					var field = definition.Fields[f];

					if (field.Name && field.Name.length > 0) p._serverFieldsNames.push(field.Name);
				}

				//$extConfManager.setFields(p.id, p.fields);

				loaded = true
			}
			else
				$log.message("[Configuration.Client.init]: extension definition with name: '{0}' doesnt exist on the server".format(p.id));
		}

		p._isInit = true;
		
		context.fireEvent("initialized");

		if (callback) callback(definition, loaded, state);
	}, state);
};

///
/// Will send the extension definition:the fields, title and description registered to the client, 
/// on to the server
/// --callback: the method that will be called when the commit finished. the callback method will be passed
///				one boolean parameter stating whether the commit was successful or not.
Extensions.Configuration.Client.prototype.create = function (callback)
{
	var p = this.properties;
	var context = this;

	if (p._isInit) //check that the config object is initialized!!!
	{
		if (p.fields && p.fields.length > 0)
		{
			if (this._isDifferentFromServer()) //only update the server if the fields contained in this object are different from what was already retrieved from the server previously
			{
				$log.message("[Configuration.Client.create]: client fields are different from server fields for extension: '{0}'".format(p.id));

				$extConfManager.setFields(p.id, p.fields);
				$extConfManager.setDescription(p.id, p.description);
				$extConfManager.setTitle(p.id, p.title);

				$extConfManager.commit(p.id, function (success)
				{
					if (success) context.fireEvent("created");
					if (callback) callback(success);
				});
			}
			else
				$log.message("[Configuration.Client.create]: Not committing field definition for '{0}', client is same as server!".format(p.id));
		}
		else
			$log.error("[Configuration.Client.create]: Not committing field definition for '{0}', not fields added!".format(p.id));
	}
	else
		$log.error("[Configuration.Client.create]: Extension Client Configuration was not initialized!");
};

///
/// Returns the first value of the field specified
/// --name: The name of the field to return value for
Extensions.Configuration.Client.prototype.getValue = function (name)
{
	var values = this.getValues(name);

	if (values && values.length > 0) return values[0];

	return null;
};

///
/// Returns the value(s) of the field specified as an array
/// --name: The name of the field to return values for
Extensions.Configuration.Client.prototype.getValues = function (name)
{
	var p = this.properties;

	return $extConfManager.getValue(p.id, name);
};

///
///This is a utility method encapsulating the logic to check whether a Groups field has been set with
///a value(s), meaning group id, which the current user is a member of
///--name: The name of the Groups field to return values for
///--adminAllowed: boolean specifying whether an admin user is always allowed, regardless of the groups
Extensions.Configuration.Client.prototype.isGroupsValueAllowed = function (name, adminAllowed)
{
	var p = this.properties;
	var allowed = false;

	var fieldValues = this.getValues(name);

	if (fieldValues)
	{		
		if (fieldValues.length > 0 && fieldValues[0] == $extConfConsts.ALL_OPTION) //all groups are selected
		{			
			allowed = true;
		}
		else
		{			
			if (!adminAllowed || !$extUtils.isCurrentUserAdmin())
			{
				for (var i = 0; i < fieldValues.length; i++) //check whether user allowed to use the tool
				{
					if ($extUtils.isCurrentUserInGroup(fieldValues[i]))
					{
						$log.message("[Configuration.Client.isGroupsValueAllowed]: group value allowed for current user is part of group: '{0}'".format(fieldValues[i]));
						allowed = true;
						break;
					}
				}

				$log.message("[Configuration.Client.isGroupsValueAllowed]: group value NOT allowed!");
			}
			else
				allowed = true;			
		}
	}
	else
		allowed = true;

	return allowed;
};

///
/// addField: adds a new field to the collection of configuration fields for this extension
/// --name: the name of the field (unique)
///	--props: field properties: (Type, AdminOnly, MultipleValue, HelpText, Default)
/// --options: for fields of type OPTION a collection of the options: (Name, Value)
/// --alternatively can accept an instance of a 'Extensions.Configuration.Field' object instead of the 3 parameters
Extensions.Configuration.Client.prototype.addField = function () //name, props, options
{
	if (arguments)
	{
		if (arguments.length > 0)
		{
			var p = this.properties;

			if (p._isInit) //check that the config object is initialized!!!
			{
				var field = null;
				var name = null;
				var isUpdate = false;

				if (arguments[0].constructor == Extensions.Configuration.Field)
				{
					field = arguments[0];
					name = field.Name;
				}
				else
				{
					name = arguments[0];
					var props = arguments[1];
					var options = (arguments.length > 2 ? arguments[2] : null);
					isUpdate = (arguments.length > 3 ? arguments[3] : false); //should only be passed from the updateField method (internal!!!)

					field = new $$ec.Field(name, props, options);
				}

				var fields = p.fields;

				if (!this.hasField(name, isUpdate))
				{
					p.fieldsNames.push(name);

					fields.push(field);
				}
				else
					$log.error("[Configuration.Client.addField]: '{0}' extension configuration fields already contain '{1}'".format(p.id, name));
			}
			else
				$log.error("[Configuration.Client.addField]: Extension Client Configuration was not initialized!");
		}
	}
};

///
/// updateField: very similar to the 'addField' method but unlike that method will not log an error
/// when a field with the same name already exists in the collection but rather replace it with the new properties
/// if no field with this name already exists it will add it to the collection
/// --name: the name of the field (unique)
///	--props: field properties: (Type, AdminOnly, MultipleValue, HelpText, Default)
/// --options: for fields of type OPTION a collection of the options: (Name, Value)
Extensions.Configuration.Client.prototype.updateField = function (name, props, options)
{
	var p = this.properties;

	if (!options) options = null;

	if (p._isInit) //check that the config object is initialized!!!
	{
		if (this.hasField(name))
		{
			$log.message("[Configuration.Client.updateField]: update field called for field '{0}'".format(name));

			var fields = this.getFields();

			var foundToReplace = false;

			for (var i = 0; i < fields.length; i++)
			{
				var field = fields[i];

				if (field.Name == name) //found field in fields collection
				{
					var newField = new $$ec.Field(name, props, options);

					if (this._areFieldsDifferent(field, newField)) //new field is different from existing field
					{
						$log.message("[Configuration.Client.updateField]: replacing field in collection: '{0}'".format(name));

						fields.splice(i, 1, newField);

						foundToReplace = true;
					}

					break;
				}
			}
			
			if (!foundToReplace) //if field with this name was retrieved from server but not added by client yet
			{
				this.addField(name, props, options, true); 
			}
		}
		else
			this.addField(name, props, options); //field doesnt exist yet, add it to the collection
	}
	else
		$log.error("[Configuration.Client.updateField]: Extension Client Configuration was not initialized!");
};

///
///checks whether the extension definition already contains a field with the specified name
Extensions.Configuration.Client.prototype.hasField = function (name)
{
	var exists = false;
	var clientOnly = false;

	if (arguments.length > 1)
	{
		clientOnly = (arguments[1] === true);
	}

	exists = this.properties.fieldsNames.contains(name);

	if (!clientOnly)
	{
		if (!exists) exists = this.properties._serverFieldsNames.contains(name);
	}

	return exists;
}; 

///
///Clears all fields definitions and description
Extensions.Configuration.Client.prototype.clear = function ()
{
	var p = properties;

	p.fields = new Array();
	p.fieldsNames = new Array();	
	p.description = "";
	p.title = "";

	p._serverFields = null;
	p._serverDescription = "";
	p._serverTitle = "";
}

///
/// reload: will reload the user and admin values from the server for this extension
/// --callback: the method to be called when the reload is done. callback receives the result object and the optional state
/// --state: an optional object which will be made available to the callback method (as the second paramter)
Extensions.Configuration.Client.prototype.reload = function (callback, state)
{
	var p = this.properties;
	var context = this;

	if (p._isInit) //check that the config object is initialized!!!
	{
		$extConfManager.reload(p.id, function (result, state)
		{
			context.fireEvent("reloaded");
			if (callback) callback(result, state);

		}, state);
	}
	else
		$log.error("[Configuration.Client.reload]: Extension Client Configuration was not initialized!");
};

///
///returns the collection of fields already in the extension definition
Extensions.Configuration.Client.prototype.getFields = function ()
{
	return this.properties.fields;
};

///
///returns the description set for the extension definition
Extensions.Configuration.Client.prototype.getDescription = function ()
{
	return this.properties.description;
};

///
///sets the description for the extension definition
Extensions.Configuration.Client.prototype.setDescription = function (description)
{
	var p = this.properties;

	if (p._isInit)
	{
		p.description = description;
	}
	else
		$log.error("[Configuration.Client.setDescription]: Extension Client Configuration was not initialized!");
};

///
///returns the title set for the extension definition
Extensions.Configuration.Client.prototype.getTitle = function ()
{
	return this.properties.title;
};

///
///sets the title for the extension definition
Extensions.Configuration.Client.prototype.setTitle = function (title)
{
	var p = this.properties;

	if (p._isInit)
	{
		p.title = title;
	}
	else
		$log.error("[Configuration.Client.setTitle]: Extension Client Configuration was not initialized!");
};

///
///sets a validator for a field type to be applied to fields of this extension
Extensions.Configuration.Client.prototype.setFieldTypeValidator = function (type, validator)
{
	var p = this.properties;

	$extConfManager.setFieldTypeValidator(type, validator, p.id);
};

/**************************************** Internal Methods *************************************/

///
///Compare the definition loaded from the server with the one currently held in memory
Extensions.Configuration.Client.prototype._isDifferentFromServer = function ()
{
	var p = this.properties;

	if (p.description != p._serverDescription) return true;
	if (p.title != p._serverTitle) return true;

	if (p._serverFields)
	{
		var server = p._serverFields;
		var current = p.fields;

		if (server.length != current.length) return true;

		for (var cf = 0; cf < current.length; cf++)
		{
			var foundMatch = false;
			var currentField = current[cf];

			for (var sf = 0; sf < server.length; sf++)
			{
				var serverField = server[sf];

				if (serverField.Name == currentField.Name)
				{
					var areDifferent = this._areFieldsDifferent(currentField, serverField);

					if (areDifferent) return true;

					foundMatch = true;
				}
			}

			if (!foundMatch) return true; //if no match with server fields found then we're different!
		}
	}
	else
		return true; //if no server fields found then different is true!

	return false;
};

Extensions.Configuration.Client.prototype._areFieldsDifferent = function (fieldA, fieldB)
{
	if (fieldA.Name != fieldB.Name) return true;	
	if (fieldA.Type != fieldB.Type) return true;	
	if (fieldA.AdminOnly != fieldB.AdminOnly) return true;	
	if (fieldA.MultipleValue != fieldB.MultipleValue) return true;	
	if (fieldA.HelpText != fieldB.HelpText) return true;	
	if (fieldA.DefaultValue != fieldB.DefaultValue) return true;	

	if (fieldA.Options && fieldB.Options)
	{
		if (fieldA.Options.join("") != fieldB.Options.join("")) return true;
	}
	else
	{
		var optA = (fieldA.Options ? fieldA.Options.length : 0);
		var optB = (fieldB.Options ? fieldB.Options.length : 0);

		if (optA != optB) return true;
	}
	
	//$log.message("[Client._areFieldsDifferent]: field '{0}' is a match for field '{1}'".format(fieldA.Name, fieldB.Name));
	return false;
};