/*
**					Extensions.Configuration.Popups.ExtensionsManager

** Version

***	0.3

** By 

***	Yoav Niran (SDL Tridion)
*/

Type.registerNamespace("Extensions.Configuration.Popups");

Extensions.Configuration.Popups.ExtensionsManager = function ExtensionsManager()
{
	$log.message("[Popups.ExtensionsManager]: Popup created!");

	Type.enableInterface(this, "Extensions.Configuration.Popups.ExtensionsManager");
	this.addInterface("Tridion.Controls.ModalPopupView");
	this.addInterface("Tridion.Cme.View");

	var p = this.properties;
	p.detailsWindow = null;
	p.dialogArgs = null;
	p.lastExtensionViewed = 0;
	p.currentExtnsionIndex = 0;
	p.saveButton = $j("#SaveButton");
	p.saveLoadingImg = $j("#buttonLoading");
	p.accordion = null;
	p.settingsTabs = null;
	p.tabsCount = 1;
	p.loading = $j("#extensionsLoading").detach();
	p.settingsTab = $j("#settingsTab");
	p.adminTab = null;
	p.reloadButton = $j("#refreshButton");
	p.isUserAdmin = false;
	p.listContainer = null;
	//p.errorMsg = null;
}

Extensions.Configuration.Popups.ExtensionsManager.prototype.initialize = function ExtensionsManager$initialize()
{
	this.callBase("Tridion.Cme.View", "initialize");

	var p = this.properties;
	var c = p.controls;

	var dialogArgs = p.dialogArgs = this.getDialogArguments() || {};
	var controller = dialogArgs.extConfig;

	p.lastExtensionViewed = dialogArgs.lastExtensionId;
	p.isUserAdmin = $extUtils.isCurrentUserAdmin(); //store whether the current user is a Tridion adminsitrator	

	$controls.getControl($("#StackElement"), "Tridion.Controls.Stack");
	$controls.getControl($("#MessageCenter"), "Tridion.Controls.ActiveMessageCenter");

	c.CloseButton = $controls.getControl($("#CloseButton"), "Tridion.Controls.Button");
	c.SaveButton = $controls.getControl($("#SaveButton"), "Tridion.Controls.Button");

	$evt.addEventHandler(c.CloseButton, "click", this.getDelegate(this._onCloseButtonClicked));
	$evt.addEventHandler(c.SaveButton, "click", this.getDelegate(function (e) { this._onSaveButtonClicked(e, controller); }));

	if (!controller)
	{
		$log.error("[Popups.ExtensionsManager.Initialize]: couldnt find controller in dialog parameters!");
		$messages.registerError("Unexpected error occurred while initializing the Manager", "The configuration manager object was not made available to the view");
	}

	this._initializeView(controller);
}

Extensions.Configuration.Popups.ExtensionsManager.prototype._initializeView = function (controller)
{
	var extCount = controller.getCount();

	$log.message("[Popups.ExtensionsManager.Initialize]: found {0} extensions configured".format(extCount));

	if (extCount > 0)
	{
		var context = this;
		var p = this.properties;
		var listContainer = p.listContainer = $j("#extensionsList");		

		$evt.addEventHandler(controller, "saveFinished", this.getDelegate(function (e) { this._onSaveFinished(e, this, controller); }));

		if (controller.getIsSaving())
		{
			p.controls.SaveButton.disable();
			p.saveButton.append(p.saveLoadingImg.show());
		}

		p.settingsTabs = $j("#extensionSettings").tabs({
			tabTemplate: "<li><a href=\"#{href}\">#{label}</a></li>"
		}); //init tabs control

		this._loadExtensions(controller, listContainer); //load extensions from manager into left-side list

		$j(".userField, .adminField").live("change", function ()
		{
			var field = $j(this);

			if (field.hasClass("allItem"))
			{
				context._disableCheckBoxesForField(field.attr("name"), field.attr("id"), field.is(":checked"));
			}

			context._onFieldChange(field, context, controller);
		});

		p.reloadButton.click(function () { context._onReloadClicked(context, controller); });
	}
	else
	{
		$j("#extensions, #settings").hide();
		$j("#noExtensions").show();
	}
};

Extensions.Configuration.Popups.ExtensionsManager.prototype._loadExtensions = function (controller, container)
{
	$log.message("[Popups.ExtensionsManager._loadExtensions]: About to load extensions to list");

	container.hide();

	var p = this.properties;
	var context = this;
	var extensions = controller.getExtensions();
	var template = $j("#tmplAccordion");

	template.tmpl(extensions).appendTo(container)

	if (extensions.length > 3) $j("#extensions").css({ "overflow-y": "scroll" });

	container.show();

	var divExtensions = $j("#extensions")[0];

	p.accordion = container.accordion(
	{
		change: function (event, ui)//init accordion control
		{
			var newItem = ui.newContent;
			var newHeader = ui.newHeader;

			var scrollHeight = newItem.offset().top + newItem.height() + newHeader.height();
			divExtensions.scrollTop = scrollHeight; //make sure the container is scrolled down to show the entire content of the accordion item

			p.currentExtnsionIndex = parseInt(newHeader.attr("rel"));

			var newExtension = controller.getExtensions()[p.currentExtnsionIndex];

			context._beginLoadingExtension(newExtension, controller);
		}
	});
	
	if (p.lastExtensionViewed != 0)
	{
		p.accordion.accordion("option", "active", p.lastExtensionViewed); //if different from 0, the change event handler will take care of loading the ext. values
	}
	else
	{
		context._beginLoadingExtension(extensions[0], controller);
	}

	this._showPending(controller);
}; 

