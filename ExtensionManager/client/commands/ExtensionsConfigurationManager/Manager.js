/*

**					Extensions.Configuration.Manager ($extConfManager)

** Description

***	This is the global manager of the extensions configuration. All extensions must be registered
***	through the single instance of this object ($extConfManager). It will manage the communication
***	between all registered clients, the server side and the Manager view (popup).
*** All clients should NOT use this object but register their configuration through a new 
***	instance of the Extensions.Configuration.Client class
	
** Events

***	@event: saveStarted : raised when the saveSettings method is called
***	@event: saveFinished : raised when saveSettings returns from web service successfully or not.
***	@event: saveError : raised when a network or server error occurs during the saveSettings process

** Version

***	0.3

** By 

***	Yoav Niran (SDL Tridion)
*/

Type.registerNamespace("Extensions.Configuration");

Extensions.Configuration.Manager = function Manager()
{
	Tridion.OO.enableInterface(this, "Extensions.Configuration.Manager");
	this.addInterface("Tridion.ObjectWithEvents");

	this._extensions = {};
	this._extensionsNames = new Array();
	this._count = 0;
	this._groups = new Array();
	this._validators = new Array();
	this._isSaving = false;
	this._errorMsg = null;

	this._loadGroups();
	this._initializeValidators();

	this._clients = new Array();
};

Extensions.Configuration.Manager.prototype.registerClient = function (client)
{
	this._clients.push(client);
};

Extensions.Configuration.Manager.prototype.createExtension = function (name)
{
	if (!this._extensions[name])
	{
		this._extensions[name] = { "Id": name, 
									"Description": "", 									
									"Title": "",
									"Commited": false, 
									"Fields": [],
									"Values": [], 
									"AdminValues": [],
									"Index": this._count,
									"HasAdmin": false,
									"AdminOnly": true,
									"HasGroupsField": false,
									"ValuesChanged": false };

		this._extensionsNames.push(name);
		this._count++;

		$log.info("[Configuration.Manager.createExtension]: Added extension with name: '{0}'".format(name));
	}
	else
		$log.error("[Configuration.Manager.createExtension]: Extension with name '{0}' already exists".format(name));
};

Extensions.Configuration.Manager.prototype.fetch = function (name, callback, state)
{
	if (this._extensions[name])
	{		
		var context = this;
		var service = new $$ec.Web();

		service.fetchExtension(name,
			function (result, state)
			{
				if (result.Success)
				{
					context._setValues(name, result.Values);

					if (result.Extension.Exists)
					{						
						context.setFields(name, result.Extension.Fields);						
						context.setDescription(name, result.Extension.Description);
						context.setTitle(name, result.Extension.Title);
					}

					callback(result.Extension, state);
				}
				else
				{
					$log.error("[Configuration.Manager.fetch]: fetch was unsuccessful, server message: '{0}'".format(result.Message));
					$messages.registerError("Unable to retrieve extensions configuration", result.Message);					
				}
			},
			function (xhr, state, status, error)
			{
				$log.error("[Configuration.Manager.fetch]: error on web call");
				$messages.registerError("Unable to retrieve extensions configuration", result.Message);				
			},
			state);
	}
	else
		$log.error("[Configuration.Manager.fetch]: Extension with name '{0}' doesnt exist".format(name));
};

Extensions.Configuration.Manager.prototype.commit = function (name, callback)
{
	if (this._extensions[name])
	{
		$log.message("[Configuration.Manager.commit]: about to commit extension with name: '{0}'".format(name));

		var service = new $$ec.Web();
		var definition = this._extensions[name];

		service.storeExtensionDefinition(name, definition.Description, definition.Title, definition.Fields,
			function (result, context)
			{
				if (result)
				{
					$log.message("[Configuration.Manager.commit]: returned from web call, success: '{0}'".format(result.Success));

					var success = false;

					if (result.Success)
					{
						definition.Commited = true;
						success = true;
					}
					else
						$log.message("[Configuration.Manager.commit]: Commit was unsuccessful! message: '{0}'".format(result.Message));

					if (callback) callback(success);
				}
				else
					$log.message("[Configuration.Manager.commit]: returned from web call but result is null!");
			},
			function (xhr, context, status, error)
			{
				$log.error("[Configuration.Manager.commit]: error on web call");
			},
			this);
	}
	else
		$log.error("[Configuration.Manager.commit]: Extension with name '{0}' doesnt exist".format(name));
};

