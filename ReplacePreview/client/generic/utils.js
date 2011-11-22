﻿/*
***		Helper methods for 2011 GUI Extension

***		By: Yoav Niran (SDL Tridion)

***		Vesion: 0.6 GA
*/


Type.registerNamespace("Extensions");

Extensions.Utilities = function Utilities()
{
	this.EDITOR_NAME = "2011Extensions";

	this._tridionGroups = null;
	this._userSettings = null;
};

Extensions.Utilities.prototype.getItem = function (itemId, handler, errHandler, reload)
{
	var item = $models.getItem(itemId);
	if (!reload) reload = false;

	var clearEvents = function ()
	{
		$evt.removeEventHandler(item, "load", gotItem);
		$evt.removeEventHandler(item, "loadfailed", failedToLoad);
	};

	if (item)
	{
		if (!item.isLoaded() || reload)
		{
			var gotItem = function ()
			{
				$log.message("[ExtensionsUtils.getItem]: item: '{0}' finished loading successfully".format(itemId));
				
				clearEvents();
				if (handler) handler(item);				
			};

			var failedToLoad = function (error)
			{
				$log.message("[ExtensionsUtils.LoadItem]: item: '{0}' failed to load");
				
				clearEvents();
				if (errHandler) errHandler(error);
			};
			
			$evt.addEventHandler(item, "load", gotItem);
			$evt.addEventHandler(item, "loadfailed", failedToLoad);
		
			item.load(reload);
		}
		else
		{
			gotItem();
		}
	}
	else
	{
		if (errHandler) errHandler();
	}
}

Extensions.Utilities.prototype.getStaticItem = function (itemId, handler, errHandler, reload)
{
	if (!reload) reload = false;

	var item = $models.getItem(itemId);

	var clearEvents = function ()
	{
		$evt.removeEventHandler(item, "staticload", gotItem);
		$evt.removeEventHandler(item, "staticloadfailed", failedToLoad);
	};

	if (item)
	{
		var gotItem = function ()
		{
			//$log.message("[ExtensionsUtils.getStaticItem]: item: '{0}' finished loading successfully".format(itemId));
			
			clearEvents();
			if (handler) handler(item);
		};

		var failedToLoad = function (error)
		{
			clearEvents();
			if (errHandler) errHandler(error);
		};

		if (!item.isStaticLoaded() || reload)
		{
			//$log.message(String.format("[ExtensionsUtils.getStaticItem]: about to statically load item: '{0}' reload: '{1}'", itemId, reload));

			$evt.addEventHandler(item, "staticload", gotItem);
			$evt.addEventHandler(item, "staticloadfailed", failedToLoad);

			item.staticLoad(reload);
		}
		else
		{
			gotItem();
		}
	}
	else
	{
		if (errHandler) errHandler();
	}
};

Extensions.Utilities.prototype.getTemplate = function (url)
{
	var template = null;

	$j.ajax({
		url: url,
		type: "GET",
		async: false,
		contentType: "application/json; charset=utf-8",
		dataType: "html",
		success: function (result)
		{
			template = result;
		}
	});

	return template;
};

Extensions.Utilities.prototype.doAjax = function (url, type, success, fail, data)
{
	if (!data) data = {};

	$j.ajax({				//asynchronously make the call
		url: url,
		type: type,
		data: data,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: success,
		error: fail,
		dataFilter: function (data)
		{
			var response;

			if (typeof (JSON) !== "undefined" && typeof (JSON.parse) === "function")
				response = JSON.parse(data);
			else
				response = eval("(" + data + ")");

			return response;
		}
	});
};

Extensions.Utilities.prototype.getItemLink = function (itemId)
{
	return String.format("/{0}/{1}/{2}#id={3}", $config.CurrentEditor,
												$config.EditorPath,
												$config.Editors.CME.edittypes[$models.getItemType(itemId)],
												itemId);
};

Extensions.Utilities.prototype.getIconPath = function (item, size)
{
	return $config.getIconPath(item.getItemIcon(), size);
};

