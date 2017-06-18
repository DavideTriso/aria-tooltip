(function ($) {
  'use strict';
  var methods = {},
    count = 0,
    a = {
      aHi: 'aria-hidden',
      aDes: 'aria-describedby',
      r: 'role',
      t: 'true',
      f: 'false'
    };

  //PRIVATE FUNCTIONS
  //-----------------------------------------------

  //set id on element if not set
  function setId(element, id, i) {
    if (!element.is('[id]')) {
      element.attr('id', `${id}${i + 1}`);
    }
  }

  //return tooltip starting from element with tooltip
  function getTooltip(element) {
    return $('#' + element.attr(a.aDes));
  }

  //check breakpoints
  function getBreakpoint(breakpointsArray) {
    var l = breakpointsArray.length - 1,
      screenWidth = $(window).width();
    for (l; l >= 0; l = l - 1) {
      if (screenWidth >= breakpointsArray[l]) {
        return l;
      }
    }
  }

  //return object with element width and height
  function getElementWidthAndHeight(element) {
    return {
      height: element.outerHeight(),
      width: element.outerWidth()
    };
  }

  //return object with element position
  function getElementPosition(element) {
    var elementPosition = element.position();
    return {
      left: elementPosition.left - $(window).scrollLeft(),
      top: elementPosition.top - $(window).scrollTop()
    };
  }


  function checkForSpecialKeys(event) {
    if (!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
      //none is pressed
      return true;
    }
    return false;
  }


  //METHODS
  //-----------------------------------------------

  methods.init = function (userSettings, elementWithTooltip) {
    var settings = $.extend({}, $.fn.ariaTooltip.defaultSettings, userSettings),
      tooltip = getTooltip(elementWithTooltip),
      elementWithTooltipId = '',
      breakpointsArray = [],
      responsiveSettings = [],
      responsiveSettingsArray = [],
      tooltipArray = [],
      i = 0,
      l = 0;

    //set id on element with tooltip, if not set
    setId(elementWithTooltip, 'aria-tt-', count);

    //get id of element with tooltip and save in varaible
    elementWithTooltipId = elementWithTooltip.attr('id');

    //set role and initialise tooltip
    tooltip.attr(a.r, 'tooltip').attr(a.aHi, a.t);

    if (!settings.cssTransitions) {
      tooltip.hide();
    }


    //enable responsive mode if 'responsive' is not false 
    //generate array with breakpoints and
    //generate new array of objects with settings for each breakpoint
    if (settings.responsive) {

      //save responsive settings into array,
      //delete not needed settings from settings object or set to default
      responsiveSettings = settings.responsive;
      delete settings.responsive;
      settings.modifierClass = false;

      l = responsiveSettings.length;
      //i = 0;
      for (i; i < l; i = i + 1) {
        breakpointsArray.push(responsiveSettings[i].breakpoint);
        responsiveSettingsArray.push($.extend({}, settings, responsiveSettings[i]));
      }
    }

    //save all data into array
    tooltipArray.push(elementWithTooltipId, tooltip, settings, breakpointsArray, responsiveSettingsArray);

    //append tooltipArray to jquery object
    elementWithTooltip.data('tooltipArray', tooltipArray);

    //Bind event handlers
    elementWithTooltip.on('mouseenter.ariaTooltip focus.ariaTooltip', function () {
      methods.show($(this));
    });

    elementWithTooltip.on('mouseout.ariaTooltip', function () {
      if (!elementWithTooltip.is(':focus')) {
        methods.hide($(this));
      }
    });

    elementWithTooltip.on('blur.ariaTooltip', function () {
      methods.hide($(this));
    });

    $(window).on('resize.ariaTooltip scroll.ariaTooltip', function () {
      methods.position(elementWithTooltip);
    });


    //increment count after every initalisation
    count = count + 1;
  };


  //SHOW TOOLTIP
  //-----------------------------------------------
  methods.show = function (elementWithTooltip) {
    var tooltip = elementWithTooltip.data('tooltipArray')[1],
      breakpoint = elementWithTooltip.data('tooltipArray')[3].length > 0 ?
      getBreakpoint(elementWithTooltip.data('tooltipArray')[3]) : false,
      settings = elementWithTooltip.data('tooltipArray')[4].length > 0 ?
      elementWithTooltip.data('tooltipArray')[4][breakpoint] : elementWithTooltip.data('tooltipArray')[2],
      modifierClass = settings.modifierClass !== false ? settings.modifierClass : '';

    //position tooltip relative to the element owning the tooltip
    methods.position(elementWithTooltip);

    //update attributes
    tooltip.attr(a.aHi, a.f);

    //add classes to tooltip
    tooltip.addClass(`${modifierClass} ${settings.tooltipOpenClass}`);

    //aminate with js if css transitions are disabled
    if (!settings.cssTransitions) {
      tooltip.stop().fadeIn(settings.fadeSpeed)
    }

    //close tooltip with esc button
    $(window).on('keydown.ariaTooltip', function (event) {
      if (event.keyCode === 27 && checkForSpecialKeys(event) === true) {
        methods.hide(elementWithTooltip);
      }
    });
  };


  //POSITION TOOLTIP
  //-----------------------------------------------
  methods.position = function (elementWithTooltip) {
    var tooltip = elementWithTooltip.data('tooltipArray')[1],
      tooltipSize = getElementWidthAndHeight(tooltip),
      elementWithTooltipSize = getElementWidthAndHeight(elementWithTooltip),
      elementWithTooltipPosition = getElementPosition(elementWithTooltip),
      screenSize = getElementWidthAndHeight($(window)),
      breakpoint = elementWithTooltip.data('tooltipArray')[3].length > 0 ?
      getBreakpoint(elementWithTooltip.data('tooltipArray')[3]) : false,
      settings = elementWithTooltip.data('tooltipArray')[4].length > 0 ?
      elementWithTooltip.data('tooltipArray')[4][breakpoint] : elementWithTooltip.data('tooltipArray')[2],
      left = 0,
      top = 0,
      bottom = 'auto';

    switch (settings.position) {
      case 'screenTop':
        break;
      case 'top':
        left = elementWithTooltipPosition.left + elementWithTooltipSize.width / 2 - tooltipSize.width / 2;
        top = elementWithTooltipPosition.top - tooltipSize.height;
        break;
      case 'right':
        left = elementWithTooltipPosition.left + elementWithTooltipSize.width;
        top = elementWithTooltipPosition.top + elementWithTooltipSize.height / 2 - tooltipSize.height / 2;
        break;
      case 'bottom':
        left = elementWithTooltipPosition.left + elementWithTooltipSize.width / 2 - tooltipSize.width / 2;
        top = elementWithTooltipPosition.top + elementWithTooltipSize.height;
        break;
      case 'left':
        left = elementWithTooltipPosition.left - tooltipSize.width;
        top = elementWithTooltipPosition.top + elementWithTooltipSize.height / 2 - tooltipSize.height / 2;
        break;
      case 'screenBottom':
        bottom = 0;
        top = 'auto';
        break;
    }

    tooltip.css({
      left: left,
      top: top,
      bottom: bottom,
      '-webkit-transform': `translate(${settings.translateX}rem, ${settings.translateY}rem)`,
      '-moz-transform': `translate(${settings.translateX}rem, ${settings.translateY}rem)`,
      '-ms-transform': `translate(${settings.translateX}rem, ${settings.translateY}rem)`,
      transform: `translate(${settings.translateX}rem, ${settings.translateY}rem)`,
      'z-index': settings.zIndex
    });
  };



  //HIDE TOOLTIP
  //-----------------------------------------------
  methods.hide = function (elementWithTooltip) {
    var tooltip = elementWithTooltip.data('tooltipArray')[1],
      breakpoint = elementWithTooltip.data('tooltipArray')[3].length > 0 ?
      getBreakpoint(elementWithTooltip.data('tooltipArray')[3]) : false,
      settings = elementWithTooltip.data('tooltipArray')[4].length > 0 ?
      elementWithTooltip.data('tooltipArray')[4][breakpoint] : elementWithTooltip.data('tooltipArray')[2],
      i = 0,
      l = settings.length;

    //update attributes
    tooltip.attr(a.aHi, a.t);


    if (!settings.cssTransitions) {
      tooltip.stop().fadeOut(settings.fadeSpeed, function () {
        tooltip.removeClass(`${settings.modifierClass} ${settings.tooltipOpenClass}`);
      });
    } else {
      tooltip.removeClass(`${settings.modifierClass} ${settings.tooltipOpenClass}`);
    }


    //Unbind keydown event
    $(window).off('keydown.ariaTooltip');
  };


  //DESTROY TOOLTIP
  //-----------------------------------------------
  methods.destroy = function (elementWithTooltip) {

    //hide tooltip if open
    methods.hide(elementWithTooltip);

    //remove attributes from tooltip and element with tooltip
    elementWithTooltip.data('tooltipArray')[1].removeAttr(a.r);
    elementWithTooltip.removeAttr(a.aDes).unbind('focus blur mouseenter mouseout');

    //remove data from object
    elementWithTooltip.removeData('tooltipArray');
  };




  //REMOVE TOOLTIP
  //-----------------------------------------------
  methods.remove = function (elementWithTooltip) {
    //remove attributes from tooltip and element with tooltip
    elementWithTooltip.data('tooltipArray')[1].remove();
    elementWithTooltip.removeAttr(a.aDes).unbind('focus blur mouseenter mouseout');

    //remove data from object
    elementWithTooltip.removeData('tooltipArray');
  };




  //PLUGIN
  //-----------------------------------------------
  $.fn.ariaTooltip = function (userSettings) {

    //init tooltip
    if (typeof userSettings === 'object' || typeof userSettings === 'undefined') {
      this.each(function () {
        methods.init(userSettings, $(this));
      });
      return;
    } else {
      //call public methods
      switch (userSettings) {
        case 'show':
          this.each(function () {
            methods.show($(this));
          });
          break;
        case 'hide':
          this.each(function () {
            methods.hide($(this));
          });
          break;
        case 'destroy':
          this.each(function () {
            methods.destroy($(this));
          });
          break;
        case 'remove':
          this.each(function () {
            methods.remove($(this));
          });
          break;
      }
    }
  };


  $.fn.ariaTooltip.defaultSettings = {
    translateX: 0, //%
    translateY: 0, //%
    position: 'top', //top, left, right, bottom, screen-top, screen-bottom.
    modifierClass: 'tooltip_top',
    tooltipOpenClass: 'tooltip_open',
    responsive: false,
    fadeSpeed: 100,
    cssTransitions: false,
    zIndex: 10
  };
}(jQuery));