Extensions.Configuration.Popups.ExtensionsManager.prototype._beginLoadingExtension = function (extension, controller)
{
	var context = this;
	var p = context.properties;

	p.settingsTab.empty();
	if (p.adminTab) p.adminTab.empty();

	p.accordion.accordion("disable");
	p.reloadButton.hide();

	this._showLoading(1400, function ()
	{
		context._loadExtensionFields(extension, controller, context.properties, context);
		context._loadUserValues(extension, controller, context.properties);

		p.accordion.accordion("enable");
		p.reloadButton.show();
	});
}

Extensions.Configuration.Popups.ExtensionsManager.prototype._loadExtensionFields = function (extension, controller, p, context)
{
	var groups = null;

	if (extension.HasGroupsField) groups = controller.getGroups();

	var tmplExtra =
	{
		"adminMode": false,
		"showElement": function (item)
		{
			return ((item.adminMode && item.data.AdminOnly) || (!item.adminMode && !item.data.AdminOnly));
		},
		"groups": groups
	};

	var template = $j("#tmplFields");

	context._hideLoading();

	p.settingsTab.empty();

	template.tmpl(extension.Fields, tmplExtra).appendTo(p.settingsTab); //load user fields into tab

	if (extension.HasAdmin && p.isUserAdmin) //only allow tridion admins see the Admin tab
	{
		if (p.tabsCount == 1)
		{
			p.settingsTabs.tabs("add", "#adminTab", "Admin"); //add the admin tab to the tabs view
			p.tabsCount++;
		}

		p.adminTab = $j("#adminTab").empty();

		tmplExtra.adminMode = true;

		template.tmpl(extension.Fields, tmplExtra).appendTo(p.adminTab); //load admin fields into tab

		if (extension.AdminOnly) p.settingsTabs.tabs("select", 1);
	}
	else
	{
		if (p.tabsCount == 2)
		{
			p.settingsTabs.tabs("remove", 1);
			p.tabsCount--;
		}
	}

	$j("input.colorField").ColorPicker({ //set color picker for all color fields
		onSubmit: function (hsb, hex, rgb, el)
		{
			var elm = $j(el);

			elm.val(hex);
			elm.ColorPickerHide();
			elm.css({ "background-color": "#" + hex });

			context._onFieldChange(elm, context, controller);
		},
		onBeforeShow: function ()
		{
			$j(this).ColorPickerSetColor(this.value);
		}
	}).bind('keyup', function ()
	{
		$j(this).ColorPickerSetColor(this.value);
	});
};

Extensions.Configuration.Popups.ExtensionsManager.prototype._loadUserValues = function (extension, controller, p)
{
	if (extension.Values.length > 0)
	{
		var userFields = $j(".userField");
		this._loadValuesToHtmlFields(userFields, extension.Values);
	}
	else
		$log.message("[Popups.ExtensionsManager._loadUserValues]: extension: '{0}' doesnt have user values to load".format(extension.Id));

	if (extension.AdminValues.length > 0)
	{
		var adminFields = $j(".adminField");
		this._loadValuesToHtmlFields(adminFields, extension.AdminValues);
	}
	else
		$log.message("[Popups.ExtensionsManager._loadUserValues]: extension: '{0}' doesnt have admin values to load".format(extension.Id));
}

Extensions.Configuration.Popups.ExtensionsManager.prototype._loadValuesToHtmlFields = function (fields, values)
{
	var context = this;

	for (var i = 0; i < values.length; i++)
	{
		var fieldValue = values[i];
		var id = fieldValue.Id;

		if (fieldValue.Values.length > 0)
		{
			var fields = $j("*[name='{0}']".format(id)); //find the html elements rendered on the window for the current field

			//$log.message("[Popups.ExtensionsManager._loadUserValues]: Found {0} elements for field: '{1}'".format(fields.length, id));

			fields.each(function (i, item)
			{
				var field = $j(item);
				var type = field.attr("type");

				if (type == "text" || field.is('textarea'))
				{
					var singleVal = fieldValue.Values[0];

					field.val(singleVal);

					if (singleVal.length > 0)
					{
						if (field.attr("rel") == $extConfConsts.Types.COLOR)
						{
							field.css({ "background-color": "#" + singleVal });
						}
					}
				}
				else if (type == "checkbox" || type == "radio")
				{
					for (var j = 0; j < fieldValue.Values.length; j++)
					{
						if (field.val() == fieldValue.Values[j])
						{
							field.attr("checked", true);

							if (field.hasClass("allItem")) //if this is the special "all" box, need to disable all others
							{
								context._disableCheckBoxesForField(field.attr("name"), field.attr("id"), true);
							}
						}
					}
				}

				field.toggleClass("invalidValue", !fieldValue.IsValid);
			});
		}
		else
			$log.message("[Popups.ExtensionsManager._loadUserValues]: field value '{0}' was not downloaded from server with any values!".format(id));
	}
};

