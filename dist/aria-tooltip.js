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

  function getElementSize(element) {
    return {
      width: element.outerWidth(),
      height: element.outerHeight()
    };
  }


  function getElementCornersOffsets(element, elementSize, window) {
    var elementPosition = element.position(),
      winScrollLeft = window.scrollLeft(),
      winScrollTop = window.scrollTop();

    return {
      top: elementPosition.top - winScrollTop,
      left: elementPosition.left - winScrollLeft,
      bottom: elementPosition.top - winScrollTop + elementSize.height,
      right: elementPosition.left - winScrollLeft + elementSize.width
    };
  }


  //-----------------------------------------
  // The actual plugin constructor
  function AriaTooltip(element, userSettings) {
    var self = this;

    self.element = $(element); // the element with the tooltip
    self.tooltip = $('#' + self.element.attr(a.aDes)); // the tooltip for the element
    self.settings = $.extend({}, $.fn.ariaTooltip.defaultSettings, userSettings); //the settings
    self.tooltipStatus = false; //the status of the tooltip (false = hidden, true = visible, 2 = visible)

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
        self.currentModifierClass = false;
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


        //Upadte current modifierClass
        if (self.currentModifierClass !== self.settings.modifierClass) {
          self.tooltip
            .removeClass(self.currentModifierClass)
            .addClass(self.settings.modifierClass);

          self.currentModifierClass = self.settings.modifierClass;

        }
      }

      //trigger custom event on window for authors to listen for
      win.trigger(pluginName + '.updated', [self]);
    },
    positionTooltip: function () {
      /*
       * Check where to position the tooltip
       * based on the elements's position and the tooltip position settings
       */
      var self = this,
        settings = self.settings,
        elementSize = getElementSize(self.element),
        tooltipSize = getElementSize(self.tooltip),
        elementCornersOffsets = getElementCornersOffsets(self.element, elementSize, win),
        coordinates = {
          top: 0,
          left: 0,
          bottom: 'auto'
        };

      switch (settings.position) {
      case 'right':
      default:
        coordinates.left = elementCornersOffsets.right + settings.tooltipOffsetX;
        coordinates.top = elementCornersOffsets.top + (elementSize.height / 2) - (tooltipSize.height / 2);
        break;
      case 'top':
        coordinates.left = elementCornersOffsets.left + (elementSize.width / 2) - (tooltipSize.width / 2);
        coordinates.top = elementCornersOffsets.top - tooltipSize.height - settings.tooltipOffsetY;
        break;
      case 'topRight':
        coordinates.left = elementCornersOffsets.right + settings.tooltipOffsetX;
        coordinates.top = elementCornersOffsets.top - tooltipSize.height - settings.tooltipOffsetY;
        break;
      case 'bottomRight':
        coordinates.left = elementCornersOffsets.right + settings.tooltipOffsetX;
        coordinates.top = elementCornersOffsets.bottom + settings.tooltipOffsetY;
        break;
      case 'bottom':
        coordinates.left = elementCornersOffsets.left + (elementSize.width / 2) - (tooltipSize.width / 2);
        coordinates.top = elementCornersOffsets.bottom + settings.tooltipOffsetY;
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
      case 'left':
        coordinates.left = elementCornersOffsets.left - tooltipSize.width - settings.tooltipOffsetX;
        coordinates.top = elementCornersOffsets.top + (elementSize.height / 2) - (tooltipSize.height / 2);
        break;
      case 'topLeft':
        coordinates.left = elementCornersOffsets.left - tooltipSize.width - settings.tooltipOffsetX;
        coordinates.top = elementCornersOffsets.top - tooltipSize.height - settings.tooltipOffsetY;
        break;
      case 'bottomLeft':
        coordinates.left = elementCornersOffsets.left - tooltipSize.width - settings.tooltipOffsetX;
        coordinates.top = elementCornersOffsets.bottom + settings.tooltipOffsetY;
        break;
      }

      self.tooltip.css({
        'left': coordinates.left,
        'top': coordinates.top,
        'bottom': coordinates.bottom
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
        tooltip.animate({
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
      case 'reposition':
        self.positionTooltip();
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
    tooltipOffsetX: 5, //offset in px from element (does not apply id position is screenTop or screenBottom)
    tooltipOffsetY: 5, //offset in px from element (does not apply id position is screenTop or screenBottom)
    tooltipModifierClass: 'tooltip_top',
    tooltipOpenClass: 'tooltip_open',
    focus: true,
    mouseover: true,
    responsive: false,
    fadeSpeed: 300,
    cssTransitions: false
  };

}));
