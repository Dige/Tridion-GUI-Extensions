/*
**					Extensions.Configuration.Constants ($extConfConsts)
				
** Description

***	Contains constant values which are used in connection with the Extensions Manager

** Version

***	0.3

** By 

***	Yoav Niran (SDL Tridion)
*/

Type.registerNamespace("Extensions.Configuration.Constants");

Extensions.Configuration.Constants.Types =
{
	TEXT: 1, ///text value
	NUMBER: 2, ///number value
	OPTION: 3, ///radio/check boxes
	GROUPS: 4, ///radio/check boxes showing the user groups
	COLOR: 5 ///Color chooser
};

Extensions.Configuration.Constants.ALL_OPTION = "__0__;";

Extensions.Configuration.Constants.OptionGroups =
{
	YES_NO: [{ "key": "Yes", "value": "1" }, { "key": "No", "value": "0"}],
	TRUE_FALSE : [{ "key": "True", "value": "1" }, { "key": "False", "value": "0"}]
};

var $extConfConsts = Extensions.Configuration.Constants;

var $$ec = Extensions.Configuration;