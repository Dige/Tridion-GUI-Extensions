Type.registerNamespace("CommandsExtensions");

/**
 * Implements the <c>Publish</c> command extension
 */
CommandsExtensions.SecurePublish = function CommandsExtensions$SecurePublish()
{
	Type.enableInterface(this, "CommandsExtensions.SecurePublish");		
	this.addInterface("Tridion.Cme.Command", ["SecurePublish"]);		
};

/**
 * Checks whether the command is Available or not�
 * The Command will be available for administrators always.
 * If the user is not administrator, the 'Publish' command will be available when the user has rights to 'Publish' 
 * and the item(s) to be published are not Structure Groups
 * @param {Tridion.Cme.Selection} selection The current selection.
 * @param {Tridion.Cme.Pipeline} execution pipeline.
 */
CommandsExtensions.SecurePublish.prototype._isAvailable = function CommandsExtensions$_isAvailable(selection, pipeline)
{	
	
    var runtime = Tridion.Runtime;			
	if(runtime.IsAdministrator!=1){		
		var items = selection.getItems();
		
		for (var i = 0, len = items.length; i < len; i++)
		{
			var itemId = selection.getItem(0);
			
		    var item = $models.getItem(itemId);
			
			if(item){
				if(item.getItemType() == $const.ItemType.STRUCTURE_GROUP || item.getItemType() == $const.ItemType.PUBLICATION){
					return false;
				}
			}
		}
	}	
	if (pipeline) {
        pipeline.stop = false;
    }
	return true;	
};

/**
 * Checks whether the command is Enabled or not
 * @param {Tridion.Cme.Selection} selection The current selection.
 * @param {Tridion.Cme.Pipeline} execution pipeline.
 */
CommandsExtensions.SecurePublish.prototype._isEnabled = function SecurePublish$_isEnabled(selection, pipeline)
{
	if (pipeline) {
        pipeline.stop = false;
    }
	return this._isAvailable(selection, pipeline);
};

/**
 * Executes this command on the selection.
 * @param {Tridion.Cme.Selection} selection The current selection.
 * @param {Tridion.Cme.Pipeline} execution pipeline.
 */
CommandsExtensions.SecurePublish.prototype._execute = function SecurePublish$_execute(selection, pipeline)
{
    if (pipeline) {
        pipeline.stop = false;
    }
	
};

