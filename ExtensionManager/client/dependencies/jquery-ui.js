//** This is a custom jQuery UI container that doesnt include all jQuery UI functionality.
//** YN
//*******************

var addJqueryUI = function ()
{

	/*!
	* jQuery UI @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI
	*/
	(function ($, undefined)
	{

		// prevent duplicate loading
		// this is only a problem because we proxy existing functions
		// and we don't want to double proxy them
		$.ui = $.ui || {};
		if ($.ui.version)
		{
			return;
		}

		$.extend($.ui, {
			version: "@VERSION",

			keyCode: {
				ALT: 18,
				BACKSPACE: 8,
				CAPS_LOCK: 20,
				COMMA: 188,
				COMMAND: 91,
				COMMAND_LEFT: 91, // COMMAND
				COMMAND_RIGHT: 93,
				CONTROL: 17,
				DELETE: 46,
				DOWN: 40,
				END: 35,
				ENTER: 13,
				ESCAPE: 27,
				HOME: 36,
				INSERT: 45,
				LEFT: 37,
				MENU: 93, // COMMAND_RIGHT
				NUMPAD_ADD: 107,
				NUMPAD_DECIMAL: 110,
				NUMPAD_DIVIDE: 111,
				NUMPAD_ENTER: 108,
				NUMPAD_MULTIPLY: 106,
				NUMPAD_SUBTRACT: 109,
				PAGE_DOWN: 34,
				PAGE_UP: 33,
				PERIOD: 190,
				RIGHT: 39,
				SHIFT: 16,
				SPACE: 32,
				TAB: 9,
				UP: 38,
				WINDOWS: 91 // COMMAND
			}
		});

		// plugins
		$.fn.extend({
			_focus: $.fn.focus,
			focus: function (delay, fn)
			{
				return typeof delay === "number" ?
			this.each(function ()
			{
				var elem = this;
				setTimeout(function ()
				{
					$(elem).focus();
					if (fn)
					{
						fn.call(elem);
					}
				}, delay);
			}) :
			this._focus.apply(this, arguments);
			},

			scrollParent: function ()
			{
				var scrollParent;
				if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position')))
				{
					scrollParent = this.parents().filter(function ()
					{
						return (/(relative|absolute|fixed)/).test($.curCSS(this, 'position', 1)) && (/(auto|scroll)/).test($.curCSS(this, 'overflow', 1) + $.curCSS(this, 'overflow-y', 1) + $.curCSS(this, 'overflow-x', 1));
					}).eq(0);
				} else
				{
					scrollParent = this.parents().filter(function ()
					{
						return (/(auto|scroll)/).test($.curCSS(this, 'overflow', 1) + $.curCSS(this, 'overflow-y', 1) + $.curCSS(this, 'overflow-x', 1));
					}).eq(0);
				}

				return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
			},

			zIndex: function (zIndex)
			{
				if (zIndex !== undefined)
				{
					return this.css("zIndex", zIndex);
				}

				if (this.length)
				{
					var elem = $(this[0]), position, value;
					while (elem.length && elem[0] !== document)
					{
						// Ignore z-index if position is set to a value where z-index is ignored by the browser
						// This makes behavior of this function consistent across browsers
						// WebKit always returns auto if the element is positioned
						position = elem.css("position");
						if (position === "absolute" || position === "relative" || position === "fixed")
						{
							// IE returns 0 when zIndex is not specified
							// other browsers return a string
							// we ignore the case of nested elements with an explicit value of 0
							// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
							value = parseInt(elem.css("zIndex"), 10);
							if (!isNaN(value) && value !== 0)
							{
								return value;
							}
						}
						elem = elem.parent();
					}
				}

				return 0;
			},

			disableSelection: function ()
			{
				return this.bind(($.support.selectstart ? "selectstart" : "mousedown") +
			".ui-disableSelection", function (event)
			{
				event.preventDefault();
			});
			},

			enableSelection: function ()
			{
				return this.unbind(".ui-disableSelection");
			}
		});

		$.each(["Width", "Height"], function (i, name)
		{
			var side = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"],
		type = name.toLowerCase(),
		orig = {
			innerWidth: $.fn.innerWidth,
			innerHeight: $.fn.innerHeight,
			outerWidth: $.fn.outerWidth,
			outerHeight: $.fn.outerHeight
		};

			function reduce(elem, size, border, margin)
			{
				$.each(side, function ()
				{
					size -= parseFloat($.curCSS(elem, "padding" + this, true)) || 0;
					if (border)
					{
						size -= parseFloat($.curCSS(elem, "border" + this + "Width", true)) || 0;
					}
					if (margin)
					{
						size -= parseFloat($.curCSS(elem, "margin" + this, true)) || 0;
					}
				});
				return size;
			}

			$.fn["inner" + name] = function (size)
			{
				if (size === undefined)
				{
					return orig["inner" + name].call(this);
				}

				return this.each(function ()
				{
					$(this).css(type, reduce(this, size) + "px");
				});
			};

			$.fn["outer" + name] = function (size, margin)
			{
				if (typeof size !== "number")
				{
					return orig["outer" + name].call(this, size);
				}

				return this.each(function ()
				{
					$(this).css(type, reduce(this, size, true, margin) + "px");
				});
			};
		});

		// selectors
		function visible(element)
		{
			return !$(element).parents().andSelf().filter(function ()
			{
				return $.curCSS(this, "visibility") === "hidden" ||
			$.expr.filters.hidden(this);
			}).length;
		}

		$.extend($.expr[":"], {
			data: function (elem, i, match)
			{
				return !!$.data(elem, match[3]);
			},

			focusable: function (element)
			{
				var nodeName = element.nodeName.toLowerCase(),
			tabIndex = $.attr(element, "tabindex");
				if ("area" === nodeName)
				{
					var map = element.parentNode,
				mapName = map.name,
				img;
					if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map")
					{
						return false;
					}
					img = $("img[usemap=#" + mapName + "]")[0];
					return !!img && visible(img);
				}
				return (/input|select|textarea|button|object/.test(nodeName)
			? !element.disabled
			: "a" == nodeName
				? element.href || !isNaN(tabIndex)
				: !isNaN(tabIndex))
				// the element and all of its ancestors must be visible
			&& visible(element);
			},

			tabbable: function (element)
			{
				var tabIndex = $.attr(element, "tabindex");
				return (isNaN(tabIndex) || tabIndex >= 0) && $(element).is(":focusable");
			}
		});

		// support
		$(function ()
		{
			var body = document.body,
		div = body.appendChild(div = document.createElement("div"));

			$.extend(div.style, {
				minHeight: "100px",
				height: "auto",
				padding: 0,
				borderWidth: 0
			});

			$.support.minHeight = div.offsetHeight === 100;
			$.support.selectstart = "onselectstart" in div;

			// set display to none to avoid a layout bug in IE
			// http://dev.jquery.com/ticket/4014
			body.removeChild(div).style.display = "none";
		});





		// deprecated
		$.extend($.ui, {
			// $.ui.plugin is deprecated.  Use the proxy pattern instead.
			plugin: {
				add: function (module, option, set)
				{
					var proto = $.ui[module].prototype;
					for (var i in set)
					{
						proto.plugins[i] = proto.plugins[i] || [];
						proto.plugins[i].push([option, set[i]]);
					}
				},
				call: function (instance, name, args)
				{
					var set = instance.plugins[name];
					if (!set || !instance.element[0].parentNode)
					{
						return;
					}

					for (var i = 0; i < set.length; i++)
					{
						if (instance.options[set[i][0]])
						{
							set[i][1].apply(instance.element, args);
						}
					}
				}
			},

			// will be deprecated when we switch to jQuery 1.4 - use jQuery.contains()
			contains: function (a, b)
			{
				return document.compareDocumentPosition ?
			a.compareDocumentPosition(b) & 16 :
			a !== b && a.contains(b);
			},

			// only used by resizable
			hasScroll: function (el, a)
			{

				//If overflow is hidden, the element might have extra content, but the user wants to hide it
				if ($(el).css("overflow") === "hidden")
				{
					return false;
				}

				var scroll = (a && a === "left") ? "scrollLeft" : "scrollTop",
			has = false;

				if (el[scroll] > 0)
				{
					return true;
				}

				// TODO: determine which cases actually cause this to happen
				// if the element doesn't have the scroll set, see if it's possible to
				// set the scroll
				el[scroll] = 1;
				has = (el[scroll] > 0);
				el[scroll] = 0;
				return has;
			},

			// these are odd functions, fix the API or move into individual plugins
			isOverAxis: function (x, reference, size)
			{
				//Determines when x coordinate is over "b" element axis
				return (x > reference) && (x < (reference + size));
			},
			isOver: function (y, x, top, left, height, width)
			{
				//Determines when x, y coordinates is over "b" element
				return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width);
			}
		});

	})($j);

	/*!
	* jQuery UI Widget @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Widget
	*/
	(function ($, undefined)
	{

		// jQuery 1.4+
		if ($.cleanData)
		{
			var _cleanData = $.cleanData;
			$.cleanData = function (elems)
			{
				for (var i = 0, elem; (elem = elems[i]) != null; i++)
				{
					$(elem).triggerHandler("remove");
				}
				_cleanData(elems);
			};
		} else
		{
			var _remove = $.fn.remove;
			$.fn.remove = function (selector, keepData)
			{
				return this.each(function ()
				{
					if (!keepData)
					{
						if (!selector || $.filter(selector, [this]).length)
						{
							$("*", this).add([this]).each(function ()
							{
								$(this).triggerHandler("remove");
							});
						}
					}
					return _remove.call($(this), selector, keepData);
				});
			};
		}

		$.widget = function (name, base, prototype)
		{
			var namespace = name.split(".")[0],
		fullName;
			name = name.split(".")[1];
			fullName = namespace + "-" + name;

			if (!prototype)
			{
				prototype = base;
				base = $.Widget;
			}

			// create selector for plugin
			$.expr[":"][fullName] = function (elem)
			{
				return !!$.data(elem, name);
			};

			$[namespace] = $[namespace] || {};
			$[namespace][name] = function (options, element)
			{
				// allow instantiation without initializing for simple inheritance
				if (arguments.length)
				{
					this._createWidget(options, element);
				}
			};

			var basePrototype = new base();
			// we need to make the options hash a property directly on the new instance
			// otherwise we'll modify the options hash on the prototype that we're
			// inheriting from
			//	$.each( basePrototype, function( key, val ) {
			//		if ( $.isPlainObject(val) ) {
			//			basePrototype[ key ] = $.extend( {}, val );
			//		}
			//	});
			basePrototype.options = $.extend(true, {}, basePrototype.options);
			$[namespace][name].prototype = $.extend(true, basePrototype, {
				namespace: namespace,
				widgetName: name,
				widgetEventPrefix: $[namespace][name].prototype.widgetEventPrefix || name,
				widgetBaseClass: fullName
			}, prototype);

			$.widget.bridge(name, $[namespace][name]);
		};

		$.widget.bridge = function (name, object)
		{
			$.fn[name] = function (options)
			{
				var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call(arguments, 1),
			returnValue = this;

				// allow multiple hashes to be passed on init
				options = !isMethodCall && args.length ?
			$.extend.apply(null, [true, options].concat(args)) :
			options;

				// prevent calls to internal methods
				if (isMethodCall && options.charAt(0) === "_")
				{
					return returnValue;
				}

				if (isMethodCall)
				{
					this.each(function ()
					{
						var instance = $.data(this, name),
					methodValue = instance && $.isFunction(instance[options]) ?
						instance[options].apply(instance, args) :
						instance;
						// TODO: add this back in 1.9 and use $.error() (see #5972)
						//				if ( !instance ) {
						//					throw "cannot call methods on " + name + " prior to initialization; " +
						//						"attempted to call method '" + options + "'";
						//				}
						//				if ( !$.isFunction( instance[options] ) ) {
						//					throw "no such method '" + options + "' for " + name + " widget instance";
						//				}
						//				var methodValue = instance[ options ].apply( instance, args );
						if (methodValue !== instance && methodValue !== undefined)
						{
							returnValue = methodValue;
							return false;
						}
					});
				} else
				{
					this.each(function ()
					{
						var instance = $.data(this, name);
						if (instance)
						{
							instance.option(options || {})._init();
						} else
						{
							$.data(this, name, new object(options, this));
						}
					});
				}

				return returnValue;
			};
		};

		$.Widget = function (options, element)
		{
			// allow instantiation without initializing for simple inheritance
			if (arguments.length)
			{
				this._createWidget(options, element);
			}
		};

		$.Widget.prototype = {
			widgetName: "widget",
			widgetEventPrefix: "",
			options: {
				disabled: false
			},
			_createWidget: function (options, element)
			{
				// $.widget.bridge stores the plugin instance, but we do it anyway
				// so that it's stored even before the _create function runs
				$.data(element, this.widgetName, this);
				this.element = $(element);
				this.options = $.extend(true, {},
			this.options,
			this._getCreateOptions(),
			options);

				var self = this;
				this.element.bind("remove." + this.widgetName, function ()
				{
					self.destroy();
				});

				this._create();
				this._trigger("create");
				this._init();
			},
			_getCreateOptions: function ()
			{
				return $.metadata && $.metadata.get(this.element[0])[this.widgetName];
			},
			_create: function () { },
			_init: function () { },

			destroy: function ()
			{
				this.element
			.unbind("." + this.widgetName)
			.removeData(this.widgetName);
				this.widget()
			.unbind("." + this.widgetName)
			.removeAttr("aria-disabled")
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled");
			},

			widget: function ()
			{
				return this.element;
			},

			option: function (key, value)
			{
				var options = key;

				if (arguments.length === 0)
				{
					// don't return a reference to the internal hash
					return $.extend({}, this.options);
				}

				if (typeof key === "string")
				{
					if (value === undefined)
					{
						return this.options[key];
					}
					options = {};
					options[key] = value;
				}

				this._setOptions(options);

				return this;
			},
			_setOptions: function (options)
			{
				var self = this;
				$.each(options, function (key, value)
				{
					self._setOption(key, value);
				});

				return this;
			},
			_setOption: function (key, value)
			{
				this.options[key] = value;

				if (key === "disabled")
				{
					this.widget()
				[value ? "addClass" : "removeClass"](
					this.widgetBaseClass + "-disabled" + " " +
					"ui-state-disabled")
				.attr("aria-disabled", value);
				}

				return this;
			},

			enable: function ()
			{
				return this._setOption("disabled", false);
			},
			disable: function ()
			{
				return this._setOption("disabled", true);
			},

			_trigger: function (type, event, data)
			{
				var callback = this.options[type];

				event = $.Event(event);
				event.type = (type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type).toLowerCase();
				data = data || {};

				// copy original event properties over to the new event
				// this would happen if we could call $.event.fix instead of $.Event
				// but we don't have a way to force an event to be fixed multiple times
				if (event.originalEvent)
				{
					for (var i = $.event.props.length, prop; i; )
					{
						prop = $.event.props[--i];
						event[prop] = event.originalEvent[prop];
					}
				}

				this.element.trigger(event, data);

				return !($.isFunction(callback) &&
			callback.call(this.element[0], event, data) === false ||
			event.isDefaultPrevented());
			}
		};

	})($j);

	/*
	* jQuery UI Accordion @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Accordion
	*
	* Depends:
	*	jquery.ui.core.js
	*	jquery.ui.widget.js
	*/
	(function ($, undefined)
	{

		$.widget("ui.accordion", {
			options: {
				active: 0,
				animated: "slide",
				autoHeight: true,
				clearStyle: false,
				collapsible: false,
				event: "click",
				fillSpace: false,
				header: "> li > :first-child,> :not(li):even",
				icons: {
					header: "ui-icon-triangle-1-e",
					headerSelected: "ui-icon-triangle-1-s"
				},
				navigation: false,
				navigationFilter: function ()
				{
					return this.href.toLowerCase() === location.href.toLowerCase();
				}
			},

			_create: function ()
			{
				var self = this,
			options = self.options;

				self.running = 0;

				self.element
			.addClass("ui-accordion ui-widget ui-helper-reset")
				// in lack of child-selectors in CSS
				// we need to mark top-LIs in a UL-accordion for some IE-fix
			.children("li")
				.addClass("ui-accordion-li-fix");

				self.headers = self.element.find(options.header)
			.addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all")
			.bind("mouseenter.accordion", function ()
			{
				if (options.disabled)
				{
					return;
				}
				$(this).addClass("ui-state-hover");
			})
			.bind("mouseleave.accordion", function ()
			{
				if (options.disabled)
				{
					return;
				}
				$(this).removeClass("ui-state-hover");
			})
			.bind("focus.accordion", function ()
			{
				if (options.disabled)
				{
					return;
				}
				$(this).addClass("ui-state-focus");
			})
			.bind("blur.accordion", function ()
			{
				if (options.disabled)
				{
					return;
				}
				$(this).removeClass("ui-state-focus");
			});

				self.headers.next()
			.addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom");

				if (options.navigation)
				{
					var current = self.element.find("a").filter(options.navigationFilter).eq(0);
					if (current.length)
					{
						var header = current.closest(".ui-accordion-header");
						if (header.length)
						{
							// anchor within header
							self.active = header;
						} else
						{
							// anchor within content
							self.active = current.closest(".ui-accordion-content").prev();
						}
					}
				}

				self.active = self._findActive(self.active || options.active)
			.addClass("ui-state-default ui-state-active")
			.toggleClass("ui-corner-all")
			.toggleClass("ui-corner-top");
				self.active.next().addClass("ui-accordion-content-active");

				self._createIcons();
				self.resize();

				// ARIA
				self.element.attr("role", "tablist");

				self.headers
			.attr("role", "tab")
			.bind("keydown.accordion", function (event)
			{
				return self._keydown(event);
			})
			.next()
				.attr("role", "tabpanel");

				self.headers
			.not(self.active || "")
			.attr({
				"aria-expanded": "false",
				tabIndex: -1
			})
			.next()
				.hide();

				// make sure at least one header is in the tab order
				if (!self.active.length)
				{
					self.headers.eq(0).attr("tabIndex", 0);
				} else
				{
					self.active
				.attr({
					"aria-expanded": "true",
					tabIndex: 0
				});
				}

				// only need links in tab order for Safari
				if (!$.browser.safari)
				{
					self.headers.find("a").attr("tabIndex", -1);
				}

				if (options.event)
				{
					self.headers.bind(options.event.split(" ").join(".accordion ") + ".accordion", function (event)
					{
						self._clickHandler.call(self, event, this);
						event.preventDefault();
					});
				}
			},

			_createIcons: function ()
			{
				var options = this.options;
				if (options.icons)
				{
					$("<span></span>")
				.addClass("ui-icon " + options.icons.header)
				.prependTo(this.headers);
					this.active.children(".ui-icon")
				.toggleClass(options.icons.header)
				.toggleClass(options.icons.headerSelected);
					this.element.addClass("ui-accordion-icons");
				}
			},

			_destroyIcons: function ()
			{
				this.headers.children(".ui-icon").remove();
				this.element.removeClass("ui-accordion-icons");
			},

			destroy: function ()
			{
				var options = this.options;

				this.element
			.removeClass("ui-accordion ui-widget ui-helper-reset")
			.removeAttr("role");

				this.headers
			.unbind(".accordion")
			.removeClass("ui-accordion-header ui-accordion-disabled ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-state-disabled ui-corner-top")
			.removeAttr("role")
			.removeAttr("aria-expanded")
			.removeAttr("tabIndex");

				this.headers.find("a").removeAttr("tabIndex");
				this._destroyIcons();
				var contents = this.headers.next()
			.css("display", "")
			.removeAttr("role")
			.removeClass("ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content ui-accordion-content-active ui-accordion-disabled ui-state-disabled");
				if (options.autoHeight || options.fillHeight)
				{
					contents.css("height", "");
				}

				return $.Widget.prototype.destroy.call(this);
			},

			_setOption: function (key, value)
			{
				$.Widget.prototype._setOption.apply(this, arguments);

				if (key == "active")
				{
					this.activate(value);
				}
				if (key == "icons")
				{
					this._destroyIcons();
					if (value)
					{
						this._createIcons();
					}
				}
				// #5332 - opacity doesn't cascade to positioned elements in IE
				// so we need to add the disabled class to the headers and panels
				if (key == "disabled")
				{
					this.headers.add(this.headers.next())
				[value ? "addClass" : "removeClass"](
					"ui-accordion-disabled ui-state-disabled");
				}
			},

			_keydown: function (event)
			{
				if (this.options.disabled || event.altKey || event.ctrlKey)
				{
					return;
				}

				var keyCode = $.ui.keyCode,
			length = this.headers.length,
			currentIndex = this.headers.index(event.target),
			toFocus = false;

				switch (event.keyCode)
				{
					case keyCode.RIGHT:
					case keyCode.DOWN:
						toFocus = this.headers[(currentIndex + 1) % length];
						break;
					case keyCode.LEFT:
					case keyCode.UP:
						toFocus = this.headers[(currentIndex - 1 + length) % length];
						break;
					case keyCode.SPACE:
					case keyCode.ENTER:
						this._clickHandler({ target: event.target }, event.target);
						event.preventDefault();
				}

				if (toFocus)
				{
					$(event.target).attr("tabIndex", -1);
					$(toFocus).attr("tabIndex", 0);
					toFocus.focus();
					return false;
				}

				return true;
			},

			resize: function ()
			{
				var options = this.options,
			maxHeight;

				if (options.fillSpace)
				{
					if ($.browser.msie)
					{
						var defOverflow = this.element.parent().css("overflow");
						this.element.parent().css("overflow", "hidden");
					}
					maxHeight = this.element.parent().height();
					if ($.browser.msie)
					{
						this.element.parent().css("overflow", defOverflow);
					}

					this.headers.each(function ()
					{
						maxHeight -= $(this).outerHeight(true);
					});

					this.headers.next()
				.each(function ()
				{
					$(this).height(Math.max(0, maxHeight -
						$(this).innerHeight() + $(this).height()));
				})
				.css("overflow", "auto");
				} else if (options.autoHeight)
				{
					maxHeight = 0;
					this.headers.next()
				.each(function ()
				{
					maxHeight = Math.max(maxHeight, $(this).height("").height());
				})
				.height(maxHeight);
				}

				return this;
			},

			activate: function (index)
			{
				// TODO this gets called on init, changing the option without an explicit call for that
				this.options.active = index;
				// call clickHandler with custom event
				var active = this._findActive(index)[0];
				this._clickHandler({ target: active }, active);

				return this;
			},

			_findActive: function (selector)
			{
				return selector
			? typeof selector === "number"
				? this.headers.filter(":eq(" + selector + ")")
				: this.headers.not(this.headers.not(selector))
			: selector === false
				? $([])
				: this.headers.filter(":eq(0)");
			},

			// TODO isn't event.target enough? why the separate target argument?
			_clickHandler: function (event, target)
			{
				var options = this.options;
				if (options.disabled)
				{
					return;
				}

				// called only when using activate(false) to close all parts programmatically
				if (!event.target)
				{
					if (!options.collapsible)
					{
						return;
					}
					this.active
				.removeClass("ui-state-active ui-corner-top")
				.addClass("ui-state-default ui-corner-all")
				.children(".ui-icon")
					.removeClass(options.icons.headerSelected)
					.addClass(options.icons.header);
					this.active.next().addClass("ui-accordion-content-active");
					var toHide = this.active.next(),
				data = {
					options: options,
					newHeader: $([]),
					oldHeader: options.active,
					newContent: $([]),
					oldContent: toHide
				},
				toShow = (this.active = $([]));
					this._toggle(toShow, toHide, data);
					return;
				}

				// get the click target
				var clicked = $(event.currentTarget || target),
			clickedIsActive = clicked[0] === this.active[0];

				// TODO the option is changed, is that correct?
				// TODO if it is correct, shouldn't that happen after determining that the click is valid?
				options.active = options.collapsible && clickedIsActive ?
			false :
			this.headers.index(clicked);

				// if animations are still active, or the active header is the target, ignore click
				if (this.running || (!options.collapsible && clickedIsActive))
				{
					return;
				}

				// find elements to show and hide
				var active = this.active,
			toShow = clicked.next(),
			toHide = this.active.next(),
			data = {
				options: options,
				newHeader: clickedIsActive && options.collapsible ? $([]) : clicked,
				oldHeader: this.active,
				newContent: clickedIsActive && options.collapsible ? $([]) : toShow,
				oldContent: toHide
			},
			down = this.headers.index(this.active[0]) > this.headers.index(clicked[0]);

				// when the call to ._toggle() comes after the class changes
				// it causes a very odd bug in IE 8 (see #6720)
				this.active = clickedIsActive ? $([]) : clicked;
				this._toggle(toShow, toHide, data, clickedIsActive, down);

				// switch classes
				active
			.removeClass("ui-state-active ui-corner-top")
			.addClass("ui-state-default ui-corner-all")
			.children(".ui-icon")
				.removeClass(options.icons.headerSelected)
				.addClass(options.icons.header);
				if (!clickedIsActive)
				{
					clicked
				.removeClass("ui-state-default ui-corner-all")
				.addClass("ui-state-active ui-corner-top")
				.children(".ui-icon")
					.removeClass(options.icons.header)
					.addClass(options.icons.headerSelected);
					clicked
				.next()
				.addClass("ui-accordion-content-active");
				}

				return;
			},

			_toggle: function (toShow, toHide, data, clickedIsActive, down)
			{
				var self = this,
			options = self.options;

				self.toShow = toShow;
				self.toHide = toHide;
				self.data = data;

				var complete = function ()
				{
					if (!self)
					{
						return;
					}
					return self._completed.apply(self, arguments);
				};

				// trigger changestart event
				self._trigger("changestart", null, self.data);

				// count elements to animate
				self.running = toHide.size() === 0 ? toShow.size() : toHide.size();

				if (options.animated)
				{
					var animOptions = {};

					if (options.collapsible && clickedIsActive)
					{
						animOptions = {
							toShow: $([]),
							toHide: toHide,
							complete: complete,
							down: down,
							autoHeight: options.autoHeight || options.fillSpace
						};
					} else
					{
						animOptions = {
							toShow: toShow,
							toHide: toHide,
							complete: complete,
							down: down,
							autoHeight: options.autoHeight || options.fillSpace
						};
					}

					if (!options.proxied)
					{
						options.proxied = options.animated;
					}

					if (!options.proxiedDuration)
					{
						options.proxiedDuration = options.duration;
					}

					options.animated = $.isFunction(options.proxied) ?
				options.proxied(animOptions) :
				options.proxied;

					options.duration = $.isFunction(options.proxiedDuration) ?
				options.proxiedDuration(animOptions) :
				options.proxiedDuration;

					var animations = $.ui.accordion.animations,
				duration = options.duration,
				easing = options.animated;

					if (easing && !animations[easing] && !$.easing[easing])
					{
						easing = "slide";
					}
					if (!animations[easing])
					{
						animations[easing] = function (options)
						{
							this.slide(options, {
								easing: easing,
								duration: duration || 700
							});
						};
					}

					animations[easing](animOptions);
				} else
				{
					if (options.collapsible && clickedIsActive)
					{
						toShow.toggle();
					} else
					{
						toHide.hide();
						toShow.show();
					}

					complete(true);
				}

				// TODO assert that the blur and focus triggers are really necessary, remove otherwise
				toHide.prev()
			.attr({
				"aria-expanded": "false",
				tabIndex: -1
			})
			.blur();
				toShow.prev()
			.attr({
				"aria-expanded": "true",
				tabIndex: 0
			})
			.focus();
			},

			_completed: function (cancel)
			{
				this.running = cancel ? 0 : --this.running;
				if (this.running)
				{
					return;
				}

				if (this.options.clearStyle)
				{
					this.toShow.add(this.toHide).css({
						height: "",
						overflow: ""
					});
				}

				// other classes are removed before the animation; this one needs to stay until completed
				this.toHide.removeClass("ui-accordion-content-active");
				// Work around for rendering bug in IE (#5421)
				if (this.toHide.length)
				{
					this.toHide.parent()[0].className = this.toHide.parent()[0].className;
				}

				this._trigger("change", null, this.data);
			}
		});

		$.extend($.ui.accordion, {
			version: "@VERSION",
			animations: {
				slide: function (options, additions)
				{
					options = $.extend({
						easing: "swing",
						duration: 300
					}, options, additions);
					if (!options.toHide.size())
					{
						options.toShow.animate({
							height: "show",
							paddingTop: "show",
							paddingBottom: "show"
						}, options);
						return;
					}
					if (!options.toShow.size())
					{
						options.toHide.animate({
							height: "hide",
							paddingTop: "hide",
							paddingBottom: "hide"
						}, options);
						return;
					}
					var overflow = options.toShow.css("overflow"),
				percentDone = 0,
				showProps = {},
				hideProps = {},
				fxAttrs = ["height", "paddingTop", "paddingBottom"],
				originalWidth;
					// fix width before calculating height of hidden element
					var s = options.toShow;
					originalWidth = s[0].style.width;
					s.width(parseInt(s.parent().width(), 10)
				- parseInt(s.css("paddingLeft"), 10)
				- parseInt(s.css("paddingRight"), 10)
				- (parseInt(s.css("borderLeftWidth"), 10) || 0)
				- (parseInt(s.css("borderRightWidth"), 10) || 0));

					$.each(fxAttrs, function (i, prop)
					{
						hideProps[prop] = "hide";

						var parts = ("" + $.css(options.toShow[0], prop)).match(/^([\d+-.]+)(.*)$/);
						showProps[prop] = {
							value: parts[1],
							unit: parts[2] || "px"
						};
					});
					options.toShow.css({ height: 0, overflow: "hidden" }).show();
					options.toHide
				.filter(":hidden")
					.each(options.complete)
				.end()
				.filter(":visible")
				.animate(hideProps, {
					step: function (now, settings)
					{
						// only calculate the percent when animating height
						// IE gets very inconsistent results when animating elements
						// with small values, which is common for padding
						if (settings.prop == "height")
						{
							percentDone = (settings.end - settings.start === 0) ? 0 :
							(settings.now - settings.start) / (settings.end - settings.start);
						}

						options.toShow[0].style[settings.prop] =
						(percentDone * showProps[settings.prop].value)
						+ showProps[settings.prop].unit;
					},
					duration: options.duration,
					easing: options.easing,
					complete: function ()
					{
						if (!options.autoHeight)
						{
							options.toShow.css("height", "");
						}
						options.toShow.css({
							width: originalWidth,
							overflow: overflow
						});
						options.complete();
					}
				});
				},
				bounceslide: function (options)
				{
					this.slide(options, {
						easing: options.down ? "easeOutBounce" : "swing",
						duration: options.down ? 1000 : 200
					});
				}
			}
		});

	})($j);

	/*!
	* jQuery UI Mouse @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Mouse
	*
	* Depends:
	*	jquery.ui.widget.js
	*/
	(function ($, undefined)
	{

		$.widget("ui.mouse", {
			options: {
				cancel: ':input,option',
				distance: 1,
				delay: 0
			},
			_mouseInit: function ()
			{
				var self = this;

				this.element
			.bind('mousedown.' + this.widgetName, function (event)
			{
				return self._mouseDown(event);
			})
			.bind('click.' + this.widgetName, function (event)
			{
				if (true === $.data(event.target, self.widgetName + '.preventClickEvent'))
				{
					$.removeData(event.target, self.widgetName + '.preventClickEvent');
					event.stopImmediatePropagation();
					return false;
				}
			});

				this.started = false;
			},

			// TODO: make sure destroying one instance of mouse doesn't mess with
			// other instances of mouse
			_mouseDestroy: function ()
			{
				this.element.unbind('.' + this.widgetName);
			},

			_mouseDown: function (event)
			{
				// don't let more than one widget handle mouseStart
				// TODO: figure out why we have to use originalEvent
				event.originalEvent = event.originalEvent || {};
				if (event.originalEvent.mouseHandled) { return; }

				// we may have missed mouseup (out of window)
				(this._mouseStarted && this._mouseUp(event));

				this._mouseDownEvent = event;

				var self = this,
			btnIsLeft = (event.which == 1),
			elIsCancel = (typeof this.options.cancel == "string" ? $(event.target).parents().add(event.target).filter(this.options.cancel).length : false);
				if (!btnIsLeft || elIsCancel || !this._mouseCapture(event))
				{
					return true;
				}

				this.mouseDelayMet = !this.options.delay;
				if (!this.mouseDelayMet)
				{
					this._mouseDelayTimer = setTimeout(function ()
					{
						self.mouseDelayMet = true;
					}, this.options.delay);
				}

				if (this._mouseDistanceMet(event) && this._mouseDelayMet(event))
				{
					this._mouseStarted = (this._mouseStart(event) !== false);
					if (!this._mouseStarted)
					{
						event.preventDefault();
						return true;
					}
				}

				// these delegates are required to keep context
				this._mouseMoveDelegate = function (event)
				{
					return self._mouseMove(event);
				};
				this._mouseUpDelegate = function (event)
				{
					return self._mouseUp(event);
				};
				$(document)
			.bind('mousemove.' + this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.' + this.widgetName, this._mouseUpDelegate);

				event.preventDefault();
				event.originalEvent.mouseHandled = true;
				return true;
			},

			_mouseMove: function (event)
			{
				// IE mouseup check - mouseup happened when mouse was out of window
				if ($.browser.msie && !(document.documentMode >= 9) && !event.button)
				{
					return this._mouseUp(event);
				}

				if (this._mouseStarted)
				{
					this._mouseDrag(event);
					return event.preventDefault();
				}

				if (this._mouseDistanceMet(event) && this._mouseDelayMet(event))
				{
					this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
					(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
				}

				return !this._mouseStarted;
			},

			_mouseUp: function (event)
			{
				$(document)
			.unbind('mousemove.' + this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.' + this.widgetName, this._mouseUpDelegate);

				if (this._mouseStarted)
				{
					this._mouseStarted = false;

					if (event.target == this._mouseDownEvent.target)
					{
						$.data(event.target, this.widgetName + '.preventClickEvent', true);
					}

					this._mouseStop(event);
				}

				return false;
			},

			_mouseDistanceMet: function (event)
			{
				return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
			},

			_mouseDelayMet: function (event)
			{
				return this.mouseDelayMet;
			},

			// These are placeholder methods, to be overriden by extending plugin
			_mouseStart: function (event) { },
			_mouseDrag: function (event) { },
			_mouseStop: function (event) { },
			_mouseCapture: function (event) { return true; }
		});

	})($j);

	/*
	* jQuery UI Tabs @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Tabs
	*
	* Depends:
	*	jquery.ui.core.js
	*	jquery.ui.widget.js
	*/
	(function ($, undefined)
	{

		var tabId = 0,
	listId = 0;

		function getNextTabId()
		{
			return ++tabId;
		}

		function getNextListId()
		{
			return ++listId;
		}

		$.widget("ui.tabs", {
			options: {
				add: null,
				ajaxOptions: null,
				cache: false,
				cookie: null, // e.g. { expires: 7, path: '/', domain: 'jquery.com', secure: true }
				collapsible: false,
				disable: null,
				disabled: [],
				enable: null,
				event: "click",
				fx: null, // e.g. { height: 'toggle', opacity: 'toggle', duration: 200 }
				idPrefix: "ui-tabs-",
				load: null,
				panelTemplate: "<div></div>",
				remove: null,
				select: null,
				show: null,
				spinner: "<em>Loading&#8230;</em>",
				tabTemplate: "<li><a href='#{href}'><span>#{label}</span></a></li>"
			},

			_create: function ()
			{
				this._tabify(true);
			},

			_setOption: function (key, value)
			{
				if (key == "selected")
				{
					if (this.options.collapsible && value == this.options.selected)
					{
						return;
					}
					this.select(value);
				} else
				{
					this.options[key] = value;
					this._tabify();
				}
			},

			_tabId: function (a)
			{
				return a.title && a.title.replace(/\s/g, "_").replace(/[^\w\u00c0-\uFFFF-]/g, "") ||
			this.options.idPrefix + getNextTabId();
			},

			_sanitizeSelector: function (hash)
			{
				// we need this because an id may contain a ":"
				return hash.replace(/:/g, "\\:");
			},

			_cookie: function ()
			{
				var cookie = this.cookie ||
			(this.cookie = this.options.cookie.name || "ui-tabs-" + getNextListId());
				return $.cookie.apply(null, [cookie].concat($.makeArray(arguments)));
			},

			_ui: function (tab, panel)
			{
				return {
					tab: tab,
					panel: panel,
					index: this.anchors.index(tab)
				};
			},

			_cleanup: function ()
			{
				// restore all former loading tabs labels
				this.lis.filter(".ui-state-processing")
			.removeClass("ui-state-processing")
			.find("span:data(label.tabs)")
				.each(function ()
				{
					var el = $(this);
					el.html(el.data("label.tabs")).removeData("label.tabs");
				});
			},

			_tabify: function (init)
			{
				var self = this,
			o = this.options,
			fragmentId = /^#.+/; // Safari 2 reports '#' for an empty hash

				this.list = this.element.find("ol,ul").eq(0);
				this.lis = $(" > li:has(a[href])", this.list);
				this.anchors = this.lis.map(function ()
				{
					return $("a", this)[0];
				});
				this.panels = $([]);

				this.anchors.each(function (i, a)
				{
					var href = $(a).attr("href");
					// For dynamically created HTML that contains a hash as href IE < 8 expands
					// such href to the full page url with hash and then misinterprets tab as ajax.
					// Same consideration applies for an added tab with a fragment identifier
					// since a[href=#fragment-identifier] does unexpectedly not match.
					// Thus normalize href attribute...
					var hrefBase = href.split("#")[0],
				baseEl;
					if (hrefBase && (hrefBase === location.toString().split("#")[0] ||
					(baseEl = $("base")[0]) && hrefBase === baseEl.href))
					{
						href = a.hash;
						a.href = href;
					}

					// inline tab
					if (fragmentId.test(href))
					{
						self.panels = self.panels.add(self.element.find(self._sanitizeSelector(href)));
						// remote tab
						// prevent loading the page itself if href is just "#"
					} else if (href && href !== "#")
					{
						// required for restore on destroy
						$.data(a, "href.tabs", href);

						// TODO until #3808 is fixed strip fragment identifier from url
						// (IE fails to load from such url)
						$.data(a, "load.tabs", href.replace(/#.*$/, ""));

						var id = self._tabId(a);
						a.href = "#" + id;
						var $panel = self.element.find("#" + id);
						if (!$panel.length)
						{
							$panel = $(o.panelTemplate)
						.attr("id", id)
						.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom")
						.insertAfter(self.panels[i - 1] || self.list);
							$panel.data("destroy.tabs", true);
						}
						self.panels = self.panels.add($panel);
						// invalid tab href
					} else
					{
						o.disabled.push(i);
					}
				});

				// initialization from scratch
				if (init)
				{
					// attach necessary classes for styling
					this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all");
					this.list.addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");
					this.lis.addClass("ui-state-default ui-corner-top");
					this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom");

					// Selected tab
					// use "selected" option or try to retrieve:
					// 1. from fragment identifier in url
					// 2. from cookie
					// 3. from selected class attribute on <li>
					if (o.selected === undefined)
					{
						if (location.hash)
						{
							this.anchors.each(function (i, a)
							{
								if (a.hash == location.hash)
								{
									o.selected = i;
									return false;
								}
							});
						}
						if (typeof o.selected !== "number" && o.cookie)
						{
							o.selected = parseInt(self._cookie(), 10);
						}
						if (typeof o.selected !== "number" && this.lis.filter(".ui-tabs-selected").length)
						{
							o.selected = this.lis.index(this.lis.filter(".ui-tabs-selected"));
						}
						o.selected = o.selected || (this.lis.length ? 0 : -1);
					} else if (o.selected === null)
					{ // usage of null is deprecated, TODO remove in next release
						o.selected = -1;
					}

					// sanity check - default to first tab...
					o.selected = ((o.selected >= 0 && this.anchors[o.selected]) || o.selected < 0)
				? o.selected
				: 0;

					// Take disabling tabs via class attribute from HTML
					// into account and update option properly.
					// A selected tab cannot become disabled.
					o.disabled = $.unique(o.disabled.concat(
				$.map(this.lis.filter(".ui-state-disabled"), function (n, i)
				{
					return self.lis.index(n);
				})
			)).sort();

					if ($.inArray(o.selected, o.disabled) != -1)
					{
						o.disabled.splice($.inArray(o.selected, o.disabled), 1);
					}

					// highlight selected tab
					this.panels.addClass("ui-tabs-hide");
					this.lis.removeClass("ui-tabs-selected ui-state-active");
					// check for length avoids error when initializing empty list
					if (o.selected >= 0 && this.anchors.length)
					{
						self.element.find(self._sanitizeSelector(self.anchors[o.selected].hash)).removeClass("ui-tabs-hide");
						this.lis.eq(o.selected).addClass("ui-tabs-selected ui-state-active");

						// seems to be expected behavior that the show callback is fired
						self.element.queue("tabs", function ()
						{
							self._trigger("show", null,
						self._ui(self.anchors[o.selected], self.element.find(self._sanitizeSelector(self.anchors[o.selected].hash))[0]));
						});

						this.load(o.selected);
					}

					// clean up to avoid memory leaks in certain versions of IE 6
					// TODO: namespace this event
					$(window).bind("unload", function ()
					{
						self.lis.add(self.anchors).unbind(".tabs");
						self.lis = self.anchors = self.panels = null;
					});
					// update selected after add/remove
				} else
				{
					o.selected = this.lis.index(this.lis.filter(".ui-tabs-selected"));
				}

				// update collapsible
				// TODO: use .toggleClass()
				this.element[o.collapsible ? "addClass" : "removeClass"]("ui-tabs-collapsible");

				// set or update cookie after init and add/remove respectively
				if (o.cookie)
				{
					this._cookie(o.selected, o.cookie);
				}

				// disable tabs
				for (var i = 0, li; (li = this.lis[i]); i++)
				{
					$(li)[$.inArray(i, o.disabled) != -1 &&
					// TODO: use .toggleClass()
				!$(li).hasClass("ui-tabs-selected") ? "addClass" : "removeClass"]("ui-state-disabled");
				}

				// reset cache if switching from cached to not cached
				if (o.cache === false)
				{
					this.anchors.removeData("cache.tabs");
				}

				// remove all handlers before, tabify may run on existing tabs after add or option change
				this.lis.add(this.anchors).unbind(".tabs");

				if (o.event !== "mouseover")
				{
					var addState = function (state, el)
					{
						if (el.is(":not(.ui-state-disabled)"))
						{
							el.addClass("ui-state-" + state);
						}
					};
					var removeState = function (state, el)
					{
						el.removeClass("ui-state-" + state);
					};
					this.lis.bind("mouseover.tabs", function ()
					{
						addState("hover", $(this));
					});
					this.lis.bind("mouseout.tabs", function ()
					{
						removeState("hover", $(this));
					});
					this.anchors.bind("focus.tabs", function ()
					{
						addState("focus", $(this).closest("li"));
					});
					this.anchors.bind("blur.tabs", function ()
					{
						removeState("focus", $(this).closest("li"));
					});
				}

				// set up animations
				var hideFx, showFx;
				if (o.fx)
				{
					if ($.isArray(o.fx))
					{
						hideFx = o.fx[0];
						showFx = o.fx[1];
					} else
					{
						hideFx = showFx = o.fx;
					}
				}

				// Reset certain styles left over from animation
				// and prevent IE's ClearType bug...
				function resetStyle($el, fx)
				{
					$el.css("display", "");
					if (!$.support.opacity && fx.opacity)
					{
						$el[0].style.removeAttribute("filter");
					}
				}

				// Show a tab...
				var showTab = showFx
			? function (clicked, $show)
			{
				$(clicked).closest("li").addClass("ui-tabs-selected ui-state-active");
				$show.hide().removeClass("ui-tabs-hide") // avoid flicker that way
					.animate(showFx, showFx.duration || "normal", function ()
					{
						resetStyle($show, showFx);
						self._trigger("show", null, self._ui(clicked, $show[0]));
					});
			}
			: function (clicked, $show)
			{
				$(clicked).closest("li").addClass("ui-tabs-selected ui-state-active");
				$show.removeClass("ui-tabs-hide");
				self._trigger("show", null, self._ui(clicked, $show[0]));
			};

				// Hide a tab, $show is optional...
				var hideTab = hideFx
			? function (clicked, $hide)
			{
				$hide.animate(hideFx, hideFx.duration || "normal", function ()
				{
					self.lis.removeClass("ui-tabs-selected ui-state-active");
					$hide.addClass("ui-tabs-hide");
					resetStyle($hide, hideFx);
					self.element.dequeue("tabs");
				});
			}
			: function (clicked, $hide, $show)
			{
				self.lis.removeClass("ui-tabs-selected ui-state-active");
				$hide.addClass("ui-tabs-hide");
				self.element.dequeue("tabs");
			};

				// attach tab event handler, unbind to avoid duplicates from former tabifying...
				this.anchors.bind(o.event + ".tabs", function ()
				{
					var el = this,
				$li = $(el).closest("li"),
				$hide = self.panels.filter(":not(.ui-tabs-hide)"),
				$show = self.element.find(self._sanitizeSelector(el.hash));

					// If tab is already selected and not collapsible or tab disabled or
					// or is already loading or click callback returns false stop here.
					// Check if click handler returns false last so that it is not executed
					// for a disabled or loading tab!
					if (($li.hasClass("ui-tabs-selected") && !o.collapsible) ||
				$li.hasClass("ui-state-disabled") ||
				$li.hasClass("ui-state-processing") ||
				self.panels.filter(":animated").length ||
				self._trigger("select", null, self._ui(this, $show[0])) === false)
					{
						this.blur();
						return false;
					}

					o.selected = self.anchors.index(this);

					self.abort();

					// if tab may be closed
					if (o.collapsible)
					{
						if ($li.hasClass("ui-tabs-selected"))
						{
							o.selected = -1;

							if (o.cookie)
							{
								self._cookie(o.selected, o.cookie);
							}

							self.element.queue("tabs", function ()
							{
								hideTab(el, $hide);
							}).dequeue("tabs");

							this.blur();
							return false;
						} else if (!$hide.length)
						{
							if (o.cookie)
							{
								self._cookie(o.selected, o.cookie);
							}

							self.element.queue("tabs", function ()
							{
								showTab(el, $show);
							});

							// TODO make passing in node possible, see also http://dev.jqueryui.com/ticket/3171
							self.load(self.anchors.index(this));

							this.blur();
							return false;
						}
					}

					if (o.cookie)
					{
						self._cookie(o.selected, o.cookie);
					}

					// show new tab
					if ($show.length)
					{
						if ($hide.length)
						{
							self.element.queue("tabs", function ()
							{
								hideTab(el, $hide);
							});
						}
						self.element.queue("tabs", function ()
						{
							showTab(el, $show);
						});

						self.load(self.anchors.index(this));
					} else
					{
						throw "jQuery UI Tabs: Mismatching fragment identifier.";
					}

					// Prevent IE from keeping other link focussed when using the back button
					// and remove dotted border from clicked link. This is controlled via CSS
					// in modern browsers; blur() removes focus from address bar in Firefox
					// which can become a usability and annoying problem with tabs('rotate').
					if ($.browser.msie)
					{
						this.blur();
					}
				});

				// disable click in any case
				this.anchors.bind("click.tabs", function ()
				{
					return false;
				});
			},

			_getIndex: function (index)
			{
				// meta-function to give users option to provide a href string instead of a numerical index.
				// also sanitizes numerical indexes to valid values.
				if (typeof index == "string")
				{
					index = this.anchors.index(this.anchors.filter("[href$=" + index + "]"));
				}

				return index;
			},

			destroy: function ()
			{
				var o = this.options;

				this.abort();

				this.element
			.unbind(".tabs")
			.removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible")
			.removeData("tabs");

				this.list.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");

				this.anchors.each(function ()
				{
					var href = $.data(this, "href.tabs");
					if (href)
					{
						this.href = href;
					}
					var $this = $(this).unbind(".tabs");
					$.each(["href", "load", "cache"], function (i, prefix)
					{
						$this.removeData(prefix + ".tabs");
					});
				});

				this.lis.unbind(".tabs").add(this.panels).each(function ()
				{
					if ($.data(this, "destroy.tabs"))
					{
						$(this).remove();
					} else
					{
						$(this).removeClass([
					"ui-state-default",
					"ui-corner-top",
					"ui-tabs-selected",
					"ui-state-active",
					"ui-state-hover",
					"ui-state-focus",
					"ui-state-disabled",
					"ui-tabs-panel",
					"ui-widget-content",
					"ui-corner-bottom",
					"ui-tabs-hide"
				].join(" "));
					}
				});

				if (o.cookie)
				{
					this._cookie(null, o.cookie);
				}

				return this;
			},

			add: function (url, label, index)
			{
				if (index === undefined)
				{
					index = this.anchors.length;
				}

				var self = this,
			o = this.options,
			$li = $(o.tabTemplate.replace(/#\{href\}/g, url).replace(/#\{label\}/g, label)),
			id = !url.indexOf("#") ? url.replace("#", "") : this._tabId($("a", $li)[0]);

				$li.addClass("ui-state-default ui-corner-top").data("destroy.tabs", true);

				// try to find an existing element before creating a new one
				var $panel = self.element.find("#" + id);
				if (!$panel.length)
				{
					$panel = $(o.panelTemplate)
				.attr("id", id)
				.data("destroy.tabs", true);
				}
				$panel.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide");

				if (index >= this.lis.length)
				{
					$li.appendTo(this.list);
					$panel.appendTo(this.list[0].parentNode);
				} else
				{
					$li.insertBefore(this.lis[index]);
					$panel.insertBefore(this.panels[index]);
				}

				o.disabled = $.map(o.disabled, function (n, i)
				{
					return n >= index ? ++n : n;
				});

				this._tabify();

				if (this.anchors.length == 1)
				{
					o.selected = 0;
					$li.addClass("ui-tabs-selected ui-state-active");
					$panel.removeClass("ui-tabs-hide");
					this.element.queue("tabs", function ()
					{
						self._trigger("show", null, self._ui(self.anchors[0], self.panels[0]));
					});

					this.load(0);
				}

				this._trigger("add", null, this._ui(this.anchors[index], this.panels[index]));
				return this;
			},

			remove: function (index)
			{
				index = this._getIndex(index);
				var o = this.options,
			$li = this.lis.eq(index).remove(),
			$panel = this.panels.eq(index).remove();

				// If selected tab was removed focus tab to the right or
				// in case the last tab was removed the tab to the left.
				if ($li.hasClass("ui-tabs-selected") && this.anchors.length > 1)
				{
					this.select(index + (index + 1 < this.anchors.length ? 1 : -1));
				}

				o.disabled = $.map(
			$.grep(o.disabled, function (n, i)
			{
				return n != index;
			}),
			function (n, i)
			{
				return n >= index ? --n : n;
			});

				this._tabify();

				this._trigger("remove", null, this._ui($li.find("a")[0], $panel[0]));
				return this;
			},

			enable: function (index)
			{
				index = this._getIndex(index);
				var o = this.options;
				if ($.inArray(index, o.disabled) == -1)
				{
					return;
				}

				this.lis.eq(index).removeClass("ui-state-disabled");
				o.disabled = $.grep(o.disabled, function (n, i)
				{
					return n != index;
				});

				this._trigger("enable", null, this._ui(this.anchors[index], this.panels[index]));
				return this;
			},

			disable: function (index)
			{
				index = this._getIndex(index);
				var self = this, o = this.options;
				// cannot disable already selected tab
				if (index != o.selected)
				{
					this.lis.eq(index).addClass("ui-state-disabled");

					o.disabled.push(index);
					o.disabled.sort();

					this._trigger("disable", null, this._ui(this.anchors[index], this.panels[index]));
				}

				return this;
			},

			select: function (index)
			{
				index = this._getIndex(index);
				if (index == -1)
				{
					if (this.options.collapsible && this.options.selected != -1)
					{
						index = this.options.selected;
					} else
					{
						return this;
					}
				}
				this.anchors.eq(index).trigger(this.options.event + ".tabs");
				return this;
			},

			load: function (index)
			{
				index = this._getIndex(index);
				var self = this,
			o = this.options,
			a = this.anchors.eq(index)[0],
			url = $.data(a, "load.tabs");

				this.abort();

				// not remote or from cache
				if (!url || this.element.queue("tabs").length !== 0 && $.data(a, "cache.tabs"))
				{
					this.element.dequeue("tabs");
					return;
				}

				// load remote from here on
				this.lis.eq(index).addClass("ui-state-processing");

				if (o.spinner)
				{
					var span = $("span", a);
					span.data("label.tabs", span.html()).html(o.spinner);
				}

				this.xhr = $.ajax($.extend({}, o.ajaxOptions, {
					url: url,
					success: function (r, s)
					{
						self.element.find(self._sanitizeSelector(a.hash)).html(r);

						// take care of tab labels
						self._cleanup();

						if (o.cache)
						{
							$.data(a, "cache.tabs", true);
						}

						self._trigger("load", null, self._ui(self.anchors[index], self.panels[index]));
						try
						{
							o.ajaxOptions.success(r, s);
						}
						catch (e) { }
					},
					error: function (xhr, s, e)
					{
						// take care of tab labels
						self._cleanup();

						self._trigger("load", null, self._ui(self.anchors[index], self.panels[index]));
						try
						{
							// Passing index avoid a race condition when this method is
							// called after the user has selected another tab.
							// Pass the anchor that initiated this request allows
							// loadError to manipulate the tab content panel via $(a.hash)
							o.ajaxOptions.error(xhr, s, index, a);
						}
						catch (e) { }
					}
				}));

				// last, so that load event is fired before show...
				self.element.dequeue("tabs");

				return this;
			},

			abort: function ()
			{
				// stop possibly running animations
				this.element.queue([]);
				this.panels.stop(false, true);

				// "tabs" queue must not contain more than two elements,
				// which are the callbacks for the latest clicked tab...
				this.element.queue("tabs", this.element.queue("tabs").splice(-2, 2));

				// terminate pending requests from other tabs
				if (this.xhr)
				{
					this.xhr.abort();
					delete this.xhr;
				}

				// take care of tab labels
				this._cleanup();
				return this;
			},

			url: function (index, url)
			{
				this.anchors.eq(index).removeData("cache.tabs").data("load.tabs", url);
				return this;
			},

			length: function ()
			{
				return this.anchors.length;
			}
		});

		$.extend($.ui.tabs, {
			version: "@VERSION"
		});

		/*
		* Tabs Extensions
		*/

		/*
		* Rotate
		*/
		$.extend($.ui.tabs.prototype, {
			rotation: null,
			rotate: function (ms, continuing)
			{
				var self = this,
			o = this.options;

				var rotate = self._rotate || (self._rotate = function (e)
				{
					clearTimeout(self.rotation);
					self.rotation = setTimeout(function ()
					{
						var t = o.selected;
						self.select(++t < self.anchors.length ? t : 0);
					}, ms);

					if (e)
					{
						e.stopPropagation();
					}
				});

				var stop = self._unrotate || (self._unrotate = !continuing
			? function (e)
			{
				if (e.clientX)
				{ // in case of a true click
					self.rotate(null);
				}
			}
			: function (e)
			{
				t = o.selected;
				rotate();
			});

				// start rotation
				if (ms)
				{
					this.element.bind("tabsshow", rotate);
					this.anchors.bind(o.event + ".tabs", stop);
					rotate();
					// stop rotation
				} else
				{
					clearTimeout(self.rotation);
					this.element.unbind("tabsshow", rotate);
					this.anchors.unbind(o.event + ".tabs", stop);
					delete this._rotate;
					delete this._unrotate;
				}

				return this;
			}
		});

	})($j);

	/*
	* jQuery UI Button @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Button
	*
	* Depends:
	*	jquery.ui.core.js
	*	jquery.ui.widget.js
	*/
	(function ($, undefined)
	{

		var lastActive,
	baseClasses = "ui-button ui-widget ui-state-default ui-corner-all",
	stateClasses = "ui-state-hover ui-state-active ",
	typeClasses = "ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only",
	formResetHandler = function (event)
	{
		$(":ui-button", event.target.form).each(function ()
		{
			var inst = $(this).data("button");
			setTimeout(function ()
			{
				inst.refresh();
			}, 1);
		});
	},
	radioGroup = function (radio)
	{
		var name = radio.name,
			form = radio.form,
			radios = $([]);
		if (name)
		{
			if (form)
			{
				radios = $(form).find("[name='" + name + "']");
			} else
			{
				radios = $("[name='" + name + "']", radio.ownerDocument)
					.filter(function ()
					{
						return !this.form;
					});
			}
		}
		return radios;
	};

		$.widget("ui.button", {
			options: {
				disabled: null,
				text: true,
				label: null,
				icons: {
					primary: null,
					secondary: null
				}
			},
			_create: function ()
			{
				this.element.closest("form")
			.unbind("reset.button")
			.bind("reset.button", formResetHandler);

				if (typeof this.options.disabled !== "boolean")
				{
					this.options.disabled = this.element.attr("disabled");
				}

				this._determineButtonType();
				this.hasTitle = !!this.buttonElement.attr("title");

				var self = this,
			options = this.options,
			toggleButton = this.type === "checkbox" || this.type === "radio",
			hoverClass = "ui-state-hover" + (!toggleButton ? " ui-state-active" : ""),
			focusClass = "ui-state-focus";

				if (options.label === null)
				{
					options.label = this.buttonElement.html();
				}

				if (this.element.is(":disabled"))
				{
					options.disabled = true;
				}

				this.buttonElement
			.addClass(baseClasses)
			.attr("role", "button")
			.bind("mouseenter.button", function ()
			{
				if (options.disabled)
				{
					return;
				}
				$(this).addClass("ui-state-hover");
				if (this === lastActive)
				{
					$(this).addClass("ui-state-active");
				}
			})
			.bind("mouseleave.button", function ()
			{
				if (options.disabled)
				{
					return;
				}
				$(this).removeClass(hoverClass);
			})
			.bind("focus.button", function ()
			{
				// no need to check disabled, focus won't be triggered anyway
				$(this).addClass(focusClass);
			})
			.bind("blur.button", function ()
			{
				$(this).removeClass(focusClass);
			});

				if (toggleButton)
				{
					this.element.bind("change.button", function ()
					{
						self.refresh();
					});
				}

				if (this.type === "checkbox")
				{
					this.buttonElement.bind("click.button", function ()
					{
						if (options.disabled)
						{
							return false;
						}
						$(this).toggleClass("ui-state-active");
						self.buttonElement.attr("aria-pressed", self.element[0].checked);
					});
				} else if (this.type === "radio")
				{
					this.buttonElement.bind("click.button", function ()
					{
						if (options.disabled)
						{
							return false;
						}
						$(this).addClass("ui-state-active");
						self.buttonElement.attr("aria-pressed", true);

						var radio = self.element[0];
						radioGroup(radio)
					.not(radio)
					.map(function ()
					{
						return $(this).button("widget")[0];
					})
					.removeClass("ui-state-active")
					.attr("aria-pressed", false);
					});
				} else
				{
					this.buttonElement
				.bind("mousedown.button", function ()
				{
					if (options.disabled)
					{
						return false;
					}
					$(this).addClass("ui-state-active");
					lastActive = this;
					$(document).one("mouseup", function ()
					{
						lastActive = null;
					});
				})
				.bind("mouseup.button", function ()
				{
					if (options.disabled)
					{
						return false;
					}
					$(this).removeClass("ui-state-active");
				})
				.bind("keydown.button", function (event)
				{
					if (options.disabled)
					{
						return false;
					}
					if (event.keyCode == $.ui.keyCode.SPACE || event.keyCode == $.ui.keyCode.ENTER)
					{
						$(this).addClass("ui-state-active");
					}
				})
				.bind("keyup.button", function ()
				{
					$(this).removeClass("ui-state-active");
				});

					if (this.buttonElement.is("a"))
					{
						this.buttonElement.keyup(function (event)
						{
							if (event.keyCode === $.ui.keyCode.SPACE)
							{
								// TODO pass through original event correctly (just as 2nd argument doesn't work)
								$(this).click();
							}
						});
					}
				}

				// TODO: pull out $.Widget's handling for the disabled option into
				// $.Widget.prototype._setOptionDisabled so it's easy to proxy and can
				// be overridden by individual plugins
				this._setOption("disabled", options.disabled);
			},

			_determineButtonType: function ()
			{

				if (this.element.is(":checkbox"))
				{
					this.type = "checkbox";
				} else
				{
					if (this.element.is(":radio"))
					{
						this.type = "radio";
					} else
					{
						if (this.element.is("input"))
						{
							this.type = "input";
						} else
						{
							this.type = "button";
						}
					}
				}

				if (this.type === "checkbox" || this.type === "radio")
				{
					// we don't search against the document in case the element
					// is disconnected from the DOM
					this.buttonElement = this.element.parents().last()
				.find("label[for=" + this.element.attr("id") + "]");
					this.element.addClass("ui-helper-hidden-accessible");

					var checked = this.element.is(":checked");
					if (checked)
					{
						this.buttonElement.addClass("ui-state-active");
					}
					this.buttonElement.attr("aria-pressed", checked);
				} else
				{
					this.buttonElement = this.element;
				}
			},

			widget: function ()
			{
				return this.buttonElement;
			},

			destroy: function ()
			{
				this.element
			.removeClass("ui-helper-hidden-accessible");
				this.buttonElement
			.removeClass(baseClasses + " " + stateClasses + " " + typeClasses)
			.removeAttr("role")
			.removeAttr("aria-pressed")
			.html(this.buttonElement.find(".ui-button-text").html());

				if (!this.hasTitle)
				{
					this.buttonElement.removeAttr("title");
				}

				$.Widget.prototype.destroy.call(this);
			},

			_setOption: function (key, value)
			{
				$.Widget.prototype._setOption.apply(this, arguments);
				if (key === "disabled")
				{
					if (value)
					{
						this.element.attr("disabled", true);
					} else
					{
						this.element.removeAttr("disabled");
					}
				}
				this._resetButton();
			},

			refresh: function ()
			{
				var isDisabled = this.element.is(":disabled");
				if (isDisabled !== this.options.disabled)
				{
					this._setOption("disabled", isDisabled);
				}
				if (this.type === "radio")
				{
					radioGroup(this.element[0]).each(function ()
					{
						if ($(this).is(":checked"))
						{
							$(this).button("widget")
						.addClass("ui-state-active")
						.attr("aria-pressed", true);
						} else
						{
							$(this).button("widget")
						.removeClass("ui-state-active")
						.attr("aria-pressed", false);
						}
					});
				} else if (this.type === "checkbox")
				{
					if (this.element.is(":checked"))
					{
						this.buttonElement
					.addClass("ui-state-active")
					.attr("aria-pressed", true);
					} else
					{
						this.buttonElement
					.removeClass("ui-state-active")
					.attr("aria-pressed", false);
					}
				}
			},

			_resetButton: function ()
			{
				if (this.type === "input")
				{
					if (this.options.label)
					{
						this.element.val(this.options.label);
					}
					return;
				}
				var buttonElement = this.buttonElement.removeClass(typeClasses),
			buttonText = $("<span></span>")
				.addClass("ui-button-text")
				.html(this.options.label)
				.appendTo(buttonElement.empty())
				.text(),
			icons = this.options.icons,
			multipleIcons = icons.primary && icons.secondary,
			buttonClasses = [];

				if (icons.primary || icons.secondary)
				{
					buttonClasses.push("ui-button-text-icon" + (multipleIcons ? "s" : (icons.primary ? "-primary" : "-secondary")));

					if (icons.primary)
					{
						buttonElement.prepend("<span class='ui-button-icon-primary ui-icon " + icons.primary + "'></span>");
					}

					if (icons.secondary)
					{
						buttonElement.append("<span class='ui-button-icon-secondary ui-icon " + icons.secondary + "'></span>");
					}

					if (!this.options.text)
					{
						buttonClasses.push(multipleIcons ? "ui-button-icons-only" : "ui-button-icon-only");
						buttonElement.removeClass("ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary");

						if (!this.hasTitle)
						{
							buttonElement.attr("title", buttonText);
						}
					}
				} else
				{
					buttonClasses.push("ui-button-text-only");
				}
				buttonElement.addClass(buttonClasses.join(" "));
			}
		});

		$.widget("ui.buttonset", {
			options: {
				items: ":button, :submit, :reset, :checkbox, :radio, a, :data(button)"
			},

			_create: function ()
			{
				this.element.addClass("ui-buttonset");
			},

			_init: function ()
			{
				this.refresh();
			},

			_setOption: function (key, value)
			{
				if (key === "disabled")
				{
					this.buttons.button("option", key, value);
				}

				$.Widget.prototype._setOption.apply(this, arguments);
			},

			refresh: function ()
			{
				this.buttons = this.element.find(this.options.items)
			.filter(":ui-button")
				.button("refresh")
			.end()
			.not(":ui-button")
				.button()
			.end()
			.map(function ()
			{
				return $(this).button("widget")[0];
			})
				.removeClass("ui-corner-all ui-corner-left ui-corner-right")
				.filter(":first")
					.addClass("ui-corner-left")
				.end()
				.filter(":last")
					.addClass("ui-corner-right")
				.end()
			.end();
			},

			destroy: function ()
			{
				this.element.removeClass("ui-buttonset");
				this.buttons
			.map(function ()
			{
				return $(this).button("widget")[0];
			})
				.removeClass("ui-corner-left ui-corner-right")
			.end()
			.button("destroy");

				$.Widget.prototype.destroy.call(this);
			}
		});

	} ($j));

	/*
	* jQuery UI Effects @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Effects/
	*/
	$j.effects || (function ($, undefined)
	{

		$.effects = {};



		/******************************************************************************/
		/****************************** COLOR ANIMATIONS ******************************/
		/******************************************************************************/

		// override the animation for color styles
		$.each(['backgroundColor', 'borderBottomColor', 'borderLeftColor',
	'borderRightColor', 'borderTopColor', 'borderColor', 'color', 'outlineColor'],
function (i, attr)
{
	$.fx.step[attr] = function (fx)
	{
		if (!fx.colorInit)
		{
			fx.start = getColor(fx.elem, attr);
			fx.end = getRGB(fx.end);
			fx.colorInit = true;
		}

		fx.elem.style[attr] = 'rgb(' +
			Math.max(Math.min(parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0], 10), 255), 0) + ',' +
			Math.max(Math.min(parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1], 10), 255), 0) + ',' +
			Math.max(Math.min(parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2], 10), 255), 0) + ')';
	};
});

		// Color Conversion functions from highlightFade
		// By Blair Mitchelmore
		// http://jquery.offput.ca/highlightFade/

		// Parse strings looking for color tuples [255,255,255]
		function getRGB(color)
		{
			var result;

			// Check if we're already dealing with an array of colors
			if (color && color.constructor == Array && color.length == 3)
				return color;

			// Look for rgb(num,num,num)
			if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
				return [parseInt(result[1], 10), parseInt(result[2], 10), parseInt(result[3], 10)];

			// Look for rgb(num%,num%,num%)
			if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
				return [parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55];

			// Look for #a0b1c2
			if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
				return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];

			// Look for #fff
			if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
				return [parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16)];

			// Look for rgba(0, 0, 0, 0) == transparent in Safari 3
			if (result = /rgba\(0, 0, 0, 0\)/.exec(color))
				return colors['transparent'];

			// Otherwise, we're most likely dealing with a named color
			return colors[$.trim(color).toLowerCase()];
		}

		function getColor(elem, attr)
		{
			var color;

			do
			{
				color = $.curCSS(elem, attr);

				// Keep going until we find an element that has color, or we hit the body
				if (color != '' && color != 'transparent' || $.nodeName(elem, "body"))
					break;

				attr = "backgroundColor";
			} while (elem = elem.parentNode);

			return getRGB(color);
		};

		// Some named colors to work with
		// From Interface by Stefan Petre
		// http://interface.eyecon.ro/

		var colors = {
			aqua: [0, 255, 255],
			azure: [240, 255, 255],
			beige: [245, 245, 220],
			black: [0, 0, 0],
			blue: [0, 0, 255],
			brown: [165, 42, 42],
			cyan: [0, 255, 255],
			darkblue: [0, 0, 139],
			darkcyan: [0, 139, 139],
			darkgrey: [169, 169, 169],
			darkgreen: [0, 100, 0],
			darkkhaki: [189, 183, 107],
			darkmagenta: [139, 0, 139],
			darkolivegreen: [85, 107, 47],
			darkorange: [255, 140, 0],
			darkorchid: [153, 50, 204],
			darkred: [139, 0, 0],
			darksalmon: [233, 150, 122],
			darkviolet: [148, 0, 211],
			fuchsia: [255, 0, 255],
			gold: [255, 215, 0],
			green: [0, 128, 0],
			indigo: [75, 0, 130],
			khaki: [240, 230, 140],
			lightblue: [173, 216, 230],
			lightcyan: [224, 255, 255],
			lightgreen: [144, 238, 144],
			lightgrey: [211, 211, 211],
			lightpink: [255, 182, 193],
			lightyellow: [255, 255, 224],
			lime: [0, 255, 0],
			magenta: [255, 0, 255],
			maroon: [128, 0, 0],
			navy: [0, 0, 128],
			olive: [128, 128, 0],
			orange: [255, 165, 0],
			pink: [255, 192, 203],
			purple: [128, 0, 128],
			violet: [128, 0, 128],
			red: [255, 0, 0],
			silver: [192, 192, 192],
			white: [255, 255, 255],
			yellow: [255, 255, 0],
			transparent: [255, 255, 255]
		};



		/******************************************************************************/
		/****************************** CLASS ANIMATIONS ******************************/
		/******************************************************************************/

		var classAnimationActions = ['add', 'remove', 'toggle'],
	shorthandStyles = {
		border: 1,
		borderBottom: 1,
		borderColor: 1,
		borderLeft: 1,
		borderRight: 1,
		borderTop: 1,
		borderWidth: 1,
		margin: 1,
		padding: 1
	};

		function getElementStyles()
		{
			var style = document.defaultView
			? document.defaultView.getComputedStyle(this, null)
			: this.currentStyle,
		newStyle = {},
		key,
		camelCase;

			// webkit enumerates style porperties
			if (style && style.length && style[0] && style[style[0]])
			{
				var len = style.length;
				while (len--)
				{
					key = style[len];
					if (typeof style[key] == 'string')
					{
						camelCase = key.replace(/\-(\w)/g, function (all, letter)
						{
							return letter.toUpperCase();
						});
						newStyle[camelCase] = style[key];
					}
				}
			} else
			{
				for (key in style)
				{
					if (typeof style[key] === 'string')
					{
						newStyle[key] = style[key];
					}
				}
			}

			return newStyle;
		}

		function filterStyles(styles)
		{
			var name, value;
			for (name in styles)
			{
				value = styles[name];
				if (
				// ignore null and undefined values
			value == null ||
				// ignore functions (when does this occur?)
			$.isFunction(value) ||
				// shorthand styles that need to be expanded
			name in shorthandStyles ||
				// ignore scrollbars (break in IE)
			(/scrollbar/).test(name) ||

				// only colors or values that can be converted to numbers
			(!(/color/i).test(name) && isNaN(parseFloat(value)))
		)
				{
					delete styles[name];
				}
			}

			return styles;
		}

		function styleDifference(oldStyle, newStyle)
		{
			var diff = { _: 0 }, // http://dev.jquery.com/ticket/5459
		name;

			for (name in newStyle)
			{
				if (oldStyle[name] != newStyle[name])
				{
					diff[name] = newStyle[name];
				}
			}

			return diff;
		}

		$.effects.animateClass = function (value, duration, easing, callback)
		{
			if ($.isFunction(easing))
			{
				callback = easing;
				easing = null;
			}

			return this.queue('fx', function ()
			{
				var that = $(this),
			originalStyleAttr = that.attr('style') || ' ',
			originalStyle = filterStyles(getElementStyles.call(this)),
			newStyle,
			className = that.attr('className');

				$.each(classAnimationActions, function (i, action)
				{
					if (value[action])
					{
						that[action + 'Class'](value[action]);
					}
				});
				newStyle = filterStyles(getElementStyles.call(this));
				that.attr('className', className);

				that.animate(styleDifference(originalStyle, newStyle), duration, easing, function ()
				{
					$.each(classAnimationActions, function (i, action)
					{
						if (value[action]) { that[action + 'Class'](value[action]); }
					});
					// work around bug in IE by clearing the cssText before setting it
					if (typeof that.attr('style') == 'object')
					{
						that.attr('style').cssText = '';
						that.attr('style').cssText = originalStyleAttr;
					} else
					{
						that.attr('style', originalStyleAttr);
					}
					if (callback) { callback.apply(this, arguments); }
				});

				// $.animate adds a function to the end of the queue
				// but we want it at the front
				var queue = $.queue(this),
			anim = queue.splice(queue.length - 1, 1)[0];
				queue.splice(1, 0, anim);
				$.dequeue(this);
			});
		};

		$.fn.extend({
			_addClass: $.fn.addClass,
			addClass: function (classNames, speed, easing, callback)
			{
				return speed ? $.effects.animateClass.apply(this, [{ add: classNames }, speed, easing, callback]) : this._addClass(classNames);
			},

			_removeClass: $.fn.removeClass,
			removeClass: function (classNames, speed, easing, callback)
			{
				return speed ? $.effects.animateClass.apply(this, [{ remove: classNames }, speed, easing, callback]) : this._removeClass(classNames);
			},

			_toggleClass: $.fn.toggleClass,
			toggleClass: function (classNames, force, speed, easing, callback)
			{
				if (typeof force == "boolean" || force === undefined)
				{
					if (!speed)
					{
						// without speed parameter;
						return this._toggleClass(classNames, force);
					} else
					{
						return $.effects.animateClass.apply(this, [(force ? { add: classNames} : { remove: classNames }), speed, easing, callback]);
					}
				} else
				{
					// without switch parameter;
					return $.effects.animateClass.apply(this, [{ toggle: classNames }, force, speed, easing]);
				}
			},

			switchClass: function (remove, add, speed, easing, callback)
			{
				return $.effects.animateClass.apply(this, [{ add: add, remove: remove }, speed, easing, callback]);
			}
		});



		/******************************************************************************/
		/*********************************** EFFECTS **********************************/
		/******************************************************************************/

		$.extend($.effects, {
			version: "@VERSION",

			// Saves a set of properties in a data storage
			save: function (element, set)
			{
				for (var i = 0; i < set.length; i++)
				{
					if (set[i] !== null) element.data("ec.storage." + set[i], element[0].style[set[i]]);
				}
			},

			// Restores a set of previously saved properties from a data storage
			restore: function (element, set)
			{
				for (var i = 0; i < set.length; i++)
				{
					if (set[i] !== null) element.css(set[i], element.data("ec.storage." + set[i]));
				}
			},

			setMode: function (el, mode)
			{
				if (mode == 'toggle') mode = el.is(':hidden') ? 'show' : 'hide'; // Set for toggle
				return mode;
			},

			getBaseline: function (origin, original)
			{ // Translates a [top,left] array into a baseline value
				// this should be a little more flexible in the future to handle a string & hash
				var y, x;
				switch (origin[0])
				{
					case 'top': y = 0; break;
					case 'middle': y = 0.5; break;
					case 'bottom': y = 1; break;
					default: y = origin[0] / original.height;
				};
				switch (origin[1])
				{
					case 'left': x = 0; break;
					case 'center': x = 0.5; break;
					case 'right': x = 1; break;
					default: x = origin[1] / original.width;
				};
				return { x: x, y: y };
			},

			// Wraps the element around a wrapper that copies position properties
			createWrapper: function (element)
			{

				// if the element is already wrapped, return it
				if (element.parent().is('.ui-effects-wrapper'))
				{
					return element.parent();
				}

				// wrap the element
				var props = {
					width: element.outerWidth(true),
					height: element.outerHeight(true),
					'float': element.css('float')
				},
			wrapper = $('<div></div>')
				.addClass('ui-effects-wrapper')
				.css({
					fontSize: '100%',
					background: 'transparent',
					border: 'none',
					margin: 0,
					padding: 0
				});

				element.wrap(wrapper);
				wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually loose the reference to the wrapped element

				// transfer positioning properties to the wrapper
				if (element.css('position') == 'static')
				{
					wrapper.css({ position: 'relative' });
					element.css({ position: 'relative' });
				} else
				{
					$.extend(props, {
						position: element.css('position'),
						zIndex: element.css('z-index')
					});
					$.each(['top', 'left', 'bottom', 'right'], function (i, pos)
					{
						props[pos] = element.css(pos);
						if (isNaN(parseInt(props[pos], 10)))
						{
							props[pos] = 'auto';
						}
					});
					element.css({ position: 'relative', top: 0, left: 0, right: 'auto', bottom: 'auto' });
				}

				return wrapper.css(props).show();
			},

			removeWrapper: function (element)
			{
				if (element.parent().is('.ui-effects-wrapper'))
					return element.parent().replaceWith(element);
				return element;
			},

			setTransition: function (element, list, factor, value)
			{
				value = value || {};
				$.each(list, function (i, x)
				{
					unit = element.cssUnit(x);
					if (unit[0] > 0) value[x] = unit[0] * factor + unit[1];
				});
				return value;
			}
		});


		function _normalizeArguments(effect, options, speed, callback)
		{
			// shift params for method overloading
			if (typeof effect == 'object')
			{
				callback = options;
				speed = null;
				options = effect;
				effect = options.effect;
			}
			if ($.isFunction(options))
			{
				callback = options;
				speed = null;
				options = {};
			}
			if (typeof options == 'number' || $.fx.speeds[options])
			{
				callback = speed;
				speed = options;
				options = {};
			}
			if ($.isFunction(speed))
			{
				callback = speed;
				speed = null;
			}

			options = options || {};

			speed = speed || options.duration;
			speed = $.fx.off ? 0 : typeof speed == 'number'
		? speed : speed in $.fx.speeds ? $.fx.speeds[speed] : $.fx.speeds._default;

			callback = callback || options.complete;

			return [effect, options, speed, callback];
		}

		function standardSpeed(speed)
		{
			// valid standard speeds
			if (!speed || typeof speed === "number" || $.fx.speeds[speed])
			{
				return true;
			}

			// invalid strings - treat as "normal" speed
			if (typeof speed === "string" && !$.effects[speed])
			{
				return true;
			}

			return false;
		}

		$.fn.extend({
			effect: function (effect, options, speed, callback)
			{
				var args = _normalizeArguments.apply(this, arguments),
				// TODO: make effects take actual parameters instead of a hash
			args2 = {
				options: args[1],
				duration: args[2],
				callback: args[3]
			},
			mode = args2.options.mode,
			effectMethod = $.effects[effect];

				if ($.fx.off || !effectMethod)
				{
					// delegate to the original method (e.g., .show()) if possible
					if (mode)
					{
						return this[mode](args2.duration, args2.callback);
					} else
					{
						return this.each(function ()
						{
							if (args2.callback)
							{
								args2.callback.call(this);
							}
						});
					}
				}

				return effectMethod.call(this, args2);
			},

			_show: $.fn.show,
			show: function (speed)
			{
				if (standardSpeed(speed))
				{
					return this._show.apply(this, arguments);
				} else
				{
					var args = _normalizeArguments.apply(this, arguments);
					args[1].mode = 'show';
					return this.effect.apply(this, args);
				}
			},

			_hide: $.fn.hide,
			hide: function (speed)
			{
				if (standardSpeed(speed))
				{
					return this._hide.apply(this, arguments);
				} else
				{
					var args = _normalizeArguments.apply(this, arguments);
					args[1].mode = 'hide';
					return this.effect.apply(this, args);
				}
			},

			// jQuery core overloads toggle and creates _toggle
			__toggle: $.fn.toggle,
			toggle: function (speed)
			{
				if (standardSpeed(speed) || typeof speed === "boolean" || $.isFunction(speed))
				{
					return this.__toggle.apply(this, arguments);
				} else
				{
					var args = _normalizeArguments.apply(this, arguments);
					args[1].mode = 'toggle';
					return this.effect.apply(this, args);
				}
			},

			// helper functions
			cssUnit: function (key)
			{
				var style = this.css(key), val = [];
				$.each(['em', 'px', '%', 'pt'], function (i, unit)
				{
					if (style.indexOf(unit) > 0)
						val = [parseFloat(style), unit];
				});
				return val;
			}
		});



		/******************************************************************************/
		/*********************************** EASING ***********************************/
		/******************************************************************************/

		/*
		* jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
		*
		* Uses the built in easing capabilities added In jQuery 1.1
		* to offer multiple easing options
		*
		* TERMS OF USE - jQuery Easing
		*
		* Open source under the BSD License.
		*
		* Copyright 2008 George McGinley Smith
		* All rights reserved.
		*
		* Redistribution and use in source and binary forms, with or without modification,
		* are permitted provided that the following conditions are met:
		*
		* Redistributions of source code must retain the above copyright notice, this list of
		* conditions and the following disclaimer.
		* Redistributions in binary form must reproduce the above copyright notice, this list
		* of conditions and the following disclaimer in the documentation and/or other materials
		* provided with the distribution.
		*
		* Neither the name of the author nor the names of contributors may be used to endorse
		* or promote products derived from this software without specific prior written permission.
		*
		* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
		* EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
		* MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
		* COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
		* EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
		* GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
		* AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
		* NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
		* OF THE POSSIBILITY OF SUCH DAMAGE.
		*
		*/

		// t: current time, b: begInnIng value, c: change In value, d: duration
		$.easing.jswing = $.easing.swing;

		$.extend($.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d)
	{
		//alert($.easing.default);
		return $.easing[$.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d)
	{
		return c * (t /= d) * t + b;
	},
	easeOutQuad: function (x, t, b, c, d)
	{
		return -c * (t /= d) * (t - 2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d)
	{
		if ((t /= d / 2) < 1) return c / 2 * t * t + b;
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d)
	{
		return c * (t /= d) * t * t + b;
	},
	easeOutCubic: function (x, t, b, c, d)
	{
		return c * ((t = t / d - 1) * t * t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d)
	{
		if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
		return c / 2 * ((t -= 2) * t * t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d)
	{
		return c * (t /= d) * t * t * t + b;
	},
	easeOutQuart: function (x, t, b, c, d)
	{
		return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d)
	{
		if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
		return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d)
	{
		return c * (t /= d) * t * t * t * t + b;
	},
	easeOutQuint: function (x, t, b, c, d)
	{
		return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d)
	{
		if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
		return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d)
	{
		return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d)
	{
		return c * Math.sin(t / d * (Math.PI / 2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d)
	{
		return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d)
	{
		return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d)
	{
		return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d)
	{
		if (t == 0) return b;
		if (t == d) return b + c;
		if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
		return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d)
	{
		return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d)
	{
		return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d)
	{
		if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
		return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d)
	{
		var s = 1.70158; var p = 0; var a = c;
		if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
		if (a < Math.abs(c)) { a = c; var s = p / 4; }
		else var s = p / (2 * Math.PI) * Math.asin(c / a);
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	},
	easeOutElastic: function (x, t, b, c, d)
	{
		var s = 1.70158; var p = 0; var a = c;
		if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
		if (a < Math.abs(c)) { a = c; var s = p / 4; }
		else var s = p / (2 * Math.PI) * Math.asin(c / a);
		return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d)
	{
		var s = 1.70158; var p = 0; var a = c;
		if (t == 0) return b; if ((t /= d / 2) == 2) return b + c; if (!p) p = d * (.3 * 1.5);
		if (a < Math.abs(c)) { a = c; var s = p / 4; }
		else var s = p / (2 * Math.PI) * Math.asin(c / a);
		if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s)
	{
		if (s == undefined) s = 1.70158;
		return c * (t /= d) * t * ((s + 1) * t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s)
	{
		if (s == undefined) s = 1.70158;
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s)
	{
		if (s == undefined) s = 1.70158;
		if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
		return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d)
	{
		return c - $.easing.easeOutBounce(x, d - t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d)
	{
		if ((t /= d) < (1 / 2.75))
		{
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75))
		{
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
		} else if (t < (2.5 / 2.75))
		{
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
		} else
		{
			return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d)
	{
		if (t < d / 2) return $.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
		return $.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
	}
});

		/*
		*
		* TERMS OF USE - EASING EQUATIONS
		*
		* Open source under the BSD License.
		*
		* Copyright 2001 Robert Penner
		* All rights reserved.
		*
		* Redistribution and use in source and binary forms, with or without modification,
		* are permitted provided that the following conditions are met:
		*
		* Redistributions of source code must retain the above copyright notice, this list of
		* conditions and the following disclaimer.
		* Redistributions in binary form must reproduce the above copyright notice, this list
		* of conditions and the following disclaimer in the documentation and/or other materials
		* provided with the distribution.
		*
		* Neither the name of the author nor the names of contributors may be used to endorse
		* or promote products derived from this software without specific prior written permission.
		*
		* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
		* EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
		* MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
		* COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
		* EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
		* GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
		* AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
		* NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
		* OF THE POSSIBILITY OF SUCH DAMAGE.
		*
		*/

	})($j);

	/*
	* jQuery UI Effects Slide @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Effects/Slide
	*
	* Depends:
	*	jquery.effects.core.js
	*/
	(function ($, undefined)
	{
		$.effects.slide = function (o)
		{
			return this.queue(function ()
			{


				// Create element

				var el = $(this), props = ['position', 'top', 'bottom', 'left', 'right'];


				// Set options

				var mode = $.effects.setMode(el, o.options.mode || 'show'); // Set Mode

				var direction = o.options.direction || 'left'; // Default Direction


				// Adjust

				$.effects.save(el, props); el.show(); // Save & Show

				$.effects.createWrapper(el).css({ overflow: 'hidden' }); // Create Wrapper

				var ref = (direction == 'up' || direction == 'down') ? 'top' : 'left';

				var motion = (direction == 'up' || direction == 'left') ? 'pos' : 'neg';

				var distance = o.options.distance || (ref == 'top' ? el.outerHeight({ margin: true }) : el.outerWidth({ margin: true }));

				if (mode == 'show') el.css(ref, motion == 'pos' ? (isNaN(distance) ? "-" + distance : -distance) : distance); // Shift


				// Animation

				var animation = {};

				animation[ref] = (mode == 'show' ? (motion == 'pos' ? '+=' : '-=') : (motion == 'pos' ? '-=' : '+=')) + distance;


				// Animate

				el.animate(animation, { queue: false, duration: o.duration, easing: o.options.easing, complete: function ()
				{
					if (mode == 'hide') el.hide(); // Hide
					$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore
					if (o.callback) o.callback.apply(this, arguments); // Callback
					el.dequeue();
				}
				});


			});


		};


	})($j);

	/*
	* jQuery UI Effects Bounce @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Effects/Bounce
	*
	* Depends:
	*	jquery.effects.core.js
	*/
	(function ($, undefined)
	{
		$.effects.bounce = function (o)
		{


			return this.queue(function ()
			{


				// Create element

				var el = $(this), props = ['position', 'top', 'bottom', 'left', 'right'];


				// Set options

				var mode = $.effects.setMode(el, o.options.mode || 'effect'); // Set Mode

				var direction = o.options.direction || 'up'; // Default direction

				var distance = o.options.distance || 20; // Default distance

				var times = o.options.times || 5; // Default # of times

				var speed = o.duration || 250; // Default speed per bounce

				if (/show|hide/.test(mode)) props.push('opacity'); // Avoid touching opacity to prevent clearType and PNG issues in IE


				// Adjust

				$.effects.save(el, props); el.show(); // Save & Show

				$.effects.createWrapper(el); // Create Wrapper

				var ref = (direction == 'up' || direction == 'down') ? 'top' : 'left';

				var motion = (direction == 'up' || direction == 'left') ? 'pos' : 'neg';

				var distance = o.options.distance || (ref == 'top' ? el.outerHeight({ margin: true }) / 3 : el.outerWidth({ margin: true }) / 3);

				if (mode == 'show') el.css('opacity', 0).css(ref, motion == 'pos' ? -distance : distance); // Shift

				if (mode == 'hide') distance = distance / (times * 2);

				if (mode != 'hide') times--;


				// Animate

				if (mode == 'show')
				{ // Show Bounce

					var animation = { opacity: 1 };

					animation[ref] = (motion == 'pos' ? '+=' : '-=') + distance;

					el.animate(animation, speed / 2, o.options.easing);

					distance = distance / 2;

					times--;

				};

				for (var i = 0; i < times; i++)
				{ // Bounces

					var animation1 = {}, animation2 = {};

					animation1[ref] = (motion == 'pos' ? '-=' : '+=') + distance;

					animation2[ref] = (motion == 'pos' ? '+=' : '-=') + distance;

					el.animate(animation1, speed / 2, o.options.easing).animate(animation2, speed / 2, o.options.easing);

					distance = (mode == 'hide') ? distance * 2 : distance / 2;

				};

				if (mode == 'hide')
				{ // Last Bounce

					var animation = { opacity: 0 };

					animation[ref] = (motion == 'pos' ? '-=' : '+=') + distance;

					el.animate(animation, speed / 2, o.options.easing, function ()
					{

						el.hide(); // Hide

						$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore

						if (o.callback) o.callback.apply(this, arguments); // Callback

					});

				} else
				{

					var animation1 = {}, animation2 = {};

					animation1[ref] = (motion == 'pos' ? '-=' : '+=') + distance;

					animation2[ref] = (motion == 'pos' ? '+=' : '-=') + distance;

					el.animate(animation1, speed / 2, o.options.easing).animate(animation2, speed / 2, o.options.easing, function ()
					{

						$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore

						if (o.callback) o.callback.apply(this, arguments); // Callback

					});

				};

				el.queue('fx', function () { el.dequeue(); });

				el.dequeue();

			});


		};


	})($j);

	/*
	* jQuery UI Draggable @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Draggables
	*
	* Depends:
	*	jquery.ui.core.js
	*	jquery.ui.mouse.js
	*	jquery.ui.widget.js
	*/
	(function ($, undefined)
	{

		$.widget("ui.draggable", $.ui.mouse, {
			widgetEventPrefix: "drag",
			options: {
				addClasses: true,
				appendTo: "parent",
				axis: false,
				connectToSortable: false,
				containment: false,
				cursor: "auto",
				cursorAt: false,
				grid: false,
				handle: false,
				helper: "original",
				iframeFix: false,
				opacity: false,
				refreshPositions: false,
				revert: false,
				revertDuration: 500,
				scope: "default",
				scroll: true,
				scrollSensitivity: 20,
				scrollSpeed: 20,
				snap: false,
				snapMode: "both",
				snapTolerance: 20,
				stack: false,
				zIndex: false
			},
			_create: function ()
			{

				if (this.options.helper == 'original' && !(/^(?:r|a|f)/).test(this.element.css("position")))
					this.element[0].style.position = 'relative';

				(this.options.addClasses && this.element.addClass("ui-draggable"));
				(this.options.disabled && this.element.addClass("ui-draggable-disabled"));

				this._mouseInit();

			},

			destroy: function ()
			{
				if (!this.element.data('draggable')) return;
				this.element
			.removeData("draggable")
			.unbind(".draggable")
			.removeClass("ui-draggable"
				+ " ui-draggable-dragging"
				+ " ui-draggable-disabled");
				this._mouseDestroy();

				return this;
			},

			_mouseCapture: function (event)
			{

				var o = this.options;

				// among others, prevent a drag on a resizable-handle
				if (this.helper || o.disabled || $(event.target).is('.ui-resizable-handle'))
					return false;

				//Quit if we're not on a valid handle
				this.handle = this._getHandle(event);
				if (!this.handle)
					return false;

				return true;

			},

			_mouseStart: function (event)
			{

				var o = this.options;

				//Create and append the visible helper
				this.helper = this._createHelper(event);

				//Cache the helper size
				this._cacheHelperProportions();

				//If ddmanager is used for droppables, set the global draggable
				if ($.ui.ddmanager)
					$.ui.ddmanager.current = this;

				/*
				* - Position generation -
				* This block generates everything position related - it's the core of draggables.
				*/

				//Cache the margins of the original element
				this._cacheMargins();

				//Store the helper's css position
				this.cssPosition = this.helper.css("position");
				this.scrollParent = this.helper.scrollParent();

				//The element's absolute position on the page minus margins
				this.offset = this.positionAbs = this.element.offset();
				this.offset = {
					top: this.offset.top - this.margins.top,
					left: this.offset.left - this.margins.left
				};

				$.extend(this.offset, {
					click: { //Where the click happened, relative to the element
						left: event.pageX - this.offset.left,
						top: event.pageY - this.offset.top
					},
					parent: this._getParentOffset(),
					relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
				});

				//Generate the original position
				this.originalPosition = this.position = this._generatePosition(event);
				this.originalPageX = event.pageX;
				this.originalPageY = event.pageY;

				//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
				(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

				//Set a containment if given in the options
				if (o.containment)
					this._setContainment();

				//Trigger event + callbacks
				if (this._trigger("start", event) === false)
				{
					this._clear();
					return false;
				}

				//Recache the helper size
				this._cacheHelperProportions();

				//Prepare the droppable offsets
				if ($.ui.ddmanager && !o.dropBehaviour)
					$.ui.ddmanager.prepareOffsets(this, event);

				this.helper.addClass("ui-draggable-dragging");
				this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position
				return true;
			},

			_mouseDrag: function (event, noPropagation)
			{

				//Compute the helpers position
				this.position = this._generatePosition(event);
				this.positionAbs = this._convertPositionTo("absolute");

				//Call plugins and callbacks and use the resulting position if something is returned
				if (!noPropagation)
				{
					var ui = this._uiHash();
					if (this._trigger('drag', event, ui) === false)
					{
						this._mouseUp({});
						return false;
					}
					this.position = ui.position;
				}

				if (!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left + 'px';
				if (!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top + 'px';
				if ($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

				return false;
			},

			_mouseStop: function (event)
			{

				//If we are using droppables, inform the manager about the drop
				var dropped = false;
				if ($.ui.ddmanager && !this.options.dropBehaviour)
					dropped = $.ui.ddmanager.drop(this, event);

				//if a drop comes from outside (a sortable)
				if (this.dropped)
				{
					dropped = this.dropped;
					this.dropped = false;
				}

				//if the original element is removed, don't bother to continue if helper is set to "original"
				if ((!this.element[0] || !this.element[0].parentNode) && this.options.helper == "original")
					return false;

				if ((this.options.revert == "invalid" && !dropped) || (this.options.revert == "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped)))
				{
					var self = this;
					$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function ()
					{
						if (self._trigger("stop", event) !== false)
						{
							self._clear();
						}
					});
				} else
				{
					if (this._trigger("stop", event) !== false)
					{
						this._clear();
					}
				}

				return false;
			},

			cancel: function ()
			{

				if (this.helper.is(".ui-draggable-dragging"))
				{
					this._mouseUp({});
				} else
				{
					this._clear();
				}

				return this;

			},

			_getHandle: function (event)
			{

				var handle = !this.options.handle || !$(this.options.handle, this.element).length ? true : false;
				$(this.options.handle, this.element)
			.find("*")
			.andSelf()
			.each(function ()
			{
				if (this == event.target) handle = true;
			});

				return handle;

			},

			_createHelper: function (event)
			{

				var o = this.options;
				var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper == 'clone' ? this.element.clone() : this.element);

				if (!helper.parents('body').length)
					helper.appendTo((o.appendTo == 'parent' ? this.element[0].parentNode : o.appendTo));

				if (helper[0] != this.element[0] && !(/(fixed|absolute)/).test(helper.css("position")))
					helper.css("position", "absolute");

				return helper;

			},

			_adjustOffsetFromHelper: function (obj)
			{
				if (typeof obj == 'string')
				{
					obj = obj.split(' ');
				}
				if ($.isArray(obj))
				{
					obj = { left: +obj[0], top: +obj[1] || 0 };
				}
				if ('left' in obj)
				{
					this.offset.click.left = obj.left + this.margins.left;
				}
				if ('right' in obj)
				{
					this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
				}
				if ('top' in obj)
				{
					this.offset.click.top = obj.top + this.margins.top;
				}
				if ('bottom' in obj)
				{
					this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
				}
			},

			_getParentOffset: function ()
			{

				//Get the offsetParent and cache its position
				this.offsetParent = this.helper.offsetParent();
				var po = this.offsetParent.offset();

				// This is a special case where we need to modify a offset calculated on start, since the following happened:
				// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
				// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
				//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
				if (this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0]))
				{
					po.left += this.scrollParent.scrollLeft();
					po.top += this.scrollParent.scrollTop();
				}

				if ((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.browser.msie)) //Ugly IE fix
					po = { top: 0, left: 0 };

				return {
					top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
					left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
				};

			},

			_getRelativeOffset: function ()
			{

				if (this.cssPosition == "relative")
				{
					var p = this.element.position();
					return {
						top: p.top - (parseInt(this.helper.css("top"), 10) || 0) + this.scrollParent.scrollTop(),
						left: p.left - (parseInt(this.helper.css("left"), 10) || 0) + this.scrollParent.scrollLeft()
					};
				} else
				{
					return { top: 0, left: 0 };
				}

			},

			_cacheMargins: function ()
			{
				this.margins = {
					left: (parseInt(this.element.css("marginLeft"), 10) || 0),
					top: (parseInt(this.element.css("marginTop"), 10) || 0)
				};
			},

			_cacheHelperProportions: function ()
			{
				this.helperProportions = {
					width: this.helper.outerWidth(),
					height: this.helper.outerHeight()
				};
			},

			_setContainment: function ()
			{

				var o = this.options;
				if (o.containment == 'parent') o.containment = this.helper[0].parentNode;
				if (o.containment == 'document' || o.containment == 'window') this.containment = [
			(o.containment == 'document' ? 0 : $(window).scrollLeft()) - this.offset.relative.left - this.offset.parent.left,
			(o.containment == 'document' ? 0 : $(window).scrollTop()) - this.offset.relative.top - this.offset.parent.top,
			(o.containment == 'document' ? 0 : $(window).scrollLeft()) + $(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			(o.containment == 'document' ? 0 : $(window).scrollTop()) + ($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

				if (!(/^(document|window|parent)$/).test(o.containment) && o.containment.constructor != Array)
				{
					var ce = $(o.containment)[0]; if (!ce) return;
					var co = $(o.containment).offset();
					var over = ($(ce).css("overflow") != 'hidden');

					this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"), 10) || 0) + (parseInt($(ce).css("paddingLeft"), 10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"), 10) || 0) + (parseInt($(ce).css("paddingTop"), 10) || 0) - this.margins.top,
				co.left + (over ? Math.max(ce.scrollWidth, ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"), 10) || 0) - (parseInt($(ce).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left,
				co.top + (over ? Math.max(ce.scrollHeight, ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"), 10) || 0) - (parseInt($(ce).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top
			];
				} else if (o.containment.constructor == Array)
				{
					this.containment = o.containment;
				}

			},

			_convertPositionTo: function (d, pos)
			{

				if (!pos) pos = this.position;
				var mod = d == "absolute" ? 1 : -1;
				var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

				return {
					top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : (this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : (scrollIsRootNode ? 0 : scroll.scrollTop())) * mod)
			),
					left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : (this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft()) * mod)
			)
				};

			},

			_generatePosition: function (event)
			{

				var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
				var pageX = event.pageX;
				var pageY = event.pageY;

				/*
				* - Position constraining -
				* Constrain the position to a mix of grid, containment.
				*/

				if (this.originalPosition)
				{ //If we are not dragging yet, we won't check for options

					if (this.containment)
					{
						if (event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
						if (event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
						if (event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
						if (event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
					}

					if (o.grid)
					{
						var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
						pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

						var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
						pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
					}

				}

				return {
					top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : (this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : (scrollIsRootNode ? 0 : scroll.scrollTop())))
			),
					left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : (this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft()))
			)
				};

			},

			_clear: function ()
			{
				this.helper.removeClass("ui-draggable-dragging");
				if (this.helper[0] != this.element[0] && !this.cancelHelperRemoval) this.helper.remove();
				//if($.ui.ddmanager) $.ui.ddmanager.current = null;
				this.helper = null;
				this.cancelHelperRemoval = false;
			},

			// From now on bulk stuff - mainly helpers

			_trigger: function (type, event, ui)
			{
				ui = ui || this._uiHash();
				$.ui.plugin.call(this, type, [event, ui]);
				if (type == "drag") this.positionAbs = this._convertPositionTo("absolute"); //The absolute position has to be recalculated after plugins
				return $.Widget.prototype._trigger.call(this, type, event, ui);
			},

			plugins: {},

			_uiHash: function (event)
			{
				return {
					helper: this.helper,
					position: this.position,
					originalPosition: this.originalPosition,
					offset: this.positionAbs
				};
			}

		});

		$.extend($.ui.draggable, {
			version: "@VERSION"
		});

		$.ui.plugin.add("draggable", "connectToSortable", {
			start: function (event, ui)
			{

				var inst = $(this).data("draggable"), o = inst.options,
			uiSortable = $.extend({}, ui, { item: inst.element });
				inst.sortables = [];
				$(o.connectToSortable).each(function ()
				{
					var sortable = $.data(this, 'sortable');
					if (sortable && !sortable.options.disabled)
					{
						inst.sortables.push({
							instance: sortable,
							shouldRevert: sortable.options.revert
						});
						sortable._refreshItems(); //Do a one-time refresh at start to refresh the containerCache
						sortable._trigger("activate", event, uiSortable);
					}
				});

			},
			stop: function (event, ui)
			{

				//If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
				var inst = $(this).data("draggable"),
			uiSortable = $.extend({}, ui, { item: inst.element });

				$.each(inst.sortables, function ()
				{
					if (this.instance.isOver)
					{

						this.instance.isOver = 0;

						inst.cancelHelperRemoval = true; //Don't remove the helper in the draggable instance
						this.instance.cancelHelperRemoval = false; //Remove it in the sortable instance (so sortable plugins like revert still work)

						//The sortable revert is supported, and we have to set a temporary dropped variable on the draggable to support revert: 'valid/invalid'
						if (this.shouldRevert) this.instance.options.revert = true;

						//Trigger the stop of the sortable
						this.instance._mouseStop(event);

						this.instance.options.helper = this.instance.options._helper;

						//If the helper has been the original item, restore properties in the sortable
						if (inst.options.helper == 'original')
							this.instance.currentItem.css({ top: 'auto', left: 'auto' });

					} else
					{
						this.instance.cancelHelperRemoval = false; //Remove the helper in the sortable instance
						this.instance._trigger("deactivate", event, uiSortable);
					}

				});

			},
			drag: function (event, ui)
			{

				var inst = $(this).data("draggable"), self = this;

				var checkPos = function (o)
				{
					var dyClick = this.offset.click.top, dxClick = this.offset.click.left;
					var helperTop = this.positionAbs.top, helperLeft = this.positionAbs.left;
					var itemHeight = o.height, itemWidth = o.width;
					var itemTop = o.top, itemLeft = o.left;

					return $.ui.isOver(helperTop + dyClick, helperLeft + dxClick, itemTop, itemLeft, itemHeight, itemWidth);
				};

				$.each(inst.sortables, function (i)
				{

					//Copy over some variables to allow calling the sortable's native _intersectsWith
					this.instance.positionAbs = inst.positionAbs;
					this.instance.helperProportions = inst.helperProportions;
					this.instance.offset.click = inst.offset.click;

					if (this.instance._intersectsWith(this.instance.containerCache))
					{

						//If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
						if (!this.instance.isOver)
						{

							this.instance.isOver = 1;
							//Now we fake the start of dragging for the sortable instance,
							//by cloning the list group item, appending it to the sortable and using it as inst.currentItem
							//We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
							this.instance.currentItem = $(self).clone().appendTo(this.instance.element).data("sortable-item", true);
							this.instance.options._helper = this.instance.options.helper; //Store helper option to later restore it
							this.instance.options.helper = function () { return ui.helper[0]; };

							event.target = this.instance.currentItem[0];
							this.instance._mouseCapture(event, true);
							this.instance._mouseStart(event, true, true);

							//Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
							this.instance.offset.click.top = inst.offset.click.top;
							this.instance.offset.click.left = inst.offset.click.left;
							this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
							this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

							inst._trigger("toSortable", event);
							inst.dropped = this.instance.element; //draggable revert needs that
							//hack so receive/update callbacks work (mostly)
							inst.currentItem = inst.element;
							this.instance.fromOutside = inst;

						}

						//Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
						if (this.instance.currentItem) this.instance._mouseDrag(event);

					} else
					{

						//If it doesn't intersect with the sortable, and it intersected before,
						//we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
						if (this.instance.isOver)
						{

							this.instance.isOver = 0;
							this.instance.cancelHelperRemoval = true;

							//Prevent reverting on this forced stop
							this.instance.options.revert = false;

							// The out event needs to be triggered independently
							this.instance._trigger('out', event, this.instance._uiHash(this.instance));

							this.instance._mouseStop(event, true);
							this.instance.options.helper = this.instance.options._helper;

							//Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
							this.instance.currentItem.remove();
							if (this.instance.placeholder) this.instance.placeholder.remove();

							inst._trigger("fromSortable", event);
							inst.dropped = false; //draggable revert needs that
						}

					};

				});

			}
		});

		$.ui.plugin.add("draggable", "cursor", {
			start: function (event, ui)
			{
				var t = $('body'), o = $(this).data('draggable').options;
				if (t.css("cursor")) o._cursor = t.css("cursor");
				t.css("cursor", o.cursor);
			},
			stop: function (event, ui)
			{
				var o = $(this).data('draggable').options;
				if (o._cursor) $('body').css("cursor", o._cursor);
			}
		});

		$.ui.plugin.add("draggable", "iframeFix", {
			start: function (event, ui)
			{
				var o = $(this).data('draggable').options;
				$(o.iframeFix === true ? "iframe" : o.iframeFix).each(function ()
				{
					$('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>')
			.css({
				width: this.offsetWidth + "px", height: this.offsetHeight + "px",
				position: "absolute", opacity: "0.001", zIndex: 1000
			})
			.css($(this).offset())
			.appendTo("body");
				});
			},
			stop: function (event, ui)
			{
				$("div.ui-draggable-iframeFix").each(function () { this.parentNode.removeChild(this); }); //Remove frame helpers
			}
		});

		$.ui.plugin.add("draggable", "opacity", {
			start: function (event, ui)
			{
				var t = $(ui.helper), o = $(this).data('draggable').options;
				if (t.css("opacity")) o._opacity = t.css("opacity");
				t.css('opacity', o.opacity);
			},
			stop: function (event, ui)
			{
				var o = $(this).data('draggable').options;
				if (o._opacity) $(ui.helper).css('opacity', o._opacity);
			}
		});

		$.ui.plugin.add("draggable", "scroll", {
			start: function (event, ui)
			{
				var i = $(this).data("draggable");
				if (i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') i.overflowOffset = i.scrollParent.offset();
			},
			drag: function (event, ui)
			{

				var i = $(this).data("draggable"), o = i.options, scrolled = false;

				if (i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML')
				{

					if (!o.axis || o.axis != 'x')
					{
						if ((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
							i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed;
						else if (event.pageY - i.overflowOffset.top < o.scrollSensitivity)
							i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed;
					}

					if (!o.axis || o.axis != 'y')
					{
						if ((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
							i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed;
						else if (event.pageX - i.overflowOffset.left < o.scrollSensitivity)
							i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed;
					}

				} else
				{

					if (!o.axis || o.axis != 'x')
					{
						if (event.pageY - $(document).scrollTop() < o.scrollSensitivity)
							scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
						else if ($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
							scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
					}

					if (!o.axis || o.axis != 'y')
					{
						if (event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
							scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
						else if ($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
							scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
					}

				}

				if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
					$.ui.ddmanager.prepareOffsets(i, event);

			}
		});

		$.ui.plugin.add("draggable", "snap", {
			start: function (event, ui)
			{

				var i = $(this).data("draggable"), o = i.options;
				i.snapElements = [];

				$(o.snap.constructor != String ? (o.snap.items || ':data(draggable)') : o.snap).each(function ()
				{
					var $t = $(this); var $o = $t.offset();
					if (this != i.element[0]) i.snapElements.push({
						item: this,
						width: $t.outerWidth(), height: $t.outerHeight(),
						top: $o.top, left: $o.left
					});
				});

			},
			drag: function (event, ui)
			{

				var inst = $(this).data("draggable"), o = inst.options;
				var d = o.snapTolerance;

				var x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

				for (var i = inst.snapElements.length - 1; i >= 0; i--)
				{

					var l = inst.snapElements[i].left, r = l + inst.snapElements[i].width,
				t = inst.snapElements[i].top, b = t + inst.snapElements[i].height;

					//Yes, I know, this is insane ;)
					if (!((l - d < x1 && x1 < r + d && t - d < y1 && y1 < b + d) || (l - d < x1 && x1 < r + d && t - d < y2 && y2 < b + d) || (l - d < x2 && x2 < r + d && t - d < y1 && y1 < b + d) || (l - d < x2 && x2 < r + d && t - d < y2 && y2 < b + d)))
					{
						if (inst.snapElements[i].snapping) (inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
						inst.snapElements[i].snapping = false;
						continue;
					}

					if (o.snapMode != 'inner')
					{
						var ts = Math.abs(t - y2) <= d;
						var bs = Math.abs(b - y1) <= d;
						var ls = Math.abs(l - x2) <= d;
						var rs = Math.abs(r - x1) <= d;
						if (ts) ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
						if (bs) ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top - inst.margins.top;
						if (ls) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left - inst.margins.left;
						if (rs) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left - inst.margins.left;
					}

					var first = (ts || bs || ls || rs);

					if (o.snapMode != 'outer')
					{
						var ts = Math.abs(t - y1) <= d;
						var bs = Math.abs(b - y2) <= d;
						var ls = Math.abs(l - x1) <= d;
						var rs = Math.abs(r - x2) <= d;
						if (ts) ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top - inst.margins.top;
						if (bs) ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
						if (ls) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left - inst.margins.left;
						if (rs) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left - inst.margins.left;
					}

					if (!inst.snapElements[i].snapping && (ts || bs || ls || rs || first))
						(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
					inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

				};

			}
		});

		$.ui.plugin.add("draggable", "stack", {
			start: function (event, ui)
			{

				var o = $(this).data("draggable").options;

				var group = $.makeArray($(o.stack)).sort(function (a, b)
				{
					return (parseInt($(a).css("zIndex"), 10) || 0) - (parseInt($(b).css("zIndex"), 10) || 0);
				});
				if (!group.length) { return; }

				var min = parseInt(group[0].style.zIndex) || 0;
				$(group).each(function (i)
				{
					this.style.zIndex = min + i;
				});

				this[0].style.zIndex = min + group.length;

			}
		});

		$.ui.plugin.add("draggable", "zIndex", {
			start: function (event, ui)
			{
				var t = $(ui.helper), o = $(this).data("draggable").options;
				if (t.css("zIndex")) o._zIndex = t.css("zIndex");
				t.css('zIndex', o.zIndex);
			},
			stop: function (event, ui)
			{
				var o = $(this).data("draggable").options;
				if (o._zIndex) $(ui.helper).css('zIndex', o._zIndex);
			}
		});

	})($j);

	/*
	* jQuery UI Position @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Position
	*/
	(function ($, undefined)
	{

		$.ui = $.ui || {};

		var horizontalPositions = /left|center|right/,
	verticalPositions = /top|center|bottom/,
	center = "center",
	_position = $.fn.position,
	_offset = $.fn.offset;

		$.fn.position = function (options)
		{
			if (!options || !options.of)
			{
				return _position.apply(this, arguments);
			}

			// make a copy, we don't want to modify arguments
			options = $.extend({}, options);

			var target = $(options.of),
		targetElem = target[0],
		collision = (options.collision || "flip").split(" "),
		offset = options.offset ? options.offset.split(" ") : [0, 0],
		targetWidth,
		targetHeight,
		basePosition;

			if (targetElem.nodeType === 9)
			{
				targetWidth = target.width();
				targetHeight = target.height();
				basePosition = { top: 0, left: 0 };
				// TODO: use $.isWindow() in 1.9
			} else if (targetElem.setTimeout)
			{
				targetWidth = target.width();
				targetHeight = target.height();
				basePosition = { top: target.scrollTop(), left: target.scrollLeft() };
			} else if (targetElem.preventDefault)
			{
				// force left top to allow flipping
				options.at = "left top";
				targetWidth = targetHeight = 0;
				basePosition = { top: options.of.pageY, left: options.of.pageX };
			} else
			{
				targetWidth = target.outerWidth();
				targetHeight = target.outerHeight();
				basePosition = target.offset();
			}

			// force my and at to have valid horizontal and veritcal positions
			// if a value is missing or invalid, it will be converted to center 
			$.each(["my", "at"], function ()
			{
				var pos = (options[this] || "").split(" ");
				if (pos.length === 1)
				{
					pos = horizontalPositions.test(pos[0]) ?
				pos.concat([center]) :
				verticalPositions.test(pos[0]) ?
					[center].concat(pos) :
					[center, center];
				}
				pos[0] = horizontalPositions.test(pos[0]) ? pos[0] : center;
				pos[1] = verticalPositions.test(pos[1]) ? pos[1] : center;
				options[this] = pos;
			});

			// normalize collision option
			if (collision.length === 1)
			{
				collision[1] = collision[0];
			}

			// normalize offset option
			offset[0] = parseInt(offset[0], 10) || 0;
			if (offset.length === 1)
			{
				offset[1] = offset[0];
			}
			offset[1] = parseInt(offset[1], 10) || 0;

			if (options.at[0] === "right")
			{
				basePosition.left += targetWidth;
			} else if (options.at[0] === center)
			{
				basePosition.left += targetWidth / 2;
			}

			if (options.at[1] === "bottom")
			{
				basePosition.top += targetHeight;
			} else if (options.at[1] === center)
			{
				basePosition.top += targetHeight / 2;
			}

			basePosition.left += offset[0];
			basePosition.top += offset[1];

			return this.each(function ()
			{
				var elem = $(this),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseInt($.curCSS(this, "marginLeft", true)) || 0,
			marginTop = parseInt($.curCSS(this, "marginTop", true)) || 0,
			collisionWidth = elemWidth + marginLeft +
				(parseInt($.curCSS(this, "marginRight", true)) || 0),
			collisionHeight = elemHeight + marginTop +
				(parseInt($.curCSS(this, "marginBottom", true)) || 0),
			position = $.extend({}, basePosition),
			collisionPosition;

				if (options.my[0] === "right")
				{
					position.left -= elemWidth;
				} else if (options.my[0] === center)
				{
					position.left -= elemWidth / 2;
				}

				if (options.my[1] === "bottom")
				{
					position.top -= elemHeight;
				} else if (options.my[1] === center)
				{
					position.top -= elemHeight / 2;
				}

				// prevent fractions (see #5280)
				position.left = Math.round(position.left);
				position.top = Math.round(position.top);

				collisionPosition = {
					left: position.left - marginLeft,
					top: position.top - marginTop
				};

				$.each(["left", "top"], function (i, dir)
				{
					if ($.ui.position[collision[i]])
					{
						$.ui.position[collision[i]][dir](position, {
							targetWidth: targetWidth,
							targetHeight: targetHeight,
							elemWidth: elemWidth,
							elemHeight: elemHeight,
							collisionPosition: collisionPosition,
							collisionWidth: collisionWidth,
							collisionHeight: collisionHeight,
							offset: offset,
							my: options.my,
							at: options.at
						});
					}
				});

				if ($.fn.bgiframe)
				{
					elem.bgiframe();
				}
				elem.offset($.extend(position, { using: options.using }));
			});
		};

		$.ui.position = {
			fit: {
				left: function (position, data)
				{
					var win = $(window),
				over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft();
					position.left = over > 0 ? position.left - over : Math.max(position.left - data.collisionPosition.left, position.left);
				},
				top: function (position, data)
				{
					var win = $(window),
				over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop();
					position.top = over > 0 ? position.top - over : Math.max(position.top - data.collisionPosition.top, position.top);
				}
			},

			flip: {
				left: function (position, data)
				{
					if (data.at[0] === center)
					{
						return;
					}
					var win = $(window),
				over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft(),
				myOffset = data.my[0] === "left" ?
					-data.elemWidth :
					data.my[0] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[0] === "left" ?
					data.targetWidth :
					-data.targetWidth,
				offset = -2 * data.offset[0];
					position.left += data.collisionPosition.left < 0 ?
				myOffset + atOffset + offset :
				over > 0 ?
					myOffset + atOffset + offset :
					0;
				},
				top: function (position, data)
				{
					if (data.at[1] === center)
					{
						return;
					}
					var win = $(window),
				over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop(),
				myOffset = data.my[1] === "top" ?
					-data.elemHeight :
					data.my[1] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[1] === "top" ?
					data.targetHeight :
					-data.targetHeight,
				offset = -2 * data.offset[1];
					position.top += data.collisionPosition.top < 0 ?
				myOffset + atOffset + offset :
				over > 0 ?
					myOffset + atOffset + offset :
					0;
				}
			}
		};

		// offset setter from jQuery 1.4
		if (!$.offset.setOffset)
		{
			$.offset.setOffset = function (elem, options)
			{
				// set position first, in-case top/left are set even on static elem
				if (/static/.test($.curCSS(elem, "position")))
				{
					elem.style.position = "relative";
				}
				var curElem = $(elem),
			curOffset = curElem.offset(),
			curTop = parseInt($.curCSS(elem, "top", true), 10) || 0,
			curLeft = parseInt($.curCSS(elem, "left", true), 10) || 0,
			props = {
				top: (options.top - curOffset.top) + curTop,
				left: (options.left - curOffset.left) + curLeft
			};

				if ('using' in options)
				{
					options.using.call(elem, props);
				} else
				{
					curElem.css(props);
				}
			};

			$.fn.offset = function (options)
			{
				var elem = this[0];
				if (!elem || !elem.ownerDocument) { return null; }
				if (options)
				{
					return this.each(function ()
					{
						$.offset.setOffset(this, options);
					});
				}
				return _offset.call(this);
			};
		}

	} ($j));

	/*
	* jQuery UI Resizable @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Resizables
	*
	* Depends:
	*	jquery.ui.core.js
	*	jquery.ui.mouse.js
	*	jquery.ui.widget.js
	*/
	(function ($, undefined)
	{

		$.widget("ui.resizable", $.ui.mouse, {
			widgetEventPrefix: "resize",
			options: {
				alsoResize: false,
				animate: false,
				animateDuration: "slow",
				animateEasing: "swing",
				aspectRatio: false,
				autoHide: false,
				containment: false,
				ghost: false,
				grid: false,
				handles: "e,s,se",
				helper: false,
				maxHeight: null,
				maxWidth: null,
				minHeight: 10,
				minWidth: 10,
				zIndex: 1000
			},
			_create: function ()
			{

				var self = this, o = this.options;
				this.element.addClass("ui-resizable");

				$.extend(this, {
					_aspectRatio: !!(o.aspectRatio),
					aspectRatio: o.aspectRatio,
					originalElement: this.element,
					_proportionallyResizeElements: [],
					_helper: o.helper || o.ghost || o.animate ? o.helper || 'ui-resizable-helper' : null
				});

				//Wrap the element if it cannot hold child nodes
				if (this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i))
				{

					//Opera fix for relative positioning
					if (/relative/.test(this.element.css('position')) && $.browser.opera)
						this.element.css({ position: 'relative', top: 'auto', left: 'auto' });

					//Create a wrapper element and set the wrapper to the new current internal element
					this.element.wrap(
				$('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({
					position: this.element.css('position'),
					width: this.element.outerWidth(),
					height: this.element.outerHeight(),
					top: this.element.css('top'),
					left: this.element.css('left')
				})
			);

					//Overwrite the original this.element
					this.element = this.element.parent().data(
				"resizable", this.element.data('resizable')
			);

					this.elementIsWrapper = true;

					//Move margins to the wrapper
					this.element.css({ marginLeft: this.originalElement.css("marginLeft"), marginTop: this.originalElement.css("marginTop"), marginRight: this.originalElement.css("marginRight"), marginBottom: this.originalElement.css("marginBottom") });
					this.originalElement.css({ marginLeft: 0, marginTop: 0, marginRight: 0, marginBottom: 0 });

					//Prevent Safari textarea resize
					this.originalResizeStyle = this.originalElement.css('resize');
					this.originalElement.css('resize', 'none');

					//Push the actual element to our proportionallyResize internal array
					this._proportionallyResizeElements.push(this.originalElement.css({ position: 'static', zoom: 1, display: 'block' }));

					// avoid IE jump (hard set the margin)
					this.originalElement.css({ margin: this.originalElement.css('margin') });

					// fix handlers offset
					this._proportionallyResize();

				}

				this.handles = o.handles || (!$('.ui-resizable-handle', this.element).length ? "e,s,se" : { n: '.ui-resizable-n', e: '.ui-resizable-e', s: '.ui-resizable-s', w: '.ui-resizable-w', se: '.ui-resizable-se', sw: '.ui-resizable-sw', ne: '.ui-resizable-ne', nw: '.ui-resizable-nw' });
				if (this.handles.constructor == String)
				{

					if (this.handles == 'all') this.handles = 'n,e,s,w,se,sw,ne,nw';
					var n = this.handles.split(","); this.handles = {};

					for (var i = 0; i < n.length; i++)
					{

						var handle = $.trim(n[i]), hname = 'ui-resizable-' + handle;
						var axis = $('<div class="ui-resizable-handle ' + hname + '"></div>');

						// increase zIndex of sw, se, ne, nw axis
						//TODO : this modifies original option
						if (/sw|se|ne|nw/.test(handle)) axis.css({ zIndex: ++o.zIndex });

						//TODO : What's going on here?
						if ('se' == handle)
						{
							axis.addClass('ui-icon ui-icon-gripsmall-diagonal-se');
						};

						//Insert into internal handles object and append to element
						this.handles[handle] = '.ui-resizable-' + handle;
						this.element.append(axis);
					}

				}

				this._renderAxis = function (target)
				{

					target = target || this.element;

					for (var i in this.handles)
					{

						if (this.handles[i].constructor == String)
							this.handles[i] = $(this.handles[i], this.element).show();

						//Apply pad to wrapper element, needed to fix axis position (textarea, inputs, scrolls)
						if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i))
						{

							var axis = $(this.handles[i], this.element), padWrapper = 0;

							//Checking the correct pad and border
							padWrapper = /sw|ne|nw|se|n|s/.test(i) ? axis.outerHeight() : axis.outerWidth();

							//The padding type i have to apply...
							var padPos = ['padding',
						/ne|nw|n/.test(i) ? 'Top' :
						/se|sw|s/.test(i) ? 'Bottom' :
						/^e$/.test(i) ? 'Right' : 'Left'].join("");

							target.css(padPos, padWrapper);

							this._proportionallyResize();

						}

						//TODO: What's that good for? There's not anything to be executed left
						if (!$(this.handles[i]).length)
							continue;

					}
				};

				//TODO: make renderAxis a prototype function
				this._renderAxis(this.element);

				this._handles = $('.ui-resizable-handle', this.element)
			.disableSelection();

				//Matching axis name
				this._handles.mouseover(function ()
				{
					if (!self.resizing)
					{
						if (this.className)
							var axis = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
						//Axis, default = se
						self.axis = axis && axis[1] ? axis[1] : 'se';
					}
				});

				//If we want to auto hide the elements
				if (o.autoHide)
				{
					this._handles.hide();
					$(this.element)
				.addClass("ui-resizable-autohide")
				.hover(function ()
				{
					$(this).removeClass("ui-resizable-autohide");
					self._handles.show();
				},
				function ()
				{
					if (!self.resizing)
					{
						$(this).addClass("ui-resizable-autohide");
						self._handles.hide();
					}
				});
				}

				//Initialize the mouse interaction
				this._mouseInit();

			},

			destroy: function ()
			{

				this._mouseDestroy();

				var _destroy = function (exp)
				{
					$(exp).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing")
				.removeData("resizable").unbind(".resizable").find('.ui-resizable-handle').remove();
				};

				//TODO: Unwrap at same DOM position
				if (this.elementIsWrapper)
				{
					_destroy(this.element);
					var wrapper = this.element;
					wrapper.after(
				this.originalElement.css({
					position: wrapper.css('position'),
					width: wrapper.outerWidth(),
					height: wrapper.outerHeight(),
					top: wrapper.css('top'),
					left: wrapper.css('left')
				})
			).remove();
				}

				this.originalElement.css('resize', this.originalResizeStyle);
				_destroy(this.originalElement);

				return this;
			},

			_mouseCapture: function (event)
			{
				var handle = false;
				for (var i in this.handles)
				{
					if ($(this.handles[i])[0] == event.target)
					{
						handle = true;
					}
				}

				return !this.options.disabled && handle;
			},

			_mouseStart: function (event)
			{

				var o = this.options, iniPos = this.element.position(), el = this.element;

				this.resizing = true;
				this.documentScroll = { top: $(document).scrollTop(), left: $(document).scrollLeft() };

				// bugfix for http://dev.jquery.com/ticket/1749
				if (el.is('.ui-draggable') || (/absolute/).test(el.css('position')))
				{
					el.css({ position: 'absolute', top: iniPos.top, left: iniPos.left });
				}

				//Opera fixing relative position
				if ($.browser.opera && (/relative/).test(el.css('position')))
					el.css({ position: 'relative', top: 'auto', left: 'auto' });

				this._renderProxy();

				var curleft = num(this.helper.css('left')), curtop = num(this.helper.css('top'));

				if (o.containment)
				{
					curleft += $(o.containment).scrollLeft() || 0;
					curtop += $(o.containment).scrollTop() || 0;
				}

				//Store needed variables
				this.offset = this.helper.offset();
				this.position = { left: curleft, top: curtop };
				this.size = this._helper ? { width: el.outerWidth(), height: el.outerHeight()} : { width: el.width(), height: el.height() };
				this.originalSize = this._helper ? { width: el.outerWidth(), height: el.outerHeight()} : { width: el.width(), height: el.height() };
				this.originalPosition = { left: curleft, top: curtop };
				this.sizeDiff = { width: el.outerWidth() - el.width(), height: el.outerHeight() - el.height() };
				this.originalMousePosition = { left: event.pageX, top: event.pageY };

				//Aspect Ratio
				this.aspectRatio = (typeof o.aspectRatio == 'number') ? o.aspectRatio : ((this.originalSize.width / this.originalSize.height) || 1);

				var cursor = $('.ui-resizable-' + this.axis).css('cursor');
				$('body').css('cursor', cursor == 'auto' ? this.axis + '-resize' : cursor);

				el.addClass("ui-resizable-resizing");
				this._propagate("start", event);
				return true;
			},

			_mouseDrag: function (event)
			{

				//Increase performance, avoid regex
				var el = this.helper, o = this.options, props = {},
			self = this, smp = this.originalMousePosition, a = this.axis;

				var dx = (event.pageX - smp.left) || 0, dy = (event.pageY - smp.top) || 0;
				var trigger = this._change[a];
				if (!trigger) return false;

				// Calculate the attrs that will be change
				var data = trigger.apply(this, [event, dx, dy]), ie6 = $.browser.msie && $.browser.version < 7, csdif = this.sizeDiff;

				if (this._aspectRatio || event.shiftKey)
					data = this._updateRatio(data, event);

				data = this._respectSize(data, event);

				// plugins callbacks need to be called first
				this._propagate("resize", event);

				el.css({
					top: this.position.top + "px", left: this.position.left + "px",
					width: this.size.width + "px", height: this.size.height + "px"
				});

				if (!this._helper && this._proportionallyResizeElements.length)
					this._proportionallyResize();

				this._updateCache(data);

				// calling the user callback at the end
				this._trigger('resize', event, this.ui());

				return false;
			},

			_mouseStop: function (event)
			{

				this.resizing = false;
				var o = this.options, self = this;

				if (this._helper)
				{
					var pr = this._proportionallyResizeElements, ista = pr.length && (/textarea/i).test(pr[0].nodeName),
				soffseth = ista && $.ui.hasScroll(pr[0], 'left') /* TODO - jump height */ ? 0 : self.sizeDiff.height,
				soffsetw = ista ? 0 : self.sizeDiff.width;

					var s = { width: (self.helper.width() - soffsetw), height: (self.helper.height() - soffseth) },
				left = (parseInt(self.element.css('left'), 10) + (self.position.left - self.originalPosition.left)) || null,
				top = (parseInt(self.element.css('top'), 10) + (self.position.top - self.originalPosition.top)) || null;

					if (!o.animate)
						this.element.css($.extend(s, { top: top, left: left }));

					self.helper.height(self.size.height);
					self.helper.width(self.size.width);

					if (this._helper && !o.animate) this._proportionallyResize();
				}

				$('body').css('cursor', 'auto');

				this.element.removeClass("ui-resizable-resizing");

				this._propagate("stop", event);

				if (this._helper) this.helper.remove();
				return false;

			},

			_updateCache: function (data)
			{
				var o = this.options;
				this.offset = this.helper.offset();
				if (isNumber(data.left)) this.position.left = data.left;
				if (isNumber(data.top)) this.position.top = data.top;
				if (isNumber(data.height)) this.size.height = data.height;
				if (isNumber(data.width)) this.size.width = data.width;
			},

			_updateRatio: function (data, event)
			{

				var o = this.options, cpos = this.position, csize = this.size, a = this.axis;

				if (data.height) data.width = (csize.height * this.aspectRatio);
				else if (data.width) data.height = (csize.width / this.aspectRatio);

				if (a == 'sw')
				{
					data.left = cpos.left + (csize.width - data.width);
					data.top = null;
				}
				if (a == 'nw')
				{
					data.top = cpos.top + (csize.height - data.height);
					data.left = cpos.left + (csize.width - data.width);
				}

				return data;
			},

			_respectSize: function (data, event)
			{

				var el = this.helper, o = this.options, pRatio = this._aspectRatio || event.shiftKey, a = this.axis,
				ismaxw = isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width), ismaxh = isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
					isminw = isNumber(data.width) && o.minWidth && (o.minWidth > data.width), isminh = isNumber(data.height) && o.minHeight && (o.minHeight > data.height);

				if (isminw) data.width = o.minWidth;
				if (isminh) data.height = o.minHeight;
				if (ismaxw) data.width = o.maxWidth;
				if (ismaxh) data.height = o.maxHeight;

				var dw = this.originalPosition.left + this.originalSize.width, dh = this.position.top + this.size.height;
				var cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);

				if (isminw && cw) data.left = dw - o.minWidth;
				if (ismaxw && cw) data.left = dw - o.maxWidth;
				if (isminh && ch) data.top = dh - o.minHeight;
				if (ismaxh && ch) data.top = dh - o.maxHeight;

				// fixing jump error on top/left - bug #2330
				var isNotwh = !data.width && !data.height;
				if (isNotwh && !data.left && data.top) data.top = null;
				else if (isNotwh && !data.top && data.left) data.left = null;

				return data;
			},

			_proportionallyResize: function ()
			{

				var o = this.options;
				if (!this._proportionallyResizeElements.length) return;
				var element = this.helper || this.element;

				for (var i = 0; i < this._proportionallyResizeElements.length; i++)
				{

					var prel = this._proportionallyResizeElements[i];

					if (!this.borderDif)
					{
						var b = [prel.css('borderTopWidth'), prel.css('borderRightWidth'), prel.css('borderBottomWidth'), prel.css('borderLeftWidth')],
					p = [prel.css('paddingTop'), prel.css('paddingRight'), prel.css('paddingBottom'), prel.css('paddingLeft')];

						this.borderDif = $.map(b, function (v, i)
						{
							var border = parseInt(v, 10) || 0, padding = parseInt(p[i], 10) || 0;
							return border + padding;
						});
					}

					if ($.browser.msie && !(!($(element).is(':hidden') || $(element).parents(':hidden').length)))
						continue;

					prel.css({
						height: (element.height() - this.borderDif[0] - this.borderDif[2]) || 0,
						width: (element.width() - this.borderDif[1] - this.borderDif[3]) || 0
					});

				};

			},

			_renderProxy: function ()
			{

				var el = this.element, o = this.options;
				this.elementOffset = el.offset();

				if (this._helper)
				{

					this.helper = this.helper || $('<div style="overflow:hidden;"></div>');

					// fix ie6 offset TODO: This seems broken
					var ie6 = $.browser.msie && $.browser.version < 7, ie6offset = (ie6 ? 1 : 0),
			pxyoffset = (ie6 ? 2 : -1);

					this.helper.addClass(this._helper).css({
						width: this.element.outerWidth() + pxyoffset,
						height: this.element.outerHeight() + pxyoffset,
						position: 'absolute',
						left: this.elementOffset.left - ie6offset + 'px',
						top: this.elementOffset.top - ie6offset + 'px',
						zIndex: ++o.zIndex //TODO: Don't modify option
					});

					this.helper
				.appendTo("body")
				.disableSelection();

				} else
				{
					this.helper = this.element;
				}

			},

			_change: {
				e: function (event, dx, dy)
				{
					return { width: this.originalSize.width + dx };
				},
				w: function (event, dx, dy)
				{
					var o = this.options, cs = this.originalSize, sp = this.originalPosition;
					return { left: sp.left + dx, width: cs.width - dx };
				},
				n: function (event, dx, dy)
				{
					var o = this.options, cs = this.originalSize, sp = this.originalPosition;
					return { top: sp.top + dy, height: cs.height - dy };
				},
				s: function (event, dx, dy)
				{
					return { height: this.originalSize.height + dy };
				},
				se: function (event, dx, dy)
				{
					return $.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
				},
				sw: function (event, dx, dy)
				{
					return $.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
				},
				ne: function (event, dx, dy)
				{
					return $.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
				},
				nw: function (event, dx, dy)
				{
					return $.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
				}
			},

			_propagate: function (n, event)
			{
				$.ui.plugin.call(this, n, [event, this.ui()]);
				(n != "resize" && this._trigger(n, event, this.ui()));
			},

			plugins: {},

			ui: function ()
			{
				return {
					originalElement: this.originalElement,
					element: this.element,
					helper: this.helper,
					position: this.position,
					size: this.size,
					originalSize: this.originalSize,
					originalPosition: this.originalPosition
				};
			}

		});

		$.extend($.ui.resizable, {
			version: "@VERSION"
		});

		/*
		* Resizable Extensions
		*/

		$.ui.plugin.add("resizable", "alsoResize", {

			start: function (event, ui)
			{
				var self = $(this).data("resizable"), o = self.options;

				var _store = function (exp)
				{
					$(exp).each(function ()
					{
						var el = $(this);
						el.data("resizable-alsoresize", {
							width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
							left: parseInt(el.css('left'), 10), top: parseInt(el.css('top'), 10),
							position: el.css('position') // to reset Opera on stop()
						});
					});
				};

				if (typeof (o.alsoResize) == 'object' && !o.alsoResize.parentNode)
				{
					if (o.alsoResize.length) { o.alsoResize = o.alsoResize[0]; _store(o.alsoResize); }
					else { $.each(o.alsoResize, function (exp) { _store(exp); }); }
				} else
				{
					_store(o.alsoResize);
				}
			},

			resize: function (event, ui)
			{
				var self = $(this).data("resizable"), o = self.options, os = self.originalSize, op = self.originalPosition;

				var delta = {
					height: (self.size.height - os.height) || 0, width: (self.size.width - os.width) || 0,
					top: (self.position.top - op.top) || 0, left: (self.position.left - op.left) || 0
				},

		_alsoResize = function (exp, c)
		{
			$(exp).each(function ()
			{
				var el = $(this), start = $(this).data("resizable-alsoresize"), style = {},
					css = c && c.length ? c : el.parents(ui.originalElement[0]).length ? ['width', 'height'] : ['width', 'height', 'top', 'left'];

				$.each(css, function (i, prop)
				{
					var sum = (start[prop] || 0) + (delta[prop] || 0);
					if (sum && sum >= 0)
						style[prop] = sum || null;
				});

				// Opera fixing relative position
				if ($.browser.opera && /relative/.test(el.css('position')))
				{
					self._revertToRelativePosition = true;
					el.css({ position: 'absolute', top: 'auto', left: 'auto' });
				}

				el.css(style);
			});
		};

				if (typeof (o.alsoResize) == 'object' && !o.alsoResize.nodeType)
				{
					$.each(o.alsoResize, function (exp, c) { _alsoResize(exp, c); });
				} else
				{
					_alsoResize(o.alsoResize);
				}
			},

			stop: function (event, ui)
			{
				var self = $(this).data("resizable"), o = self.options;

				var _reset = function (exp)
				{
					$(exp).each(function ()
					{
						var el = $(this);
						// reset position for Opera - no need to verify it was changed
						el.css({ position: el.data("resizable-alsoresize").position });
					});
				};

				if (self._revertToRelativePosition)
				{
					self._revertToRelativePosition = false;
					if (typeof (o.alsoResize) == 'object' && !o.alsoResize.nodeType)
					{
						$.each(o.alsoResize, function (exp) { _reset(exp); });
					} else
					{
						_reset(o.alsoResize);
					}
				}

				$(this).removeData("resizable-alsoresize");
			}
		});

		$.ui.plugin.add("resizable", "animate", {

			stop: function (event, ui)
			{
				var self = $(this).data("resizable"), o = self.options;

				var pr = self._proportionallyResizeElements, ista = pr.length && (/textarea/i).test(pr[0].nodeName),
					soffseth = ista && $.ui.hasScroll(pr[0], 'left') /* TODO - jump height */ ? 0 : self.sizeDiff.height,
						soffsetw = ista ? 0 : self.sizeDiff.width;

				var style = { width: (self.size.width - soffsetw), height: (self.size.height - soffseth) },
					left = (parseInt(self.element.css('left'), 10) + (self.position.left - self.originalPosition.left)) || null,
						top = (parseInt(self.element.css('top'), 10) + (self.position.top - self.originalPosition.top)) || null;

				self.element.animate(
			$.extend(style, top && left ? { top: top, left: left} : {}), {
				duration: o.animateDuration,
				easing: o.animateEasing,
				step: function ()
				{

					var data = {
						width: parseInt(self.element.css('width'), 10),
						height: parseInt(self.element.css('height'), 10),
						top: parseInt(self.element.css('top'), 10),
						left: parseInt(self.element.css('left'), 10)
					};

					if (pr && pr.length) $(pr[0]).css({ width: data.width, height: data.height });

					// propagating resize, and updating values for each animation step
					self._updateCache(data);
					self._propagate("resize", event);

				}
			}
		);
			}

		});

		$.ui.plugin.add("resizable", "containment", {

			start: function (event, ui)
			{
				var self = $(this).data("resizable"), o = self.options, el = self.element;
				var oc = o.containment, ce = (oc instanceof $) ? oc.get(0) : (/parent/.test(oc)) ? el.parent().get(0) : oc;
				if (!ce) return;

				self.containerElement = $(ce);

				if (/document/.test(oc) || oc == document)
				{
					self.containerOffset = { left: 0, top: 0 };
					self.containerPosition = { left: 0, top: 0 };

					self.parentData = {
						element: $(document), left: 0, top: 0,
						width: $(document).width(), height: $(document).height() || document.body.parentNode.scrollHeight
					};
				}

				// i'm a node, so compute top, left, right, bottom
				else
				{
					var element = $(ce), p = [];
					$(["Top", "Right", "Left", "Bottom"]).each(function (i, name) { p[i] = num(element.css("padding" + name)); });

					self.containerOffset = element.offset();
					self.containerPosition = element.position();
					self.containerSize = { height: (element.innerHeight() - p[3]), width: (element.innerWidth() - p[1]) };

					var co = self.containerOffset, ch = self.containerSize.height, cw = self.containerSize.width,
						width = ($.ui.hasScroll(ce, "left") ? ce.scrollWidth : cw), height = ($.ui.hasScroll(ce) ? ce.scrollHeight : ch);

					self.parentData = {
						element: ce, left: co.left, top: co.top, width: width, height: height
					};
				}
			},

			resize: function (event, ui)
			{
				var self = $(this).data("resizable"), o = self.options,
				ps = self.containerSize, co = self.containerOffset, cs = self.size, cp = self.position,
				pRatio = self._aspectRatio || event.shiftKey, cop = { top: 0, left: 0 }, ce = self.containerElement;

				if (ce[0] != document && (/static/).test(ce.css('position'))) cop = co;

				if (cp.left < (self._helper ? co.left : 0))
				{
					self.size.width = self.size.width + (self._helper ? (self.position.left - co.left) : (self.position.left - cop.left));
					if (pRatio) self.size.height = self.size.width / o.aspectRatio;
					self.position.left = o.helper ? co.left : 0;
				}

				if (cp.top < (self._helper ? co.top : 0))
				{
					self.size.height = self.size.height + (self._helper ? (self.position.top - co.top) : self.position.top);
					if (pRatio) self.size.width = self.size.height * o.aspectRatio;
					self.position.top = self._helper ? co.top : 0;
				}

				self.offset.left = self.parentData.left + self.position.left;
				self.offset.top = self.parentData.top + self.position.top;

				var woset = Math.abs((self._helper ? self.offset.left - cop.left : (self.offset.left - cop.left)) + self.sizeDiff.width),
					hoset = Math.abs((self._helper ? self.offset.top - cop.top : (self.offset.top - co.top)) + self.sizeDiff.height);

				var isParent = self.containerElement.get(0) == self.element.parent().get(0),
		    isOffsetRelative = /relative|absolute/.test(self.containerElement.css('position'));

				if (isParent && isOffsetRelative) woset -= self.parentData.left;

				if (woset + self.size.width >= self.parentData.width)
				{
					self.size.width = self.parentData.width - woset;
					if (pRatio) self.size.height = self.size.width / self.aspectRatio;
				}

				if (hoset + self.size.height >= self.parentData.height)
				{
					self.size.height = self.parentData.height - hoset;
					if (pRatio) self.size.width = self.size.height * self.aspectRatio;
				}
			},

			stop: function (event, ui)
			{
				var self = $(this).data("resizable"), o = self.options, cp = self.position,
				co = self.containerOffset, cop = self.containerPosition, ce = self.containerElement;

				var helper = $(self.helper), ho = helper.offset(), w = helper.outerWidth() - self.sizeDiff.width, h = helper.outerHeight() - self.sizeDiff.height;

				if (self._helper && !o.animate && (/relative/).test(ce.css('position')))
					$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });

				if (self._helper && !o.animate && (/static/).test(ce.css('position')))
					$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });

			}
		});

		$.ui.plugin.add("resizable", "ghost", {

			start: function (event, ui)
			{

				var self = $(this).data("resizable"), o = self.options, cs = self.size;

				self.ghost = self.originalElement.clone();
				self.ghost
			.css({ opacity: .25, display: 'block', position: 'relative', height: cs.height, width: cs.width, margin: 0, left: 0, top: 0 })
			.addClass('ui-resizable-ghost')
			.addClass(typeof o.ghost == 'string' ? o.ghost : '');

				self.ghost.appendTo(self.helper);

			},

			resize: function (event, ui)
			{
				var self = $(this).data("resizable"), o = self.options;
				if (self.ghost) self.ghost.css({ position: 'relative', height: self.size.height, width: self.size.width });
			},

			stop: function (event, ui)
			{
				var self = $(this).data("resizable"), o = self.options;
				if (self.ghost && self.helper) self.helper.get(0).removeChild(self.ghost.get(0));
			}

		});

		$.ui.plugin.add("resizable", "grid", {

			resize: function (event, ui)
			{
				var self = $(this).data("resizable"), o = self.options, cs = self.size, os = self.originalSize, op = self.originalPosition, a = self.axis, ratio = o._aspectRatio || event.shiftKey;
				o.grid = typeof o.grid == "number" ? [o.grid, o.grid] : o.grid;
				var ox = Math.round((cs.width - os.width) / (o.grid[0] || 1)) * (o.grid[0] || 1), oy = Math.round((cs.height - os.height) / (o.grid[1] || 1)) * (o.grid[1] || 1);

				if (/^(se|s|e)$/.test(a))
				{
					self.size.width = os.width + ox;
					self.size.height = os.height + oy;
				}
				else if (/^(ne)$/.test(a))
				{
					self.size.width = os.width + ox;
					self.size.height = os.height + oy;
					self.position.top = op.top - oy;
				}
				else if (/^(sw)$/.test(a))
				{
					self.size.width = os.width + ox;
					self.size.height = os.height + oy;
					self.position.left = op.left - ox;
				}
				else
				{
					self.size.width = os.width + ox;
					self.size.height = os.height + oy;
					self.position.top = op.top - oy;
					self.position.left = op.left - ox;
				}
			}

		});

		var num = function (v)
		{
			return parseInt(v, 10) || 0;
		};

		var isNumber = function (value)
		{
			return !isNaN(parseInt(value, 10));
		};

	})($j);

	/*
	* jQuery UI Dialog @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Dialog
	*
	* Depends:
	*	jquery.ui.core.js
	*	jquery.ui.widget.js
	*  jquery.ui.button.js
	*	jquery.ui.draggable.js
	*	jquery.ui.mouse.js
	*	jquery.ui.position.js
	*	jquery.ui.resizable.js
	*/
	(function ($, undefined)
	{

		var uiDialogClasses =
		'ui-dialog ' +
		'ui-widget ' +
		'ui-widget-content ' +
		'ui-corner-all ',
	sizeRelatedOptions = {
		buttons: true,
		height: true,
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true,
		width: true
	},
	resizableRelatedOptions = {
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true
	};

		$.widget("ui.dialog", {
			options: {
				autoOpen: true,
				buttons: {},
				closeOnEscape: true,
				closeText: 'close',
				dialogClass: '',
				draggable: true,
				hide: null,
				height: 'auto',
				maxHeight: false,
				maxWidth: false,
				minHeight: 150,
				minWidth: 150,
				modal: false,
				position: {
					my: 'center',
					at: 'center',
					collision: 'fit',
					// ensure that the titlebar is never outside the document
					using: function (pos)
					{
						var topOffset = $(this).css(pos).offset().top;
						if (topOffset < 0)
						{
							$(this).css('top', pos.top - topOffset);
						}
					}
				},
				resizable: true,
				show: null,
				stack: true,
				title: '',
				width: 300,
				zIndex: 1000
			},

			_create: function ()
			{
				this.originalTitle = this.element.attr('title');
				// #5742 - .attr() might return a DOMElement
				if (typeof this.originalTitle !== "string")
				{
					this.originalTitle = "";
				}

				this.options.title = this.options.title || this.originalTitle;
				var self = this,
			options = self.options,

			title = options.title || '&#160;',
			titleId = $.ui.dialog.getTitleId(self.element),

			uiDialog = (self.uiDialog = $('<div></div>'))
				.appendTo(document.body)
				.hide()
				.addClass(uiDialogClasses + options.dialogClass)
				.css({
					zIndex: options.zIndex
				})
				// setting tabIndex makes the div focusable
				// setting outline to 0 prevents a border on focus in Mozilla
				.attr('tabIndex', -1).css('outline', 0).keydown(function (event)
				{
					if (options.closeOnEscape && event.keyCode &&
						event.keyCode === $.ui.keyCode.ESCAPE)
					{

						self.close(event);
						event.preventDefault();
					}
				})
				.attr({
					role: 'dialog',
					'aria-labelledby': titleId
				})
				.mousedown(function (event)
				{
					self.moveToTop(false, event);
				}),

			uiDialogContent = self.element
				.show()
				.removeAttr('title')
				.addClass(
					'ui-dialog-content ' +
					'ui-widget-content')
				.appendTo(uiDialog),

			uiDialogTitlebar = (self.uiDialogTitlebar = $('<div></div>'))
				.addClass(
					'ui-dialog-titlebar ' +
					'ui-widget-header ' +
					'ui-corner-all ' +
					'ui-helper-clearfix'
				)
				.prependTo(uiDialog),

			uiDialogTitlebarClose = $('<a href="#"></a>')
				.addClass(
					'ui-dialog-titlebar-close ' +
					'ui-corner-all'
				)
				.attr('role', 'button')
				.hover(
					function ()
					{
						uiDialogTitlebarClose.addClass('ui-state-hover');
					},
					function ()
					{
						uiDialogTitlebarClose.removeClass('ui-state-hover');
					}
				)
				.focus(function ()
				{
					uiDialogTitlebarClose.addClass('ui-state-focus');
				})
				.blur(function ()
				{
					uiDialogTitlebarClose.removeClass('ui-state-focus');
				})
				.click(function (event)
				{
					self.close(event);
					return false;
				})
				.appendTo(uiDialogTitlebar),

			uiDialogTitlebarCloseText = (self.uiDialogTitlebarCloseText = $('<span></span>'))
				.addClass(
					'ui-icon ' +
					'ui-icon-closethick'
				)
				.text(options.closeText)
				.appendTo(uiDialogTitlebarClose),

			uiDialogTitle = $('<span></span>')
				.addClass('ui-dialog-title')
				.attr('id', titleId)
				.html(title)
				.prependTo(uiDialogTitlebar);

				//handling of deprecated beforeclose (vs beforeClose) option
				//Ticket #4669 http://dev.jqueryui.com/ticket/4669
				//TODO: remove in 1.9pre
				if ($.isFunction(options.beforeclose) && !$.isFunction(options.beforeClose))
				{
					options.beforeClose = options.beforeclose;
				}

				uiDialogTitlebar.find("*").add(uiDialogTitlebar).disableSelection();

				if (options.draggable && $.fn.draggable)
				{
					self._makeDraggable();
				}
				if (options.resizable && $.fn.resizable)
				{
					self._makeResizable();
				}

				self._createButtons(options.buttons);
				self._isOpen = false;

				if ($.fn.bgiframe)
				{
					uiDialog.bgiframe();
				}
			},

			_init: function ()
			{
				if (this.options.autoOpen)
				{
					this.open();
				}
			},

			destroy: function ()
			{
				var self = this;

				if (self.overlay)
				{
					self.overlay.destroy();
				}
				self.uiDialog.hide();
				self.element
			.unbind('.dialog')
			.removeData('dialog')
			.removeClass('ui-dialog-content ui-widget-content')
			.hide().appendTo('body');
				self.uiDialog.remove();

				if (self.originalTitle)
				{
					self.element.attr('title', self.originalTitle);
				}

				return self;
			},

			widget: function ()
			{
				return this.uiDialog;
			},

			close: function (event)
			{
				var self = this,
			maxZ, thisZ;

				if (false === self._trigger('beforeClose', event))
				{
					return;
				}

				if (self.overlay)
				{
					self.overlay.destroy();
				}
				self.uiDialog.unbind('keypress.ui-dialog');

				self._isOpen = false;

				if (self.options.hide)
				{
					self.uiDialog.hide(self.options.hide, function ()
					{
						self._trigger('close', event);
					});
				} else
				{
					self.uiDialog.hide();
					self._trigger('close', event);
				}

				$.ui.dialog.overlay.resize();

				// adjust the maxZ to allow other modal dialogs to continue to work (see #4309)
				if (self.options.modal)
				{
					maxZ = 0;
					$('.ui-dialog').each(function ()
					{
						if (this !== self.uiDialog[0])
						{
							thisZ = $(this).css('z-index');
							if (!isNaN(thisZ))
							{
								maxZ = Math.max(maxZ, thisZ);
							}
						}
					});
					$.ui.dialog.maxZ = maxZ;
				}

				return self;
			},

			isOpen: function ()
			{
				return this._isOpen;
			},

			// the force parameter allows us to move modal dialogs to their correct
			// position on open
			moveToTop: function (force, event)
			{
				var self = this,
			options = self.options,
			saveScroll;

				if ((options.modal && !force) ||
			(!options.stack && !options.modal))
				{
					return self._trigger('focus', event);
				}

				if (options.zIndex > $.ui.dialog.maxZ)
				{
					$.ui.dialog.maxZ = options.zIndex;
				}
				if (self.overlay)
				{
					$.ui.dialog.maxZ += 1;
					self.overlay.$el.css('z-index', $.ui.dialog.overlay.maxZ = $.ui.dialog.maxZ);
				}

				//Save and then restore scroll since Opera 9.5+ resets when parent z-Index is changed.
				//  http://ui.jquery.com/bugs/ticket/3193
				saveScroll = { scrollTop: self.element.attr('scrollTop'), scrollLeft: self.element.attr('scrollLeft') };
				$.ui.dialog.maxZ += 1;
				self.uiDialog.css('z-index', $.ui.dialog.maxZ);
				self.element.attr(saveScroll);
				self._trigger('focus', event);

				return self;
			},

			open: function ()
			{
				if (this._isOpen) { return; }

				var self = this,
			options = self.options,
			uiDialog = self.uiDialog;

				self.overlay = options.modal ? new $.ui.dialog.overlay(self) : null;
				self._size();
				self._position(options.position);
				uiDialog.show(options.show);
				self.moveToTop(true);

				// prevent tabbing out of modal dialogs
				if (options.modal)
				{
					uiDialog.bind('keypress.ui-dialog', function (event)
					{
						if (event.keyCode !== $.ui.keyCode.TAB)
						{
							return;
						}

						var tabbables = $(':tabbable', this),
					first = tabbables.filter(':first'),
					last = tabbables.filter(':last');

						if (event.target === last[0] && !event.shiftKey)
						{
							first.focus(1);
							return false;
						} else if (event.target === first[0] && event.shiftKey)
						{
							last.focus(1);
							return false;
						}
					});
				}

				// set focus to the first tabbable element in the content area or the first button
				// if there are no tabbable elements, set focus on the dialog itself
				$(self.element.find(':tabbable').get().concat(
			uiDialog.find('.ui-dialog-buttonpane :tabbable').get().concat(
				uiDialog.get()))).eq(0).focus();

				self._isOpen = true;
				self._trigger('open');

				return self;
			},

			_createButtons: function (buttons)
			{
				var self = this,
			hasButtons = false,
			uiDialogButtonPane = $('<div></div>')
				.addClass(
					'ui-dialog-buttonpane ' +
					'ui-widget-content ' +
					'ui-helper-clearfix'
				),
			uiButtonSet = $("<div></div>")
				.addClass("ui-dialog-buttonset")
				.appendTo(uiDialogButtonPane);

				// if we already have a button pane, remove it
				self.uiDialog.find('.ui-dialog-buttonpane').remove();

				if (typeof buttons === 'object' && buttons !== null)
				{
					$.each(buttons, function ()
					{
						return !(hasButtons = true);
					});
				}
				if (hasButtons)
				{
					$.each(buttons, function (name, props)
					{
						props = $.isFunction(props) ?
					{ click: props, text: name} :
					props;
						var button = $('<button type="button"></button>')
					.attr(props, true)
					.unbind('click')
					.click(function ()
					{
						props.click.apply(self.element[0], arguments);
					})
					.appendTo(uiButtonSet);
						if ($.fn.button)
						{
							button.button();
						}
					});
					uiDialogButtonPane.appendTo(self.uiDialog);
				}
			},

			_makeDraggable: function ()
			{
				var self = this,
			options = self.options,
			doc = $(document),
			heightBeforeDrag;

				function filteredUi(ui)
				{
					return {
						position: ui.position,
						offset: ui.offset
					};
				}

				self.uiDialog.draggable({
					cancel: '.ui-dialog-content, .ui-dialog-titlebar-close',
					handle: '.ui-dialog-titlebar',
					containment: 'document',
					start: function (event, ui)
					{
						heightBeforeDrag = options.height === "auto" ? "auto" : $(this).height();
						$(this).height($(this).height()).addClass("ui-dialog-dragging");
						self._trigger('dragStart', event, filteredUi(ui));
					},
					drag: function (event, ui)
					{
						self._trigger('drag', event, filteredUi(ui));
					},
					stop: function (event, ui)
					{
						options.position = [ui.position.left - doc.scrollLeft(),
					ui.position.top - doc.scrollTop()];
						$(this).removeClass("ui-dialog-dragging").height(heightBeforeDrag);
						self._trigger('dragStop', event, filteredUi(ui));
						$.ui.dialog.overlay.resize();
					}
				});
			},

			_makeResizable: function (handles)
			{
				handles = (handles === undefined ? this.options.resizable : handles);
				var self = this,
			options = self.options,
				// .ui-resizable has position: relative defined in the stylesheet
				// but dialogs have to use absolute or fixed positioning
			position = self.uiDialog.css('position'),
			resizeHandles = (typeof handles === 'string' ?
				handles :
				'n,e,s,w,se,sw,ne,nw'
			);

				function filteredUi(ui)
				{
					return {
						originalPosition: ui.originalPosition,
						originalSize: ui.originalSize,
						position: ui.position,
						size: ui.size
					};
				}

				self.uiDialog.resizable({
					cancel: '.ui-dialog-content',
					containment: 'document',
					alsoResize: self.element,
					maxWidth: options.maxWidth,
					maxHeight: options.maxHeight,
					minWidth: options.minWidth,
					minHeight: self._minHeight(),
					handles: resizeHandles,
					start: function (event, ui)
					{
						$(this).addClass("ui-dialog-resizing");
						self._trigger('resizeStart', event, filteredUi(ui));
					},
					resize: function (event, ui)
					{
						self._trigger('resize', event, filteredUi(ui));
					},
					stop: function (event, ui)
					{
						$(this).removeClass("ui-dialog-resizing");
						options.height = $(this).height();
						options.width = $(this).width();
						self._trigger('resizeStop', event, filteredUi(ui));
						$.ui.dialog.overlay.resize();
					}
				})
		.css('position', position)
		.find('.ui-resizable-se').addClass('ui-icon ui-icon-grip-diagonal-se');
			},

			_minHeight: function ()
			{
				var options = this.options;

				if (options.height === 'auto')
				{
					return options.minHeight;
				} else
				{
					return Math.min(options.minHeight, options.height);
				}
			},

			_position: function (position)
			{
				var myAt = [],
			offset = [0, 0],
			isVisible;

				if (position)
				{
					// deep extending converts arrays to objects in jQuery <= 1.3.2 :-(
					//		if (typeof position == 'string' || $.isArray(position)) {
					//			myAt = $.isArray(position) ? position : position.split(' ');

					if (typeof position === 'string' || (typeof position === 'object' && '0' in position))
					{
						myAt = position.split ? position.split(' ') : [position[0], position[1]];
						if (myAt.length === 1)
						{
							myAt[1] = myAt[0];
						}

						$.each(['left', 'top'], function (i, offsetPosition)
						{
							if (+myAt[i] === myAt[i])
							{
								offset[i] = myAt[i];
								myAt[i] = offsetPosition;
							}
						});

						position = {
							my: myAt.join(" "),
							at: myAt.join(" "),
							offset: offset.join(" ")
						};
					}

					position = $.extend({}, $.ui.dialog.prototype.options.position, position);
				} else
				{
					position = $.ui.dialog.prototype.options.position;
				}

				// need to show the dialog to get the actual offset in the position plugin
				isVisible = this.uiDialog.is(':visible');
				if (!isVisible)
				{
					this.uiDialog.show();
				}
				this.uiDialog
				// workaround for jQuery bug #5781 http://dev.jquery.com/ticket/5781
			.css({ top: 0, left: 0 })
			.position($.extend({ of: window }, position));
				if (!isVisible)
				{
					this.uiDialog.hide();
				}
			},

			_setOptions: function (options)
			{
				var self = this,
			resizableOptions = {},
			resize = false;

				$.each(options, function (key, value)
				{
					self._setOption(key, value);

					if (key in sizeRelatedOptions)
					{
						resize = true;
					}
					if (key in resizableRelatedOptions)
					{
						resizableOptions[key] = value;
					}
				});

				if (resize)
				{
					this._size();
				}
				if (this.uiDialog.is(":data(resizable)"))
				{
					this.uiDialog.resizable("option", resizableOptions);
				}
			},

			_setOption: function (key, value)
			{
				var self = this,
			uiDialog = self.uiDialog;

				switch (key)
				{
					//handling of deprecated beforeclose (vs beforeClose) option   
					//Ticket #4669 http://dev.jqueryui.com/ticket/4669   
					//TODO: remove in 1.9pre   
					case "beforeclose":
						key = "beforeClose";
						break;
					case "buttons":
						self._createButtons(value);
						break;
					case "closeText":
						// ensure that we always pass a string
						self.uiDialogTitlebarCloseText.text("" + value);
						break;
					case "dialogClass":
						uiDialog
					.removeClass(self.options.dialogClass)
					.addClass(uiDialogClasses + value);
						break;
					case "disabled":
						if (value)
						{
							uiDialog.addClass('ui-dialog-disabled');
						} else
						{
							uiDialog.removeClass('ui-dialog-disabled');
						}
						break;
					case "draggable":
						var isDraggable = uiDialog.is(":data(draggable)");
						if (isDraggable && !value)
						{
							uiDialog.draggable("destroy");
						}

						if (!isDraggable && value)
						{
							self._makeDraggable();
						}
						break;
					case "position":
						self._position(value);
						break;
					case "resizable":
						// currently resizable, becoming non-resizable
						var isResizable = uiDialog.is(":data(resizable)");
						if (isResizable && !value)
						{
							uiDialog.resizable('destroy');
						}

						// currently resizable, changing handles
						if (isResizable && typeof value === 'string')
						{
							uiDialog.resizable('option', 'handles', value);
						}

						// currently non-resizable, becoming resizable
						if (!isResizable && value !== false)
						{
							self._makeResizable(value);
						}
						break;
					case "title":
						// convert whatever was passed in o a string, for html() to not throw up
						$(".ui-dialog-title", self.uiDialogTitlebar).html("" + (value || '&#160;'));
						break;
				}

				$.Widget.prototype._setOption.apply(self, arguments);
			},

			_size: function ()
			{
				/* If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
				* divs will both have width and height set, so we need to reset them
				*/
				var options = this.options,
			nonContentHeight,
			minContentHeight,
			isVisible = this.uiDialog.is(":visible");

				// reset content sizing
				this.element.show().css({
					width: 'auto',
					minHeight: 0,
					height: 0
				});

				if (options.minWidth > options.width)
				{
					options.width = options.minWidth;
				}

				// reset wrapper sizing
				// determine the height of all the non-content elements
				nonContentHeight = this.uiDialog.css({
					height: 'auto',
					width: options.width
				})
			.height();
				minContentHeight = Math.max(0, options.minHeight - nonContentHeight);

				if (options.height === "auto")
				{
					// only needed for IE6 support
					if ($.support.minHeight)
					{
						this.element.css({
							minHeight: minContentHeight,
							height: "auto"
						});
					} else
					{
						this.uiDialog.show();
						var autoHeight = this.element.css("height", "auto").height();
						if (!isVisible)
						{
							this.uiDialog.hide();
						}
						this.element.height(Math.max(autoHeight, minContentHeight));
					}
				} else
				{
					this.element.height(Math.max(options.height - nonContentHeight, 0));
				}

				if (this.uiDialog.is(':data(resizable)'))
				{
					this.uiDialog.resizable('option', 'minHeight', this._minHeight());
				}
			}
		});

		$.extend($.ui.dialog, {
			version: "@VERSION",

			uuid: 0,
			maxZ: 0,

			getTitleId: function ($el)
			{
				var id = $el.attr('id');
				if (!id)
				{
					this.uuid += 1;
					id = this.uuid;
				}
				return 'ui-dialog-title-' + id;
			},

			overlay: function (dialog)
			{
				this.$el = $.ui.dialog.overlay.create(dialog);
			}
		});

		$.extend($.ui.dialog.overlay, {
			instances: [],
			// reuse old instances due to IE memory leak with alpha transparency (see #5185)
			oldInstances: [],
			maxZ: 0,
			events: $.map('focus,mousedown,mouseup,keydown,keypress,click'.split(','),
		function (event) { return event + '.dialog-overlay'; }).join(' '),
			create: function (dialog)
			{
				if (this.instances.length === 0)
				{
					// prevent use of anchors and inputs
					// we use a setTimeout in case the overlay is created from an
					// event that we're going to be cancelling (see #2804)
					setTimeout(function ()
					{
						// handle $(el).dialog().dialog('close') (see #4065)
						if ($.ui.dialog.overlay.instances.length)
						{
							$(document).bind($.ui.dialog.overlay.events, function (event)
							{
								// stop events if the z-index of the target is < the z-index of the overlay
								// we cannot return true when we don't want to cancel the event (#3523)
								if ($(event.target).zIndex() < $.ui.dialog.overlay.maxZ)
								{
									return false;
								}
							});
						}
					}, 1);

					// allow closing by pressing the escape key
					$(document).bind('keydown.dialog-overlay', function (event)
					{
						if (dialog.options.closeOnEscape && event.keyCode &&
					event.keyCode === $.ui.keyCode.ESCAPE)
						{

							dialog.close(event);
							event.preventDefault();
						}
					});

					// handle window resize
					$(window).bind('resize.dialog-overlay', $.ui.dialog.overlay.resize);
				}

				var $el = (this.oldInstances.pop() || $('<div></div>').addClass('ui-widget-overlay'))
			.appendTo(document.body)
			.css({
				width: this.width(),
				height: this.height()
			});

				if ($.fn.bgiframe)
				{
					$el.bgiframe();
				}

				this.instances.push($el);
				return $el;
			},

			destroy: function ($el)
			{
				var indexOf = $.inArray($el, this.instances);
				if (indexOf != -1)
				{
					this.oldInstances.push(this.instances.splice(indexOf, 1)[0]);
				}

				if (this.instances.length === 0)
				{
					$([document, window]).unbind('.dialog-overlay');
				}

				$el.remove();

				// adjust the maxZ to allow other modal dialogs to continue to work (see #4309)
				var maxZ = 0;
				$.each(this.instances, function ()
				{
					maxZ = Math.max(maxZ, this.css('z-index'));
				});
				this.maxZ = maxZ;
			},

			height: function ()
			{
				var scrollHeight,
			offsetHeight;
				// handle IE 6
				if ($.browser.msie && $.browser.version < 7)
				{
					scrollHeight = Math.max(
				document.documentElement.scrollHeight,
				document.body.scrollHeight
			);
					offsetHeight = Math.max(
				document.documentElement.offsetHeight,
				document.body.offsetHeight
			);

					if (scrollHeight < offsetHeight)
					{
						return $(window).height() + 'px';
					} else
					{
						return scrollHeight + 'px';
					}
					// handle "good" browsers
				} else
				{
					return $(document).height() + 'px';
				}
			},

			width: function ()
			{
				var scrollWidth,
			offsetWidth;
				// handle IE 6
				if ($.browser.msie && $.browser.version < 7)
				{
					scrollWidth = Math.max(
				document.documentElement.scrollWidth,
				document.body.scrollWidth
			);
					offsetWidth = Math.max(
				document.documentElement.offsetWidth,
				document.body.offsetWidth
			);

					if (scrollWidth < offsetWidth)
					{
						return $(window).width() + 'px';
					} else
					{
						return scrollWidth + 'px';
					}
					// handle "good" browsers
				} else
				{
					return $(document).width() + 'px';
				}
			},

			resize: function ()
			{
				/* If the dialog is draggable and the user drags it past the
				* right edge of the window, the document becomes wider so we
				* need to stretch the overlay. If the user then drags the
				* dialog back to the left, the document will become narrower,
				* so we need to shrink the overlay to the appropriate size.
				* This is handled by shrinking the overlay before setting it
				* to the full document size.
				*/
				var $overlays = $([]);
				$.each($.ui.dialog.overlay.instances, function ()
				{
					$overlays = $overlays.add(this);
				});

				$overlays.css({
					width: 0,
					height: 0
				}).css({
					width: $.ui.dialog.overlay.width(),
					height: $.ui.dialog.overlay.height()
				});
			}
		});

		$.extend($.ui.dialog.overlay.prototype, {
			destroy: function ()
			{
				$.ui.dialog.overlay.destroy(this.$el);
			}
		});

	} ($j));

	/*
	* jQuery UI Progressbar @VERSION
	*
	* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	* Dual licensed under the MIT or GPL Version 2 licenses.
	* http://jquery.org/license
	*
	* http://docs.jquery.com/UI/Progressbar
	*
	* Depends:
	*   jquery.ui.core.js
	*   jquery.ui.widget.js
	*/
	(function ($, undefined)
	{

		$.widget("ui.progressbar", {
			options: {
				value: 0,
				max: 100
			},

			min: 0,

			_create: function ()
			{
				this.element
			.addClass("ui-progressbar ui-widget ui-widget-content ui-corner-all")
			.attr({
				role: "progressbar",
				"aria-valuemin": this.min,
				"aria-valuemax": this.options.max,
				"aria-valuenow": this._value()
			});

				this.valueDiv = $("<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>")
			.appendTo(this.element);

				this.oldValue = this._value();
				this._refreshValue();
			},

			destroy: function ()
			{
				this.element
			.removeClass("ui-progressbar ui-widget ui-widget-content ui-corner-all")
			.removeAttr("role")
			.removeAttr("aria-valuemin")
			.removeAttr("aria-valuemax")
			.removeAttr("aria-valuenow");

				this.valueDiv.remove();

				$.Widget.prototype.destroy.apply(this, arguments);
			},

			value: function (newValue)
			{
				if (newValue === undefined)
				{
					return this._value();
				}

				this._setOption("value", newValue);
				return this;
			},

			_setOption: function (key, value)
			{
				if (key === "value")
				{
					this.options.value = value;
					this._refreshValue();
					if (this._value() === this.options.max)
					{
						this._trigger("complete");
					}
				}

				$.Widget.prototype._setOption.apply(this, arguments);
			},

			_value: function ()
			{
				var val = this.options.value;
				// normalize invalid value
				if (typeof val !== "number")
				{
					val = 0;
				}
				return Math.min(this.options.max, Math.max(this.min, val));
			},

			_percentage: function ()
			{
				return 100 * this._value() / this.options.max;
			},

			_refreshValue: function ()
			{
				var value = this.value();
				var percentage = this._percentage();

				if (this.oldValue !== value)
				{
					this.oldValue = value;
					this._trigger("change");
				}

				this.valueDiv
			.toggleClass("ui-corner-right", value === this.options.max)
			.width(percentage.toFixed(0) + "%");
				this.element.attr("aria-valuenow", value);
			}
		});

		$.extend($.ui.progressbar, {
			version: "@VERSION"
		});

	})($j);
};

addJqueryUI();