Extensions.Utilities.prototype.openInEditor = function (itemId)
{
	$extUtils.getStaticItem(itemId, function (item)
	{
		if (item)
		{
			var openItem = function (openItemId) //open the item editor in a new window
			{
				$log.message("[ExtensionsUtils.openInEditor]: about to open item: " + openItemId);

				var itemToOpen = $models.getItem(openItemId);

				if (!itemToOpen.openInEditor($display.getItemEditorUrl(itemToOpen.getItemType())))
				{
					$messages.registerError($localization.getCoreResource("IsPopupBlocker"), null, null, null, true);
				}
			};

			var itemBpInfoLoaded = function ()
			{
				$evt.removeEventHandler(item, "loadblueprintinfo", itemBpInfoLoaded);

				var args = { "item": item, "baseItemUri": item.getParentId(),
					"isLocalizable": item.isLocalizable(),
					"popupType": Tridion.Controls.Popup.Type.MODAL_IFRAME
				};

				if (item.isShared() && (args.baseItemUri || args.isLocalizable))
				{
					var popup = $popup.create($cme.Popups.OPEN_ITEM_OPTIONS.URL, $cme.Popups.OPEN_ITEM_OPTIONS.FEATURES, args);
																	
					$evt.addEventHandler(popup, "cancel", function popupCancelled()
					{
						$evt.removeEventHandler(popup, "cancel", popupCancelled);
						popup.close();
						return;
					});

					$evt.addEventHandler(popup, "submit", function popupSubmitted(event)
					{
						$evt.removeEventHandler(popup, "submit", popupSubmitted);

						popup.close();

						var uriToOpen = itemId;

						switch (event.data.value)
						{
							case "editparent":
								if (args.baseItemUri) uriToOpen = args.baseItemUri;
								break;
							case "localizeedit":
								if (args.isLocalizable) item.localize(true);
								break;
						}

						openItem(uriToOpen);
					});

					$log.message("utils$openInEditor: about to show shared item popup");
					popup.open();
				}
			};

			if (Tridion.OO.implementsInterface(item, "Tridion.ContentManager.RepositoryLocalItem"))
			{
				$log.message(String.format("utils$openInEditor: item is repository local item. shared? '{0}', isbploaded? '{1}'", item.isShared(), item.isBlueprintInfoLoaded()));

				$evt.addEventHandler(item, "loadblueprintinfo", itemBpInfoLoaded);

				if (item.isShared())
				{
					if (!item.isBlueprintInfoLoaded())
					{
						item.loadBlueprintInfo();
					}
					else
					{
						itemBpInfoLoaded();
					}
				}
				else
					openItem(itemId);
			}
			else
				openItem(itemId);
		}
	});
};

Extensions.Utilities.prototype.browseItem = function (itemId)
{
	var gotoCommand = $cme.getCommand("Goto");

	if (gotoCommand != null)
	{
		var selection = new Tridion.Cme.Selection();
		selection.addItem(itemId);
		$cme.executeCommand("Goto", selection);
	}
};

Extensions.Utilities.prototype.getTridionGroups = function (callback, reload)
{
	$log.message("[Utilities.getTridionGroups]: About to retrieve system groups (refresh: '{0}'".format(reload));

	if (!this._tridionGroups || this._tridionGroups.length == 0 || reload)
	{
		var context = this;
		var listGroups = $models.getItem($const.TCMROOT).getListGroups();
		var listData = $models.getItem(listGroups.getId());

		var dataLoaded = function (error)
		{
			context._tridionGroups = new Array();

			//$log.message("[Utilities.getTridionGroups]: data loaded event handler has been called");

			$evt.removeEventHandler(listData, "load", dataLoaded);
			$evt.removeEventHandler(listData, "loadfailed", dataLoaded);

			var xml;

			if (error && error.Message)
			{
				$log.error("[Utilities.getTridionGroups]:There was an error loading tridion groups: '{0}'".format(error.Message));

				xml = $xml.getNewXmlDocument("<tcm:ListItems xmlns:tcm=\"{0}\" />".format($const.Namespaces.tcm));
			}
			else
			{
				xml = $xml.getNewXmlDocument(listData.getXml());
			}

			var xpath = "/tcm:*/tcm:Item";
			var nodes = $xml.selectNodes(xml, xpath);
			var itemCount = nodes.length || 0;

			$log.message("[Utilities.getTridionGroups]: retrieved {0} groups from Tridion".format(itemCount));

			for (var i = 0; i < itemCount; i++)
			{
				var node = nodes[i];

				var group = {
					"GroupId": node.getAttribute("ID"),
					"GroupTitle": node.getAttribute("Title")
				};

				context._tridionGroups.push(group);
			}

			callback(context._tridionGroups);
		};

		$evt.addEventHandler(listData, "load", dataLoaded);
		$evt.addEventHandler(listData, "loadfailed", dataLoaded);

		//$log.message("[Utilities.getTridionGroups]: About to call load method on list object");

		listData.load(true);
	}
	else
	{
		callback(context._tridionGroups);
	}
	//return this._tridionGroups;
};

