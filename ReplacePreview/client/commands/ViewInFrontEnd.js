Type.registerNamespace("CommandsExtensions");

(function($) {

/**
 * Implements the <c>ViewInFrontEnd</c> command extension
 */
function ViewInFrontEnd(settings)
{
    var FIELD_NAME = "Publishing URL";
    
    var classToBeReturned =  function() {
      Type.enableInterface(this, settings.fullQName);
      this.addInterface("Tridion.Cme.Command", [settings.className]);
      this.settings = settings;
      
      this.configClient = configureExtensionManager();
    }
    
    /**
     * Integrates with Extension Manager extension if it is present.
     *
     * http://yoavniran.wordpress.com/2011/04/08/programming-with-the-extensions-manager-extension/
     */
    function configureExtensionManager() {
      if (typeof($extConfManager) != 'undefined') {
        configClient = new $$ec.Client("ReplacePreviewExtension");
        
        configClient.init(function (definition, loaded) {
          if (!loaded) {
            configClient.setTitle("Replace preview");
            configClient.setDescription("Replace standard Preview functionality with a redirection to published site.");
            
            configClient.addField(FIELD_NAME, {
              Type: $extConfConsts.Types.TEXT,
              AdminOnly: true,
              MultipleValue: true,
              HelpText: "URL to redirect when previewing a page."
            }, [
              { key: 'Multiline', value: true }
            ]);
            
            configClient.create();
            
            return configClient;
          }
        });
      }
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

        if(item){
            _getUrlAndViewInFrontEnd(itemId)
        }

        if (pipeline) {
            pipeline.stop = false;
        }
    };

    function _getUrlAndViewInFrontEnd(itemId) {
        $extUtils.getStaticItem(itemId,
            function (item) //load the item info asynchronously
            {
                var frontEndUrl = _getFrontEndUrlBasedOnPublicationId(item.getPublication().getId());
                if(!frontEndUrl) {
                    frontEndUrl = this.settings.frontEndUrl;
                }
                var itemXml = item.getStaticXmlDocument();
                window.open(frontEndUrl + _getPublishLocationUrl(itemXml));
            }, null, false);
    }

    function _getPublishLocationUrl(itemXml) {
        return $xml.getInnerText(itemXml, "//tcm:Info/tcm:LocationInfo/tcm:PublishLocationUrl");
    }

    function _getFrontEndUrlBasedOnPublicationId(pubId) {
        if(this.configClient) {
          var xml = $.parseXML(configClient.getValue(FIELD_NAME));
        }
        return null; //Get the URL from XML based on Publication ID
    }

    return classToBeReturned;
};


CommandsExtensions.ViewInStaging = ViewInFrontEnd({fullQName: "CommandsExtensions.ViewInStaging",
                                                   className: "ViewInStaging",
                                                   frontEndUrl: "http://staging.frontend.com"});
CommandsExtensions.ViewInLive = ViewInFrontEnd({fullQName: "CommandsExtensions.ViewInLive",
                                                className: "ViewInLive",
                                                frontEndUrl: "http://www.frontend.com"});

})(window.$j);
