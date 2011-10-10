/*
**					Extensions.Configuration.EcmCommand

** Version

***	0.3

** By 

***	Yoav Niran (SDL Tridion)
*/

Type.registerNamespace("Extensions.Configuration");

Extensions.Configuration.EcmCommand = function ExtensionsConfigurationManagerCommand()
{
	Type.enableInterface(this, "Extensions.Configuration.EcmCommand");
	this.addInterface("Tridion.Cme.Command", ["ExtensionsConfigurationManager"]);

	this.PopupDetails =
	{
		"Url": $extUtils.expandPath("/client/commands/ExtensionsConfigurationManager/popups/ExtensionsManager.aspx"),
		"Pars": { width: 750, height: 400 }
	};

	this._popup = null;
	this._lastExtensionId = 0;

	//********************** Samples load **************************//
//	var samples = new $$ec.ConfigSamples();
//	samples.load(); //todo: comment out!!!
	//********************** Samples load **************************//
};

Extensions.Configuration.EcmCommand.prototype.isAvailable = function ExtensionsConfigurationManager$isAvailable(selection)
{	
	return true;//never called for toolbar button, this is a Tridion bug
};

Extensions.Configuration.EcmCommand.prototype.isEnabled = function ExtensionsConfigurationManager$isEnabled(selection)
{	
	var isEnabled = ($extConfManager.getCount() > 0); //no need to enable if no extensions were registered

	if (isEnabled)
	{
		var extAdminOnly = $extConfManager.getIsAdminOnly();
		var userAdmin = $extUtils.isCurrentUserAdmin();

		//$log.message("[Configuration.EcmCommand.isEnabled]: user is admin: '{0}', extensions admin only: '{1}'".format(userAdmin, extAdminOnly));

		isEnabled = (!extAdminOnly || (userAdmin)); //check if user is not administrator and extensions only have admin fields, then dont event 
													//show the Manager	
	}

	return isEnabled;
};

Extensions.Configuration.EcmCommand.prototype._execute = function ExtensionsConfigurationManager$_execute(selection)
{
	var args = { "popupType": Tridion.Controls.Popup.Type.MODAL_IFRAME, 
				 "extConfig": $extConfManager,
				 "lastExtensionId": this._lastExtensionId
				};

	this._popup = $popup.create(this.PopupDetails.Url, this.PopupDetails.Pars, args);

	$evt.addEventHandler(this._popup, "close", this.getDelegate(this._onPopupClose));

	this._popup.open();
};

Extensions.Configuration.EcmCommand.prototype._onPopupClose = function ()
{
	$evt.removeAllEventHandlers(this._popup);

	this._lastExtensionId = this._popup.properties.dialogArgs.lastExtensionId;

	this._popup.dispose();
	this._popup = null;
};