Extensions.Configuration.Manager.prototype.saveSettings = function (callback)
{
	$log.message("[Configuration.Manager.saveSettings]: about to save all changes".format(name));

	this._isSaving = true;
	this.fireEvent("saveStarted");

	var msg = $messages.registerProgress("Saving changes...", null, false, false, false);
	msg.setOnSuccessMessage("Settings Successfully Saved");

	var invalidValues = this.getInvalidValues();
	 
	var opComplete = function (success, msgText, context) //inline method to call when save is finished (successfully or not)
	{
		if (context._errorMsg) context._errorMsg.doArchive();

		msg.finish({ "success": success });

		if (!success)
		{
			if (!msgText) msgText = "Error!";

			context._errorMsg = $messages.registerError("Error occurred during Save!", msgText, false, false)
		}
	}

	if (invalidValues.length == 0)
	{
		var extensionsValues = new Array();

		for (var i = 0; i < this._count; i++)
		{
			var extension = this._extensions[this._extensionsNames[i]];

			if (extension.ValuesChanged) //only send the extensions values for those that changed
			{
				extensionsValues.push({
					"Name": extension.Id,
					"Fields": extension.Values,
					"AdminFields": extension.AdminValues
				});
			}
		}

		var service = new $$ec.Web();

		service.storeUserValues(extensionsValues,
			function (result, context)
			{
				$log.message("[Configuration.Manager.saveSettings]: returned from call to save settings on server, success: '{0}'".format(result.Message));

				for (var i = 0; i < result.Statuses.length; i++)
				{
					var status = result.Statuses[i];

					if (status.Success)
					{
						var extension = context._extensions[status.Name];

						extension.ValuesChanged = false; //set the value-changed attribue to false!
					}
				}

				context._isSaving = false;
				context.fireEvent("saveFinished", { "Result": result });

				opComplete(result.Success, result.Message, context);

				if (callback) callback(result); //return to the client that initially called the save
			},
			function (xhr, context, status, error)
			{
				var result = { "Success": false, "IsError": true, "Message": "Unexpected server error Occurred! please try again" };

				context._isSaving = false;
				context.fireEvent("saveError", error);
				context.fireEvent("saveFinished", { "Result": result });

				$log.error(error);

				opComplete(false, result.Message, context);

				if (callback) callback(result);
			},
			this);
	}
	else
	{
		var result = { "Success": false, "Message": "There are invalid values, please correct and try again, These are the incorrect values: {0}".format(invalidValues.join(", ")) };

		this._isSaving = false;
		this.fireEvent("saveFinished", { "Result": result });

		opComplete(false, result.Message, this);

		if (callback) callback(result);
	}
};

Extensions.Configuration.Manager.prototype.validate = function (name, value, type)
{
	var found = false;
	var validators = this._validators;
	var typeValidators = new Array();

	for (var i = 0; i < validators.length; i++)
	{
		var existing = validators[i];

		if (existing.Type == type && (existing.Extension == "" || existing.Extension == name))
		{
			typeValidators.push(existing);
			found = true;			
		}
	}

	if (found)
	{
		for (var i = 0; i < typeValidators.length; i++)
		{
			var validator = typeValidators[i];

			if (!validator.Validator(value)) return false;
		}
	}

	//if (!found) $log.message("[Configuration.Manager.validate]: no validator registered for field type: '{0}'".format(type));

	return true;
};

Extensions.Configuration.Manager.prototype.reload = function (name, callback, state)
{
	if (this._extensions[name])
	{
		var context = this;
		var service = new $$ec.Web();

		service.reloadValues(name,
		function (result, state)
		{
			if (result.Success)
			{				
				context._setValues(name, result.Values, true);
			}			
			else
			{
				$messages.registerError("Unable to reload extension's values", result.Message);
				$log.error("[Configuration.Manager.reload]: fetch was unsuccessful, server message: '{0}'".format(result.Message));
			}

			callback(context.getExtension(name), state);
		},
		function (xhr, state, status, error)
		{
			$log.error("[Configuration.Manager.reload]: error on web call");
		},
		state);
	}
	else
		$log.error("[Configuration.Manager.reload]: Extension with name '{0}' doesnt exist".format(name));
};

/********************************************* Set Methods **********************************************/

