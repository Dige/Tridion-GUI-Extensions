Type.registerNamespace("CommandsExtensions");

/**
 * Implements the <c>Publish</c> command extension
 */
CommandsExtensions.ReplacePreview = function ()
{
	Type.enableInterface(this, "CommandsExtensions.ReplacePreview");
	this.addInterface("Tridion.Cme.Command", ["ReplacePreview"]);
};

/**
 * Checks whether the command is Available or not�
 * The Command will be available for administrators always.
 * If the user is not administrator, the 'Publish' command will be available when the user has rights to 'Publish' 
 * and the item(s) to be published are not Structure Groups
 * @param {Tridion.Cme.Selection} selection The current selection.
 * @param {Tridion.Cme.Pipeline} execution pipeline.
 */
CommandsExtensions.ReplacePreview.prototype._isAvailable = function (selection, pipeline)
{
	if (pipeline) {
        pipeline.stop = false;
    }
	return false;
};

/**
 * Checks whether the command is Enabled or not
 * @param {Tridion.Cme.Selection} selection The current selection.
 * @param {Tridion.Cme.Pipeline} execution pipeline.
 */
CommandsExtensions.ReplacePreview.prototype._isEnabled = function(selection, pipeline)
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
CommandsExtensions.ReplacePreview.prototype._execute = function (selection, pipeline)
{
    if (pipeline) {
        pipeline.stop = false;
    }
	
};

