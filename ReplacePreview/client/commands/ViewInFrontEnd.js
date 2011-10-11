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
        var frontEndUrl = "http://www.front.end"; //Get the URL from XML based on Publication ID
        var itemId = selection.getItem(0);
        var item = $models.getItem(itemId);

        if(item){
            var itemXml = item.getStaticXmlDocument();
            var path = _getPathAndFileNameOfPage(itemXml);
            console.log(itemXml);
            window.open(frontEndUrl + path);
        }

        if (pipeline) {
            pipeline.stop = false;
        }
    };

    function _getPathAndFileNameOfPage(itemXml) {
        var fileName = $xml.getInnerText(itemXml, "//tcm:Data/tcm:FileName");
        var directory = "/dummy/test/";
        //var directory = $xml.getInnerText(itemXmlOfSG, "//tcm:Data/tcm:Directory");
        return directory + fileName;
    }

    return classToBeReturned;
};


CommandsExtensions.ViewInStaging = ViewInFrontEnd({fullQName: "CommandsExtensions.ViewInStaging",
                                                   className: "ViewInStaging",
                                                   urlListFile: "stagingUrls.xml"});
CommandsExtensions.ViewInLive = ViewInFrontEnd({fullQName: "CommandsExtensions.ViewInLive",
                                                className: "ViewInLive",
                                                urlListFile: "liveUrls.xml"});