///
/// Sets the value that was selected or entered by the user to the Values collection of the extension
/// --name: The name of the extension
/// --fieldId: The ID of the field to update
/// --value: The new value to insert (or remove in the case of multi-valued fields)
/// --isValid: Whether the value passed through the configured validators successfully
/// --selected: Whether the value for the multi-valued field has been selected or removed
Extensions.Configuration.Manager.prototype.setFieldValue = function (name, fieldId, value, isValid, selected)
{
	if (this._extensions[name])
	{
		var extension = this._extensions[name];
		var definition = this.getFieldDefinition(name, fieldId);

		if (definition)
		{
			var values = (definition.AdminOnly ? extension.AdminValues : extension.Values);

			if (values)
			{
				var found = false;

				for (var i = 0; i < values.length; i++)
				{
					var fieldValue = values[i];

					if (fieldValue.Id == fieldId) //found field value in collection, need to update
					{
						if (definition.MultipleValue)
						{
							if (selected) //if value is added not removed
							{
								if (value == $extConfConsts.ALL_OPTION)
								{
									fieldValue.Values = [value]; //the special "all" value was selected, only use this value
								}
								else
								{
									if ($j.inArray(value, fieldValue.Values) == -1) //make sure this value is not already in the Values collection
									{
										fieldValue.Values.push(value);
									}
								}
							}
							else //need to remove the value from the collection
							{
								fieldValue.Values = $j.grep(fieldValue.Values, function (elm, i)
								{
									return elm != value;
								});
							}
						}
						else
						{
							fieldValue.Values = [value];
						}

						fieldValue.IsValid = isValid;
						extension.ValuesChanged = true;
						found = true;
					}
				}

				if (!found) //field value is not in collection yet, need to create it
				{
					values.push({
						"AdminOnly": definition.AdminOnly,
						"Id": fieldId,
						"Name": definition.Name,
						"Type": definition.Type,
						"Values": [value],
						"IsValid": isValid
					});

					extension.ValuesChanged = true;
				}

				if (extension.ValuesChanged) $log.message("[Configuration.Manager.setFieldValue]: Updated field value for field '{0}' with value: '{1}'".format(fieldId, value));
			}
		}
		else
			$log.error("[Configuration.Manager.setFieldValue]: Couldnt find field definition for '{0}' in extension: '{1}'".format(fieldId, name));
	}
	else
		$log.error("[Configuration.Manager.setFieldValue]: Extension with name '{0}' doesnt exist".format(name));
};

///
/// Sets the fields collection for the specified extension
/// --name: The name of the extension as it was registered
/// --fields: the collection (array) of fields to set for the extension
Extensions.Configuration.Manager.prototype.setFields = function (name, fields)
{
	if (this._extensions[name])
	{
		var extension = this._extensions[name];

		extension.Fields = fields;

		for (var f = 0; f < fields.length; f++)
		{
			var field = fields[f];

			if (field.AdminOnly)
			{
				extension.HasAdmin = true;
			}
			else
			{
				extension.AdminOnly = false; //mark the extension as not only for admin users
			}

			if (field.Type == $extConfConsts.Types.GROUPS) extension.HasGroupsField = true;

			if (field.DefaultValue && field.DefaultValue.length > 0) //has default value, add that to the values collection
			{
				var existingValue = this.getValue(name, field.Name);

				if (!existingValue || existingValue.length == 0) //use default if no value is set for this field
				{
					var value = field.DefaultValue;

					var isValid = this.validate(name, value, field.Type);

					this.setFieldValue(name, field.Id, value, isValid, true);
				}
			}
		}

		//$log.message("[Configuration.Manager.setFields]: Successfully added fields for extension: '{0}'".format(name));
	}
	else
		$log.error("[Configuration.Manager.setFields]: Extension with name '{0}' doesnt exist".format(name));
};

///
/// Sets the description of the specified extension
/// --name: The name of the extension as it was registered
/// --description: The new description to set for the extension
Extensions.Configuration.Manager.prototype.setDescription = function (name, description)
{
	if (this._extensions[name])
	{
		this._extensions[name].Description = description;
	}
	else
		$log.error("[Configuration.Manager.setDescription]: Extension with name '{0}' doesnt exist".format(name));
};

///
/// Sets the title of the specified extension
/// --name: The name of the extension as it was registered
/// --title: The new title to set for the extension
Extensions.Configuration.Manager.prototype.setTitle = function (name, title)
{
	if (this._extensions[name])
	{
		this._extensions[name].Title = title;
	}
	else
		$log.error("[Configuration.Manager.setTitle]: Extension with name '{0}' doesnt exist".format(name));
};