Extensions.Configuration.Popups.ExtensionsManager.prototype._showPending = function (controller)
{
	var p = this.properties;

	if (!controller.getHasChanges())
	{
		p.controls.SaveButton.hide();
		$j("h3.ui-accordion-header", p.listContainer).removeClass("pending invalid");
	}
	else
	{
		p.controls.SaveButton.show();

		var extensions = controller.getExtensions();

		for (var i = 0; i < extensions.length; i++)
		{
			var ext = extensions[i];

			var accordionItem = $j("h3.ui-accordion-header[rel='{0}']".format(i), p.listContainer);

			accordionItem.toggleClass("pending", ext.ValuesChanged)

			if (ext.ValuesChanged) //if values changed for extension, show indication for invalid fields 
			{				
				var extInvalid = controller.getExtensionInvalidValues(ext.Id);
				
				accordionItem.toggleClass("invalid", extInvalid.length > 0);
			}
		}
	}
};

Extensions.Configuration.Popups.ExtensionsManager.prototype._disableCheckBoxesForField = function (name, id, isChecked)
{
	var boxes = $j("input[name='{0}']".format(name)); //all check boxes with the same name, so the in the same field

	boxes.each(function (i, item)
	{
		var box = $j(item);

		if (box.attr("id") != id)
		{
			var allChecked = isChecked;

			box.attr({ "disabled": allChecked, "checked": false });
		}
	});
};

Extensions.Configuration.Popups.ExtensionsManager.prototype._onSaveButtonClicked = function (event, controller)
{
	var p = this.properties;
	var context = this;

	p.accordion.accordion("disable");
	p.controls.SaveButton.disable();
	p.saveButton.append(p.saveLoadingImg.show());

	controller.saveSettings(); //hooking up to the save finished event instead of passing a callback here
};

Extensions.Configuration.Popups.ExtensionsManager.prototype._onCloseButtonClicked = function (event)
{
	$log.message("[Popups.ExtensionsManager._onCloseButtonClicked]: closing popup...");

	$j(".userField, .adminField").die("change");

	this.properties.dialogArgs.lastExtensionId = this.properties.currentExtnsionIndex;

	this.fireEvent("close");

	return;
};

Extensions.Configuration.Popups.ExtensionsManager.prototype._onSaveFinished = function (event, context, controller)
{
	var p = context.properties;

	p.controls.SaveButton.enable();
	p.accordion.accordion("enable");
	p.saveLoadingImg.hide().detach();
	
	if (event.data.Result.Success) context._showPending(controller);
};

 Extensions.Configuration.Popups.ExtensionsManager.prototype._onFieldChange = function (field, context, controller)
 {
 	//$log.message("[Popups.ExtensionsManager.FieldChange]: field '{0}' just changed value: '{1}'".format(field.attr("id"), field.val()));

 	var p = context.properties;
 	var extensionName = controller.getExtensions()[p.currentExtnsionIndex].Id;

 	var fieldType = field.attr("rel");
 	var fieldId = field.attr("name");
 	var fieldValue = field.val();

 	var selected = true;

 	if (field.attr("type") == "checkbox")
 	{
 		selected = field.is(":checked");
 	}

 	var isValid = controller.validate(extensionName, fieldValue, fieldType);

 	field.toggleClass("invalidValue", !isValid);

 	controller.setFieldValue(extensionName, fieldId, fieldValue, isValid, selected);
	 	
 	context._showPending(controller);
 };

Extensions.Configuration.Popups.ExtensionsManager.prototype._onReloadClicked = function (context, controller)
{
	$log.message("[Popups.ExtensionsManager._onReloadClicked]: reload has been requested");

	var p = context.properties;
	var extension = controller.getExtensions()[p.currentExtnsionIndex];
	var extensionName = extension.Id;

	controller.reload(extensionName, function (result)
	{
		$log.message("[Popups.ExtensionsManager._onReloadClicked]: returned from reloading values for extension: '{0}'".format(extensionName));

		context._showPending(controller);  //if (!controller.getHasChanges()) p.controls.SaveButton.hide();
		
		context._beginLoadingExtension(extension, controller);
	});
};

Extensions.Configuration.Popups.ExtensionsManager.prototype._showLoading = function (speed, callback)
{
	var p = this.properties;

	var activeTab = null;

	var selectedTab = p.settingsTabs.tabs("option", "selected");

	if (selectedTab == 0 || !p.adminTab)
	{
		activeTab = p.settingsTab;
	}
	else
	{
		activeTab = p.adminTab;
	}

	p.loading.appendTo(activeTab);
	
	p.loading.fadeIn(speed, callback);
};

Extensions.Configuration.Popups.ExtensionsManager.prototype._hideLoading = function ()
{
	var p = this.properties;

	p.loading.detach();

	p.loading.hide();
};

$display.registerView(Extensions.Configuration.Popups.ExtensionsManager);