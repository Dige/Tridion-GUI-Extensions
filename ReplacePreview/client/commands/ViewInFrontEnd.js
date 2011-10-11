Type.registerNamespace("CommandsExtensions");

/**
 * Implements the <c>ViewInFrontEnd</c> command extension
 */
function ViewInFrontEnd(settings)
{
    var classToBeReturned =  function() {
	Type.enableInterface(this, settings.fullQName);
	this.addInterface("Tridion.Cme.Command", [settings.className]);
    this.settings = settings;
    }

    classToBeReturned.prototype._isAvailable = function (selection, pipeline) {
        var items = selection.getItems();

        if(items.length != 1) {
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

    classToBeReturned.prototype._isEnabled = function(selection, pipeline) {
        if (pipeline) {
            pipeline.stop = false;
        }
        return this._isAvailable(selection, pipeline);
    };

    classToBeReturned.prototype._execute = function (selection, pipeline) {

        var itemId = selection.getItem(0);
        var item = $models.getItem(itemId);

        if(item){
            _getUrlAndViewInFrontEnd(item.getId())
        }

        if (pipeline) {
            pipeline.stop = false;
        }
    };

    function _getUrlAndViewInFrontEnd(itemId) {
        $extUtils.getStaticItem(itemId,
            function (item) //load the item info asynchronously
            {
                var publicationId = item.getPublication().getId();
                var frontEndUrl = "http://www.front.end"; //Get the URL from XML based on Publication ID
                var itemXml = item.getStaticXmlDocument();
                window.open(frontEndUrl + _getPublishLocationUrl(itemXml));
            }, null, false);
    }

    function _getPublishLocationUrl(itemXml) {
        return $xml.getInnerText(itemXml, "//tcm:Info/tcm:LocationInfo/tcm:PublishLocationUrl");
    }

    return classToBeReturned;
};


CommandsExtensions.ViewInStaging = ViewInFrontEnd({fullQName: "CommandsExtensions.ViewInStaging",
                                                   className: "ViewInStaging",
                                                   urlListFile: "stagingUrls.xml"});
CommandsExtensions.ViewInLive = ViewInFrontEnd({fullQName: "CommandsExtensions.ViewInLive",
                                                className: "ViewInLive",
                                                urlListFile: "liveUrls.xml"});