///
///Set a validator function for a field type to be used when validating user input in the extensions manager
///	--type: the field type (TEXT, NUMBER, OPTION, GROUPS, COLOR)
/// --validator: the function to call when validating
/// --extension: (optional) the name of the extension to register the validator for
Extensions.Configuration.Manager.prototype.setFieldTypeValidator = function (type, validator, extension)
{
	$assert.isFunction(validator, "'validator' must be a function with signature: 'bool validator(string)'");

	var found = false;
	var validators = this._validators;

	if (!extension) extension = "";

	for (var i = 0; i < validators.length; i++)
	{
		var existing = validators[i];

		if (existing.Type == type && existing.Extension == extension)
		{
			existing.Validator = validator;
			found = true;
		}
	}

	if (!found)
	{
		validators.push({ "Type": type, "Validator": validator, "Extension": extension });
	}
};

/********************************************* Get Methods **********************************************/

///
/// Returns true if saving is still hapenning in the background
///
Extensions.Configuration.Manager.prototype.getIsSaving = function ()
{
	return this._isSaving;
};

///
/// Returns the value(s) for the specified field in the named extension
///	-- name: The name of the extension
/// -- fieldName: The name of the field to retrieve values for
Extensions.Configuration.Manager.prototype.getValue = function (name, fieldName)
{
	var extension = this.getExtension(name);

	if (extension)
	{
		var search = function (values)
		{
			for (var i = 0; i < values.length; i++)
			{
				var fieldValue = values[i];

				if (fieldValue.Name == fieldName)
				{
					return fieldValue.Values;
				}
			}

			return null;
		};

		var userValues = extension.Values;
		var value = search(userValues);

		if (!value || value.length == 0)
		{
			var adminValues = extension.AdminValues;
			value = search(adminValues);
		}

		return value;
	}

	return null;
};

///
/// Returns the definition of the specified field in the named extension
/// -- name: The name of the extension 
/// -- fieldId: The ID of the field
Extensions.Configuration.Manager.prototype.getFieldDefinition = function (name, fieldId)
{
	var extension = this.getExtension(name);

	if (extension)
	{
		var fields = extension.Fields;

		for (var i = 0; i < fields.length; i++)
		{
			if (fields[i].Id == fieldId)
			{
				return fields[i];
			}
		}
	}

	return null;
};

///
/// Returns all the extension registered as array of objects
///
Extensions.Configuration.Manager.prototype.getExtensions = function ()
{
	var extensions = new Array();

	for (var i = 0; i < this._count; i++)
	{
		var extension = this._extensions[this._extensionsNames[i]]; 
	
		extensions.push(extension);
	}

	return extensions;
};

///
/// Returns the specified extension if it was registered before
/// -- name: The name of the extension to return
Extensions.Configuration.Manager.prototype.getExtension = function (name)
{
	if (this._extensions[name])
	{
		var extension = this._extensions[name];

		return extension;
	}
	else
		$log.error("[Configuration.Manager.getExtension]: Extension with name '{0}' doesnt exist".format(name));

	return null;
};

///
/// retrieve the number of extensions registered
Extensions.Configuration.Manager.prototype.getCount = function ()
{
	return this._count;
};

///
/// retrieve the collection of Tridion groups
Extensions.Configuration.Manager.prototype.getGroups = function ()
{
	return this._groups;
};

///
/// checks whether any of the extensions configured has changed value(s)
///
Extensions.Configuration.Manager.prototype.getHasChanges = function ()
{
	for (var i = 0; i < this._count; i++)
	{
		var extension = this._extensions[this._extensionsNames[i]];

		if (extension.ValuesChanged) return true;
	}

	return false;
};

///
/// Returns a collection of field names which currently have invalid values according to the registered validators
/// for the specified extension.
/// the returned items in the collection are strings in this format: <extenaion_name>.<field_name>
/// --name: The name of the extension 
Extensions.Configuration.Manager.prototype.getExtensionInvalidValues = function (name)
{
	var invalidValues = new Array();
	var extension = this._extensions[name];

	if (extension)
	{		
		var userValues = extension.Values;
		var adminValues = extension.AdminValues;

		var search = function (values)
		{
			if (values)
			{
				for (var j = 0; j < values.length; j++)
				{
					var value = values[j];

					if (!value.IsValid)
					{
						invalidValues.push(String.format("'{0}.{1}'", name, value.Name));
					}
				}
			}
		};

		search(userValues);
		search(adminValues);
	}
	else
	{
		$log.error("[Configuration.Manager.getExtensionInvalidValues]: extension with name: '{0}' doesnt exist!".format(name));
	}

	$log.message("[Configuration.Manager.getExtensionInvalidValues]: found {0} invalid fields for extension: '{1}'".format(invalidValues.length, name));
	
	return invalidValues;
};

