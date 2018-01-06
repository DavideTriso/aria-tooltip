/* MIT License

Copyright (c) 2017 Davide Trisolini

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory); //AMD
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery')); //CommonJS
    } else {
        factory(jQuery, window);
    }
}(function ($, window) {
    'use strict';

    var pluginName = 'ariaTooltip',
      a = {
          aHi: 'aria-hidden',
          aDes: 'aria-describedby',
          r: 'role',
          t: 'true',
          f: 'false'
      },
      win = $(window);


    //-----------------------------------------
    //Private functions

    /*
     * Return the index of the currently active breakpoint
     * based on window width
     * Arguments: array with breakpoints and jQuery window object
     */
    function getCurrentBreakpoint(breakpoints, window) {
        var l = breakpoints.length - 1,
          screenWidth = window.width();
        for (l; l >= 0; l = l - 1) {
            if (screenWidth >= breakpoints[l]) {
                return l;
            }
        }
    }

    //-----------------------------------------
    // The actual plugin constructor
    function AriaTooltip(element, userSettings) {
        var self = this;

        self.element = $(element); // the element with the tooltip
        self.tooltip = $('#' + self.element.attr(a.aDes)); // the tooltip for the element
        self.settings = $.extend({}, $.fn.ariaTooltip.defaultSettings, userSettings); //the settings
        self.tooltipStatus = false; //the status of the tooltip (false = hidden, true = visible)
        self.autoPositioned = false; // if autopositioning occured or not
        self.currentModifierClass = false; // placeholder for the modifier class name

        //initialise the tooltip
        self.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(AriaTooltip.prototype, {
        init: function () {
            var self = this,
              settings = self.settings,
              tooltip = self.tooltip,
              element = self.element;

            /*
             * If cssTransitions are not enabled, then hide tooltip with scripting.
             */
            if (!settings.cssTransitions) {
                tooltip
                  .hide()
                  .css('opacity', 0);
            }

            /*
             * Initialise the tooltip by
             * setting role tooltip and aria-hidden to true
             */
            tooltip
              .attr(a.r, 'tooltip')
              .attr(a.aHi, a.t);


            /*
             * enable responsive mode if 'responsive' is not false.
             * Generate array with breakpoints and
             * array of objects with settings for each breakpoint
             *
             * Also watch for window resize and update settings based on current screen size
             */
            if (settings.responsive) {
                self.breakpoints = [];
                self.currentBreakpoint = false;
                self.responsiveSettings = [];

                //save responsive array to variable and get lenght
                var responsiveSettings = settings.responsive,
                  l = responsiveSettings.length,
                  i = 0;

                //delete responsive array from settigns object
                delete settings.responsive;

                //set modifierClass to false
                settings.modifierClass = false;

                //populate breakpoints array and responsive settigs array
                for (i; i < l; i = i + 1) {
                    self.breakpoints.push(responsiveSettings[i].breakpoint);
                    self.responsiveSettings.push($.extend({}, settings, responsiveSettings[i]));
                }


                /*
                 * Update settings object when screen size changes,
                 * by calling updateSettigns.
                 */
                self.updateSettings();
                win.on('resize.' + pluginName, function () {
                    self.updateSettings();
                });
            }


            //Bind event hander to element
            //listen for focus and blur events if settings.focus is true
            if (settings.focus) {
                element.on('focus.' + pluginName + ' click.' + pluginName, function () {
                    self.show();
                });

                element.on('blur.' + pluginName, function () {
                    self.hide();
                });
            }

            //listen for mouseneter and mouseout events if settings.mouseover is true
            if (settings.mouseover) {
                element.on('mouseenter.' + pluginName, function () {
                    self.show();
                });

                element.on('mouseout.' + pluginName, function () {
                    /*
                     * Hide tooltip on mouseout, only if element does not have focus.
                     * If element has focus, the tooltip must be hidden only when the element looses focus
                     * (Only when settings.focus is true, otherwise elements's focus should not affect tooltip behaviour).
                     */
                    if (settings.focus) {
                        if (!self.element.is(':focus')) {
                            self.hide();
                        }
                    } else {
                        self.hide();
                    }
                });
            }


            //Automatically hide tooltip on scroll and window resize
            win.on('scroll.' + pluginName + ' resize.' + pluginName, function () {
                self.hide();
            });


            //trigger custom event on window for authors to listen for
            win.trigger(pluginName + '.initialised', [self]);
        },
        updateModifierClass: function (newModifierClass) {
            var self = this;

            if (self.currentModifierClass === newModifierClass) {
                return;
            }
            //Upadte current modifierClass
            self.tooltip
                .removeClass(self.currentModifierClass)
                .addClass(newModifierClass);

            self.currentModifierClass = newModifierClass;
        },
        updateSettings: function () {
            /*
             * Retrive the index of the current breakpoint based on screen width
             * by calling getCurrentBreakpoint, and save to variable
             */
            var self = this,
              currentBreakpoint = getCurrentBreakpoint(self.breakpoints, win);

            if (self.currentBreakpoint !== currentBreakpoint) {

                //Overwrite self.settings object with settings for current breakpoint
                self.settings = $.extend(self.settings, self.responsiveSettings[currentBreakpoint]); //the settings

                //Update current breakpoint index
                self.currentBreakpoint = currentBreakpoint;
            }

            //update modifier class
            self.updateModifierClass(self.settings.modifierClass);

            //trigger custom event on window for authors to listen for
            win.trigger(pluginName + '.updated', [self]);
        },
        checkOverflow: function () {
            /*
             * Check if the element has enough free space around to position tooltip in viewport without overflowing content
             * Check spacing for each accepted position,
             * and return an object with bool values describing wich positions are good for a tooltip
             * - > true: position is available, enough space to place tooltip
             * - > false: overflow will occur
             */
            var self = this,
                settings = self.settings,
                elementBounbdingBox = self.element[0].getBoundingClientRect(),
                tooltipBoundingBox = self.tooltip[0].getBoundingClientRect(),
                winSafeHeight = win.height() - 5,
                winSafeWidth = win.width() - 5,
                spacing = {
                    top: elementBounbdingBox.top - settings.tooltipOffsetY - tooltipBoundingBox.height > 5 ? true : false,
                    topMin: elementBounbdingBox.top + elementBounbdingBox.height / 2 - tooltipBoundingBox.height / 2 > 5 ? true : false,
                    bottom: elementBounbdingBox.bottom + settings.tooltipOffsetY + tooltipBoundingBox.height < winSafeHeight ? true : false,
                    bottomMin: elementBounbdingBox.bottom + elementBounbdingBox.height / 2 + tooltipBoundingBox.height / 2 > 5 ? true : false,
                    left: elementBounbdingBox.left - settings.tooltipOffsetX - tooltipBoundingBox.width > 5 ? true : false,
                    leftMin: elementBounbdingBox.left + elementBounbdingBox.width / 2 - tooltipBoundingBox.width / 2 > 5 ? true : false, //left margin for tooltip when centered on top or bottom
                    right: elementBounbdingBox.right + settings.tooltipOffsetX + tooltipBoundingBox.width < winSafeWidth ? true : false,
                    rightMin: elementBounbdingBox.left + elementBounbdingBox.width / 2 + tooltipBoundingBox.width / 2 < winSafeWidth ? true : false, //right margin for tooltip when centered on top or bottom
                    start: elementBounbdingBox.left + tooltipBoundingBox.width < winSafeWidth ? true : false,
                    end: elementBounbdingBox.right - tooltipBoundingBox.width > 5 ? true : false,
                };


            return {
                top: spacing.top && spacing.leftMin && spacing.rightMin ? true : false,
                bottom: spacing.bottom && spacing.leftMin && spacing.rightMin ? true : false,
                left: spacing.left && spacing.topMin && spacing.bottomMin ? true : false,
                right: spacing.right && spacing.topMin && spacing.bottomMin ? true : false,
                topRight: spacing.top && spacing.right ? true : false,
                topLeft: spacing.top && spacing.left ? true : false,
                bottomRight: spacing.bottom && spacing.right ? true : false,
                bottomLeft: spacing.bottom && spacing.right ? true : false,
                topStart: spacing.top && spacing.start ? true : false,
                topEnd: spacing.top && spacing.end ? true : false,
                bottomStart: spacing.bottom && spacing.start ? true : false,
                bottomEnd: spacing.bottom && spacing.end ? true : false,
                screenTop: true, //trick out the script to always allow the use of screenTop and screenBottom as auto positioning values
                screenBottom: true
            };
        },
        positionTooltip: function () {
            /*
             * Check where to position the tooltip
             * based on the elements's position and the tooltip position settings
             */
            var self = this,
              settings = self.settings,
              position = settings.position,
              elementSize = self.element[0].getBoundingClientRect(),
              elementHalfHeight = elementSize.height / 2,
              elementHalfWidth = elementSize.width / 2,
              tooltipSize = self.tooltip[0].getBoundingClientRect(),
              coordinates = {
                  top: 0,
                  left: 0,
                  bottom: 'auto',
                  transform: 'none'
              };


            //autoposition tooltip, if the default position will lead to content overflow
            if (settings.autoPositioning) {
                var availablePositions = self.checkOverflow();

                //if the default position will lead to overflow
                if (!availablePositions[position] && position !== 'screenTop' && position !== 'screenBottom') {
                    var autoPositioningLength = settings.autoPositioning.length,
                        autoPositioningIndex = 0;

                    //get the first avilable postion from the autoPositioning array passed by user
                    while (!availablePositions[settings.autoPositioning[autoPositioningIndex].position] && autoPositioningIndex < autoPositioningLength) {
                        autoPositioningIndex = autoPositioningIndex + 1;
                    }
                    //The new position and the associated modifier class
                    if (autoPositioningIndex < autoPositioningLength) {
                      position = settings.autoPositioning[autoPositioningIndex].position;
                      self.updateModifierClass(settings.autoPositioning[autoPositioningIndex].tooltipModifierClass);

                      //remember the tooltip is in autopositioning mode
                      self.autoPositioned = true;

                      //trigger custom event on window for authors to listen for
                      win.trigger(pluginName + '.autoPositioning', [self]);
                    }
                }
            }

            switch (position) {
                case 'right':
                default:
                    coordinates.left = elementSize.right + settings.tooltipOffsetX;
                    coordinates.top = elementSize.top + elementHalfHeight;
                    coordinates.transform = 'translateY(-50%)';
                    break;
                case 'top':
                    coordinates.left = elementSize.left + elementHalfWidth;
                    coordinates.top = elementSize.top - settings.tooltipOffsetY;
                    coordinates.transform = 'translate(-50%, -100%)';
                    break;
                case 'topRight':
                    coordinates.left = elementSize.right + settings.tooltipOffsetX;
                    coordinates.top = elementSize.top - settings.tooltipOffsetY;
                    coordinates.transform = 'translateY(-100%)';
                    break;
                case 'bottomRight':
                    coordinates.left = elementSize.right + settings.tooltipOffsetX;
                    coordinates.top = elementSize.bottom + settings.tooltipOffsetY;
                    break;
                case 'bottom':
                    coordinates.left = elementSize.left + elementHalfWidth;
                    coordinates.top = elementSize.bottom + settings.tooltipOffsetY;
                    coordinates.transform = 'translateX(-50%)';
                    break;
                case 'topStart':
                    coordinates.left = elementSize.left;
                    coordinates.top = elementSize.top - settings.tooltipOffsetY;
                    break;
                case 'bottomStart':
                    coordinates.left = elementSize.left;
                    coordinates.top = elementSize.bottom + settings.tooltipOffsetY;
                    coordinates.transform = 'translateY(100%)';
                    break;
                case 'screenBottom':
                    coordinates.left = 0;
                    coordinates.top = 'auto';
                    coordinates.bottom = 0;
                    break;
                case 'screenTop':
                    coordinates.left = 0;
                    coordinates.top = 0;
                    coordinates.bottom = 'auto';
                    break;
                case 'topEnd':
                    coordinates.left = elementSize.left;
                    coordinates.top = elementSize.bottom + settings.tooltipOffsetY;
                    coordinates.transform = 'translateY(100%)';
                    break;
                case 'bottomEnd':
                    coordinates.left = elementSize.right;
                    coordinates.top = elementSize.bottom + settings.tooltipOffsetY;
                    coordinates.transform = 'translate(-100%, 100%)';
                    break;
                case 'left':
                    coordinates.left = elementSize.left - settings.tooltipOffsetX;
                    coordinates.top = elementSize.top + elementHalfHeight;
                    coordinates.transform = 'translate(-100%, -50%)';
                    break;
                case 'topLeft':
                    coordinates.left = elementSize.left - settings.tooltipOffsetX;
                    coordinates.top = elementSize.top - settings.tooltipOffsetY;
                    coordinates.transform = 'translate(-100%, -100%)';
                    break;
                case 'bottomLeft':
                    coordinates.left = elementSize.left - settings.tooltipOffsetX;
                    coordinates.top = elementSize.bottom + settings.tooltipOffsetY;
                    coordinates.transform = 'translateX(-100%)';
                    break;
            }

            self.tooltip.css({
                'left': coordinates.left,
                'top': coordinates.top,
                'bottom': coordinates.bottom,
                'transform': coordinates.transform
            });


            //trigger custom event on window for authors to listen for
            win.trigger(pluginName + '.positioned', [self]);
        },
        show: function () {
            var self = this,
              settings = self.settings,
              tooltip = self.tooltip;

            /*
             * Stop function execution if tooltip is currently visible.
             * No need to show it again!
             */
            if (self.tooltipStatus) {
                return;
            }

            /*
             * Calculate where to position tooltip.
             * the tooltip should be visible, in order to calculate the widht and height
             */
            if (!settings.cssTransitions) {
                tooltip.show();
            }
            self.positionTooltip();

            /*
             * Show tooltip with js only if cssTransitions are disabled
             * Otherwise the fadeIn animation should rely only on css
             */
            if (!settings.cssTransitions) {
                tooltip
                    .stop()
                    .animate({
                        'opacity': 1
                    }, settings.fadeSpeed);
            }

            /*
             * Update attributes on tooltip
             * and add class for visible tooltip
             */
            tooltip
              .attr(a.aHi, a.f)
              .addClass(settings.tooltipOpenClass);

            /*
             * Update the tooltipStatus element
             * by setting the value to true
             */
            self.tooltipStatus = true;


            //trigger custom event on window for authors to listen for
            win.trigger(pluginName + '.show', [self]);
        },
        hide: function () {
            var self = this,
              settings = self.settings,
              tooltip = self.tooltip;


            /*
             * Stop function execution if tooltip is currently hidden.
             * No need to hide it again!
             */
            if (!self.tooltipStatus) {
                return;
            }


            /*
             * Hide tooltip with js only if cssTransitions are disabled
             * Otherwise the fadeOut animation should rely only on css
             */
            if (!settings.cssTransitions) {
                tooltip
                  .stop()
                  .animate({
                      'opacity': 0
                  }, settings.fadeSpeed, function () {
                      tooltip.hide();
                      /*
                       * restore the default modifier class
                       * if the tooltip was positioned by autopositionig method
                       */
                      if (settings.autoPositioning && self.autoPositioned) {
                        self.updateModifierClass(settings.tooltipModifierClass);
                        self.autoPositioned = false;
                      }
                  });
            }

            /*
             * Update attributes on tooltip
             * and remove class for visible tooltip
             */
            tooltip
              .attr(a.aHi, a.t)
              .removeClass(settings.tooltipOpenClass);

            /*
             * Update the tooltipStatus element
             * by setting the value to false
             */
            self.tooltipStatus = false;

            //trigger custom event on window for authors to listen for
            win.trigger(pluginName + '.hide', [self]);
        },
        methodCaller: function (methodName) {
            var self = this;

            switch (methodName) {
                case 'show':
                    self.show();
                    break;
                case 'hide':
                    self.hide();
                    break;
            }
        }
    });


    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (userSettings, methodArg) {
        return this.each(function () {
            var self = this;
            /*
             * If following conditions matches, then the plugin must be initialsied:
             * Check if the plugin is instantiated for the first time
             * Check if the argument passed is an object or undefined (no arguments)
             */
            if (!$.data(self, 'plugin_' + pluginName) && (typeof userSettings === 'object' || typeof userSettings === 'undefined')) {
                $.data(self, 'plugin_' + pluginName, new AriaTooltip(self, userSettings));
            } else if (typeof userSettings === 'string') {
                $.data(self, 'plugin_' + pluginName).methodCaller(userSettings);
            }
        });
    };


    //Define default settings
    $.fn[pluginName].defaultSettings = {
        position: 'top', //top, left, right, bottom, topLeft, topRight, bottomLeft, bottomRight screenTop, screenBottom.
        autoPositioning: false,
        tooltipOffsetX: 5, //offset in px from element (does not apply if position is screenTop or screenBottom)
        tooltipOffsetY: 5, //offset in px from element (does not apply if position is screenTop or screenBottom)
        tooltipModifierClass: 'tooltip_top',
        tooltipOpenClass: 'tooltip_open',
        focus: true,
        mouseover: true,
        responsive: false,
        fadeSpeed: 300,
        cssTransitions: false
    };

}));
