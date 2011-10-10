Type.registerNamespace("Extensions");

Extensions.Utilities = function Utilities()
{
};

Extensions.Utilities.getItem = function (itemId, handler, errHandler)
{
	var item = $models.getItem(itemId);

	if (item)
	{
		var gotItem = function ()
		{
			$evt.removeEventHandler(item, "load", gotItem);
			if (handler) handler(item);			
		};

		if (!item.isLoaded())
		{
			$evt.addEventHandler(item, "load", gotItem);

			item.load();
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

Extensions.Utilities.getStaticItem = function (itemId, handler, errHandler)
{
	var item = $models.getItem(itemId);

	if (item)
	{
		var gotItem = function ()
		{
			$evt.removeEventHandler(item, "staticload", gotItem);

			if (handler) handler(item);			
		};

		if (!item.isStaticLoaded())
		{
			$evt.addEventHandler(item, "staticload", gotItem);

			item.staticLoad();
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

Extensions.Utilities.getTemplate = function (url)
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

Extensions.Utilities.doAjax = function (url, type, success, fail, data)
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

Extensions.Utilities.getItemLink = function (itemId)
{
	return String.format("/{0}/{1}/{2}#id={3}", $config.CurrentEditor,
												$config.EditorPath,
												$config.Editors.CME.edittypes[$models.getItemType(itemId)],
												itemId);
};

Extensions.Utilities.getIconPath = function (item, size)
{	
	return $config.getIconPath(item.getItemIcon(), size);
};

Extensions.Utilities.openInEditor = function (itemId)
{
		$extUtils.getStaticItem(itemId, function (item)
		{
			if (item)
			{

				var openItem = function (openItemId) //open the item editor in a new window
				{
					$log.message("utils$openInEditor: about to open item: " + openItemId);

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
						"isLocalizable": item.isLocalizable()
					};

					if (item.isShared() && (args.baseItemUri || args.isLocalizable))
					{
						var popup = $modalpopup.create($cme.Popups.OPEN_ITEM_OPTIONS.URL, { width: 400, height: 260 }, args);

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
				}
				else
					openItem(itemId);
			}
		});
};

Extensions.Utilities.browseItem = function (itemId)
{
	var gotoCommand = $cme.getCommand("Goto");

	if (gotoCommand != null)
	{
		var selection = new Tridion.Cme.Selection();
		selection.addItem(itemId);
		$cme.executeCommand("Goto", selection);
	}
};


var $extUtils = Extensions.Utilities;