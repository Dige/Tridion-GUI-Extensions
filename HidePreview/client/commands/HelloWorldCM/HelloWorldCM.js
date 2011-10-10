Type.registerNamespace("Extensions");

Extensions.HW = function Extensions$HW()
{
    Type.enableInterface(this, "HW.Interface");
	this.addInterface("Tridion.Cme.Command", ["HW"]);
};

Extensions.HW.prototype.isAvailable = function HW$isAvailable(selection, pipeline)
{
	return true;
};

Extensions.HW.prototype.isEnabled = function HW$isEnabled(selection, pipeline) {
    var items = selection.getItems();
    if (items.length == 1) {        
            return true;
    }
    else {
        return false;
    }
};

Extensions.HW.prototype._execute = function HW$_execute(selection, pipeline) {
    var selectedID = selection.getItem(0);
    $extUtils.getStaticItem(selectedID, function (item) {
        $log.message("HW$_execute: item has been statically loaded: " + item.isStaticLoaded());        
        var itemTitle = item.getStaticTitle();
        var msg = $messages.createMessage("Tridion.Cme.Model.InfoMessage", "HELLO WORLD EXTENSIONS",
		"The user clicked over: "+itemTitle,
		true,
		true);
        msg.clearButtons();
        msg.addButton("OK", $localization.getEditorResource("OK"));
        $messages.registerMessage(msg);
    });    
};