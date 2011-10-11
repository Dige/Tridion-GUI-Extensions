Type.registerNamespace("CommandsExtensions");

/**
 * Implements the <c>ViewInFrontEnd</c> command extension
 */
function ViewInFrontEnd(settings)
{
	Type.enableInterface(this, settings.fullQName);
	this.addInterface("Tridion.Cme.Command", [settings.className]);
    this.settings = settings;
};

ViewInFrontEnd.prototype._isAvailable = function (selection, pipeline)
{
    var items = selection.getItems();

    if(items.length > 1) {
        return false;
    }
    var itemId = selection.getItem(0);
    var item = $models.getItem(itemId);

    if(item){
        if(item.getItemType() != $const.ItemType.PAGE){
            return false;
        }
    }

    if (pipeline) {
        pipeline.stop = false;
    }
    return true;
};


ViewInFrontEnd.prototype._isEnabled = function(selection, pipeline)
{
    if (pipeline) {
        pipeline.stop = false;
    }
    return this._isAvailable(selection, pipeline);
};


ViewInFrontEnd.prototype._execute = function (selection, pipeline)
{
    if (pipeline) {
        pipeline.stop = false;
    }
};


CommandsExtensions.ViewInStaging = new ViewInFrontEnd({fullQName: "CommandsExtensions.ViewInStaging", className: "ViewInStaging"});
CommandsExtensions.ViewInLive = new ViewInFrontEnd({fullQName: "CommandsExtensions.ViewInLive", className: "ViewInLive"});