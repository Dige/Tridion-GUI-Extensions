Type.registerNamespace("Tridion.Cme.Model");

/**
* Implements Info Message.
* @constructor
*/
Tridion.Cme.Model.InfoMessage = function InfoMessage(title, description, targetWindow, modalWindow, buttonLabels) {
    Tridion.OO.enableInterface(this, "Tridion.Cme.Model.InfoMessage");
    this.addInterface("Tridion.Cme.Model.MessageBase", [title, description, targetWindow, modalWindow]);

    /**
    * Specifies the localized labels for confirm and cancel buttons as an associative array
    * @type {Object}
    */
    this.properties.buttonLabels = buttonLabels;
};


Tridion.Cme.Model.InfoMessage.prototype.addButtons = function InfoMessage$addButtons() {
    this.callBase("Tridion.Cme.Model.MessageBase", "addButtons");   
};

/**
* Initializes Info Message.
* @private
*/
Tridion.Cme.Model.InfoMessage.prototype.initialize = function InfoMessage$initialize() {
    this.callBase("Tridion.Cme.Model.MessageBase", "initialize");
    this.properties.className = "question";
};


Tridion.Cme.Model.InfoMessage.prototype.confirm = function InfoMessage$confirm() {
    if (this.isActive()) {
        this.fireEvent("confirm");
        $messages.executeAction("archive", this.getId());
    }
};