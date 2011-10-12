/*

**					Extensions.Configuration.Field

** Description

***	This is class that can be used to represent a single field for an Extension configuration.
*** the Client's instance method 'addField' can accept an instance of the Field class to register the field
*** in its collection.
*** (note that fields returned from the server are not instances of the Field class)

** Version

***	0.3

** By 

***	Yoav Niran (SDL Tridion)
*/

Type.registerNamespace("Extensions.Configuration");

Extensions.Configuration.Field = function Field(name, props, options)
{
	this.Id = this._getFieldId(name);
	this.Name = name;
	this.Options = options;
  
  $.extend(this, {
    Type: props.Type,
    AdminOnly: (props.AdminOnly ? props.AdminOnly : false),
    MultipleValue: this._setIsMultiple(props.MultipleValue),
    HelpText: (props.HelpText ? props.HelpText : ""),
    DefaultValue: (props.Default ? props.Default : ""),
  }, props);
};

Extensions.Configuration.Field.prototype._setIsMultiple = function (isMulti)
{
	if (isMulti)
	{
		var type = this.Type;

		if (type != $extConfConsts.Types.GROUPS && type != $extConfConsts.Types.OPTION)
		{
			$log.warn("[Configuration.Field._setIsMultiple]: Cant make field '{0}' multiple value, its type doesnt support it currently".format(this.Name));

			isMulti = false;
		}
	}
	else
	{
		isMulti = false;
	}

	return isMulti;
};

Extensions.Configuration.Field.prototype._getFieldId = function (name)
{
	var id = name.replace(/\W/g, "");

	//$log.message("[Configuration.Field._getFieldId]: name: '{0}' - id: '{1}'".format(name, id));

	return id;
};