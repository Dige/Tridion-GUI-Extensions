/*

**				Extensions.Configuration.ConfigSamples

** Description

***	This is a collection of samples showing how to register extensions to the Extensions Manager
*** add a reference to this file the extension.config to see them added to the Manager interface.

** Version

***	0.3

** By 

***	Yoav Niran (SDL Tridion)
*/

Type.registerNamespace("Extensions.Configuration");

Extensions.Configuration.ConfigSamples = function ()
{
	this.load = function ()
	{
		var sample1 = new $$ec.Client("CrazyExtension");

		//Example of registering a validator for an extension
		sample1.setFieldTypeValidator($extConfConsts.Types.NUMBER, function (value) //validate number fields for this extension
		{
			if (value.length > 0)
			{
				var num = parseInt(value);
				return (num > 0 && num < 10); //only allow numbers between 1 and 9
			}
		});

		$evt.addEventHandler(sample1, "initialized", function ()
		{
			$log.message("*************** sample 1 client has been initialized!!!!");
		});

		sample1.init(function (definition, loaded)
		{
			if (!loaded)
			{
				sample1.setDescription("some bla bla about this crazy extension by Yoav");
				sample1.setTitle("Yoav's Crazy Extension");

				//** User settings **//
				sample1.addField("Application", { "Type": $extConfConsts.Types.TEXT, "Default": "Tridion" });
				sample1.addField("Favorite Number", { "Type": $extConfConsts.Types.NUMBER });
				sample1.addField("optionsField", { "Type": $extConfConsts.Types.OPTION, "MultipleValue": true, "Default": "val2" }, $extConfConsts.OptionGroups.YES_NO);
				sample1.addField("Text Field 1", { "Type": $extConfConsts.Types.TEXT, "HelpText": "useful info aobut this field" });
				sample1.addField("Text Field 2", { "Type": $extConfConsts.Types.TEXT });
				sample1.addField("Text Field 3", { "Type": $extConfConsts.Types.TEXT });
				sample1.addField("Text Field 4", { "Type": $extConfConsts.Types.TEXT });

				//** Admin settings **//
				sample1.addField("Show For Groups", { "Type": $extConfConsts.Types.GROUPS, "AdminOnly": true, "MultipleValue": true });
				sample1.addField("Text Field 12", { "Type": $extConfConsts.Types.TEXT, "AdminOnly": true });

				sample1.create();
			}
		});

		var sample2 = new $$ec.Client("SampleExtension");

		sample2.init(function (definition, loaded)
		{
			if (!loaded)
			{
				sample2.setDescription("this is a <strong>sample</strong> <span style='color:blue;'>extension</span> configuration");
				sample2.setTitle("Sample Extension");

				//** User settings **//
				sample2.addField("Text Field", { "Type": $extConfConsts.Types.TEXT });
				sample2.addField("Number Field", { "Type": $extConfConsts.Types.NUMBER });
				sample2.addField("Options Field", { "Type": $extConfConsts.Types.OPTION, "Default": "3", "MultipleValue": true }, [{ "key": "blue", "value": "1" }, { "key": "red", "value": "2" }, { "key": "yellow", "value": "3"}]);

				//** Admin settings **//
				sample2.addField("Text Field admin", { "Type": $extConfConsts.Types.TEXT, "AdminOnly": true });
				sample2.addField("Number Field admin", { "Type": $extConfConsts.Types.NUMBER, "AdminOnly": true });
				sample2.addField("Options Field admin", { "Type": $extConfConsts.Types.OPTION, "AdminOnly": true, "Default": "1" }, [{ "key": "blue", "value": "1" }, { "key": "red", "value": "2" }, { "key": "yellow", "value": "3"}]);

				sample2.create();
			}
		});

		var sample3 = new $$ec.Client("AnotherSample");

		sample3.init(function (definition, loaded)
		{
			sample3.setDescription("this is another <strong>sample</strong> <span style='color:blue;'>extension</span> configuration");
			sample3.setTitle("Another Extension");

			//example using 'updatefield' instead of 'addField' allows us to make sure the definition on the server
			//will be updated even if its already stored on the server but only when the fields 
			//change on the client.

			//** User settings **//
			sample3.updateField("Text Field", { "Type": $extConfConsts.Types.TEXT, "HelpText": "useful info aobut this field" });
			sample3.updateField("Number Field", { "Type": $extConfConsts.Types.NUMBER });

			//** ADMIN settings **//
			sample3.updateField("Show on Start", { "Type": $extConfConsts.Types.OPTION, "Default": "0", "HelpText": "Should this dummy extension be loaded at startup" }, $extConfConsts.OptionGroups.TRUE_FALSE);

			sample3.create(); //will only be commited to the server if the definition of the fields is different from whats already stored
		});
	}
};