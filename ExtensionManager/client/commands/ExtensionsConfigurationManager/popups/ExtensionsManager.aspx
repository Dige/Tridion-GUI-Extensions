<%@ Page Language="C#" AutoEventWireup="true" Inherits="Yoav.Extensions.Controls.ExtensionsManagerPage" ClassName="ExtensionsManagerPage"%>
<%@ Import Namespace="Tridion.Web.UI" %>
<%@ Register TagPrefix="ui"  Namespace="Tridion.Web.UI.Editors.CME.Controls" Assembly="Tridion.Web.UI.Editors.CME"  %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html id="ExtensionsManagerPage" class="tridion popup gecko" xmlns="http://www.w3.org/1999/xhtml" xmlns:c="http://www.sdltridion.com/web/ui/controls">

<head>
    <title></title>
	<cc:TridionManager runat="server" editor="2011Extensions">
		<dependencies runat="server">		
			<dependency runat="server">Tridion.Web.UI.Editors.CME</dependency>					
			<dependency runat="server">Tridion.Web.UI.Editors.CME.commands</dependency>	
		</dependencies>
	</cc:TridionManager>
</head>
<body id="StackElement" class="stack popupview">
    
	<div id="container">
		<div id="TopPanel" class="stack-elem tridion-logo-background">
			<ui:ActiveMessageCenter id="MessageCenter" runat="server" />
			<img src="../Styles/icons/manage.png" alt="manage"/>
		</div>

		<div id="middlePanel" class="stack-calc">
			<div id="extensions">

				<h2 id="popupTitle">Available Extensions</h2>
				
				<div id="extensionsList">					
				</div>

				<br class="clear" />
			</div>
		
			<div id="settings">
			
				<div id="extensionSettings" class="tabs-bottom">
					<ul>
						<li><a href="#settingsTab">Settings</a></li>												
					</ul>
					<div id="settingsTab">
						
					</div>	
					<img id="refreshButton" src="<%=ThemePath%>/ExtensionsConfigurationManager/Styles/Icons/refresh.png" title="Reload Settings" alt="reload" />
				</div>

				<div id="extensionsLoading">				
					Loading...
				</div>
				
				<br class="clear"/>
			</div>
					
			<div id="noExtensions">
				<h1>No Available Extensions</h1>
			</div>
		</div>

		<div id="BottomPanel" class="stack-elem">		
			<span id="credits">Made by Yoav Niran</span>	
			<c:Button ID="CloseButton" runat="server" Label="<%$ Resources: Tridion.Web.UI.Strings, Close %>" Class="customButton" />
			<c:Button ID="SaveButton" runat="server" Label="<%$ Resources: Tridion.Web.UI.Strings, Save %>" Class="customButton"/>

			<img id="buttonLoading" src="<%=ThemePath%>/ExtensionsConfigurationManager/Styles/Icons/ajax.gif" alt="loading" />
		</div>
	</div>

	<script id="tmplAccordion" type="text/x-jquery-tmpl">
		<h3 rel="${Index}">
			<a href="#">
				{{if Title}}
					${Title}
				{{else}}
					${Id}
				{{/if}}
			</a>
		</h3>
		
		<div>{{html Description}}</div>
	</script>
	
	<script>
	function isMultiline(options) {
		return window.$j.grep(options, function(item) {
			return item.key == 'Multiline' && eval(item.value);
		}).length > 0;
	}
	</script>
	
	<script id="tmplFields" type="text/x-jquery-tmpl">

		{{if $item.showElement($item)}}
			<li class="setRow">
				<div class="setInRow">
					<div class="setRowLabel" rel="${Id}">
						<div class="setRowLabelText">
							${Name}	
						</div>
						{{if HelpText}}
							<span class="rowLabelHelp" title="${HelpText}"></span>
						{{/if}}
					</div>
					<div class="setRowInputContainer">
						<div class="setRowInput">
						{{if Type==$extConfConsts.Types.TEXT}}
							<{{if isMultiline(Options)}}textarea{{else}}input size="20" type="text"{{/if}} rel="${Type}" id="${Id}" name="${Id}" class="{{if $item.adminMode}}adminField{{else}}userField{{/if}}"/>
						{{else Type==$extConfConsts.Types.NUMBER}}
							<input size="20" type="text" rel="${Type}" id="${Id}" name="${Id}" class="{{if $item.adminMode}}adminField{{else}}userField{{/if}}"/>
						{{else Type==$extConfConsts.Types.COLOR}}
							<input size="6" maxlength="6" type="text" rel="${Type}" id="${Id}" name="${Id}" class="colorField {{if $item.adminMode}}adminField{{else}}userField{{/if}}"/>
						{{else Type==$extConfConsts.Types.OPTION}}

							{{if MultipleValue}}
								<span class="selectContainer allOptionContainer">
									<input class="allItem selectItem {{if $item.adminMode}}adminField{{else}}userField{{/if}}" type="checkbox" value="${$extConfConsts.ALL_OPTION}" name="${Id}" id="${Id}_-1" rel="${Type}"/>
									<label for="${Id}_-1">All</label>									
								</span>
							{{/if}}

							{{each Options}}
								<span class="selectContainer">
								{{if MultipleValue}}									
									<input class="selectItem {{if $item.adminMode}}adminField{{else}}userField{{/if}}" type="checkbox" value="${value}" name="${Id}" id="${Id}_${$index}" rel="${Type}"/>									
								{{else}}									
									<input class="selectItem {{if $item.adminMode}}adminField{{else}}userField{{/if}}" type="radio" value="${value}" name="${Id}" id="${Id}_${$index}" rel="${Type}"/>			
								{{/if}}
									
									<label for="${Id}_${$index}">${key}</label>									
								</span>
							{{/each}}
						{{else TYPE=$extConfConsts.Types.GROUPS}}
							{{if $item.groups}}

								{{if MultipleValue}}
									<span class="selectContainer allOptionContainer">										
										<input class="allItem selectItem {{if $item.adminMode}}adminField{{else}}userField{{/if}}" type="checkbox" value="${$extConfConsts.ALL_OPTION}" name="${Id}" id="${Id}_-1" rel="${Type}"/>
										<label for="${Id}_-1">All</label>									
									</span>
								{{/if}}

								{{each $item.groups}}
									<span class="selectContainer">
										{{if MultipleValue}}
											<input class="selectItem {{if $item.adminMode}}adminField{{else}}userField{{/if}}" type="checkbox" value="${GroupId}" name="${Id}" id="${Id}_${$index}" rel="${Type}"/>
										{{else}}
											<input class="selectItem {{if $item.adminMode}}adminField{{else}}userField{{/if}}" type="radio" value="${GroupId}" name="${Id}" id="${Id}_${$index}" rel="${Type}"/>
										{{/if}}
										<label for="${Id}_${$index}">${GroupTitle}</label>									
									</span>
								{{/each}}
							{{/if}}						
						{{/if}}
						</div>
					</div>
				</div>
			</li>
		{{/if}}
	</script>
</body>

</html>