///
/// returns a collection of field names which currently have invalid values according to the registered validators.
/// the returned items in the collection are strings in this format: <extenaion_name>.<field_name>
Extensions.Configuration.Manager.prototype.getInvalidValues = function ()
{
	var invalidValues = new Array();

	for (var i = 0; i < this._count; i++)
	{
		var extInvalidValues = this.getExtensionInvalidValues(this._extensionsNames[i]);

		invalidValues = invalidValues.concat(extInvalidValues);
	}

	$log.message("[Configuration.Manager.getInvalidValues]: found {0} invalid fields".format(invalidValues.length));

	return invalidValues;
};

Extensions.Configuration.Manager.prototype.getIsAdminOnly = function ()
{
	var adminOnly = true;

	for (var i = 0; i < this._count; i++)
	{
		var extension = this._extensions[this._extensionsNames[i]];

		if (!extension.AdminOnly)
		{
			adminOnly = false;
			break;
		}
	}

	return adminOnly;
}
/********************************************* Internal Methods **********************************************/

Extensions.Configuration.Manager.prototype._setValues = function (name, values, update)
{
	if (values.Exists)
	{
		if (this._extensions[name])
		{
			var extension = this._extensions[name];

			if (update)
			{
				var localNewField = false; //use to find out if there is a value for a field that was never stored on the server before

				var updateValues = function (incoming, current)
				{
					var incFieldNames = new Array();

					for (var i = 0; i < incoming.length; i++)
					{
						var val = incoming[i];

						if (val.Values.length > 0)
						{
							var query = $j.grep(current, function (elm, i) //find the existing field in the collection
							{
								return elm.Name == val.Name;
							});

							if (query.length > 0)
							{
								query[0].Values = val.Values; //update the existing collection for this field with the one retrieved from the server

								incFieldNames.push(val.Name);
							}
						}
					}

					if (current.length > incoming.length) localNewField = true; //if there are more field values locally than on the server

					if (!localNewField)
					{
						for (var i = 0; i < current.length; i++)
						{							
							var val = current[i];
														
							if ($j.inArray(val.Name, incFieldNames) == -1) //local store has a value for a field that the server doesnt yet have
							{
								localNewField = true;
								break;
							}
						}
					}
				};

				updateValues(values.Fields, extension.Values);
				updateValues(values.AdminFields, extension.AdminValues);
				
				extension.ValuesChanged = localNewField;
			}
			else
			{
				extension.Values = values.Fields;
				extension.AdminValues = values.AdminFields;

				extension.ValuesChanged = false;
			}
		}
		else
			$log.error("[Configuration.Manager._setValues]: Extension with name '{0}' doesnt exist".format(name));
	}
};

///
///Loads the Tridion groups asynchronously. must be called very early so the 
///list is loaded before its needed!
///
Extensions.Configuration.Manager.prototype._loadGroups = function ()
{
	if (!this._groups || this._groups.length == 0)
	{
		var context = this;

		$extUtils.getTridionGroups(function (groups) { context._groups = groups; }, false);
	}
};

Extensions.Configuration.Manager.prototype._initializeValidators = function ()
{
	this.setFieldTypeValidator($extConfConsts.Types.NUMBER, function (value)
	{
		if (value.length > 0)
		{
			var reg = new RegExp("^[-]?[0-9]+[\.]?[0-9]*$");
			return reg.test(value);
		}

		return true;
	});

	this.setFieldTypeValidator($extConfConsts.Types.COLOR, function (value)
	{
		if (value.length > 0)
		{
			var reg = new RegExp("^#?([a-f]|[A-F]|[0-9]){3}(([a-f]|[A-F]|[0-9]){3})?$"); //("^([A-Fa-f0-9]{2}){8,9}$");
			return reg.test(value);
		}

		return true;
	});
};

var $extConfManager = new Extensions.Configuration.Manager();