Extensions.Utilities.prototype.getUserSettings = function ()
{
	if (!this._userSettings)
	{
		this._userSettings = Tridion.UI.UserSettings.getJsonUserSettings(true);
	}

	return this._userSettings;
};

Extensions.Utilities.prototype.isCurrentUserInGroup = function (groupId)
{
	var settings = this.getUserSettings();

	if (settings)
	{
		var groups = settings.User.Data.GroupMemberships;
		
		for (var i in groups)
		{
			var group = groups[i];

			if (group["@href"] == groupId) //stupid IE cant handle properties starting with '@'
			{
				$log.message("[Utilities.isCurrentUserInGroup]: current user is member of group: '{0}'".format(groupId));
				return true;
			}
		}

		$log.message("[Utilities.isCurrentUserInGroup]: current user is NOT member of group: '{0}'".format(groupId));
	}
	else
		$log.warn("[Utilities.isCurrentUserInGroup]: Couldnt load user settings!");

	return false;
};

Extensions.Utilities.prototype.isCurrentUserAdmin = function ()
{
	var settings = this.getUserSettings();

	if (settings)
	{
		var priv = settings.User.Data.Privileges;

		return (priv == "1");
	}
	else
		$log.warn("[Utilities.isCurrentUserAdmin]: Couldnt load user settings!");

	return false;
};

Extensions.Utilities.prototype.registerProgress = function (msg, successMsg, cancelMsg, finishEvents, modal)
{
	modal = modal || false;

	var msg = $messages.registerProgress(msg, null, false, false, modal);

	msg.setOnSuccessMessage(successMsg);

	if (cancelMsg) msg.setOnCancelMessage(cancelMsg);

	if (finishEvents)
	{
		for (var i in finishEvents)
		{
			msg.addFinishEvent(finishEvents[i].ItemId, finishEvents[i].EventName, finishEvents[i].IsSuccess);
		}
	}

	return msg;
};

Extensions.Utilities.prototype.isVersionedItem = function (item)
{
	return (Tridion.OO.implementsInterface(item, "Tridion.ContentManager.VersionedItem"));
};

Extensions.Utilities.prototype.expandPath = function (path)
{
	return $config.expandEditorPath(path, $extUtils.EDITOR_NAME);
};

Extensions.Utilities.prototype.isTridionType = function (id)
{
	var itemType = $models.getItemType(id);

	//$log.message("[Utilities.isTridionType]: item type is: '{0}'".format(itemType));

	var isType = (itemType.indexOf("tcm:") == 0 || itemType.indexOf("oe:1") == 0);

	return isType;
};

var $extUtils = new Extensions.Utilities();

/// Useful GUI JS files
///
///	$log					-- Tridion\web\WebUI\Core\Client\Base\MessageLog.js
///	$const					-- Tridion\web\WebUI\Core\Client\Base\Constants.js
///	$xml					-- Tridion\web\WebUI\Core\Client\Base\Utils\Xml.js
/// $messages				-- Tridion\web\WebUI\Models\CME\Client\MessageCenter\MessageCenter.js
/// $popup					-- Tridion\web\WebUI\Core\Controls\Popup\Popup.js
///	$evt					-- Tridion\web\WebUI\Core\Client\Base\EventRegister.js
/// Tridion.Core.Selection	-- Tridion\web\WebUI\Core\Client\Base\Selection.js
///