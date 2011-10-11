Type.registerNamespace("CommandsExtensions");

var frontEndType;
/**
 * Implements the <c>ViewInFrontEnd</c> command extension
 */
CommandsExtensions.ViewInStaging = function ()
{
	Type.enableInterface(this, "CommandsExtensions.ViewInFrontEnd");
	this.addInterface("Tridion.Cme.Command", ["ViewInStaging"]);
    frontEndType = "Staging";
};

CommandsExtensions.ViewInLive = function ()
{
	Type.enableInterface(this, "CommandsExtensions.ViewInFrontEnd");
	this.addInterface("Tridion.Cme.Command", ["ViewInLive"]);
    frontEndType = "Live";
};

/**
 * Checks whether the command is Available or not�
 * @param {Tridion.Cme.Selection} selection The current selection.
 * @param {Tridion.Cme.Pipeline} execution pipeline.
 */
CommandsExtensions.ViewInFrontEnd.prototype._isAvailable = function (selection, pipeline)
{
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
CommandsExtensions.ViewInFrontEnd.prototype._isEnabled = function(selection, pipeline)
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
CommandsExtensions.ViewInFrontEnd.prototype._execute = function (selection, pipeline)
{
    console.log(frontEndType);
    if (pipeline) {
        pipeline.stop = false;
    }

};

