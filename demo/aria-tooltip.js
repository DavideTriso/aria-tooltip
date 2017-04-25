(function ($) {
  'use strict';
  var tooltipsArray = [],
    methods = {},
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
      element.attr('id', id + (i + 1));
    }
  }

  //return tooltip starting from element with tooltip
  function getTooltip(element) {
    return $('#' + element.attr(a.aDes));
  }

  //Perform array lookup and return indexes of the needed tooltip

  function getTooltipIndex(elementWithTooltip) {
    var i = 0,
      l = tooltipsArray.length,
      elementWithTooltipId = elementWithTooltip.attr('id'),
      indexTooltip = 0;

    for (i; i < l; i = i + 1) {
      indexTooltip = tooltipsArray[i][0].indexOf(elementWithTooltipId);
      if (indexTooltip !== -1) {
        return i;
      }
    }
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
    var settings = $.extend({
        translateX: 0, //%
        translateY: 0, //%
        position: 'top', //top, left, right, bottom, screen-top, screen-bottom.
        modifierClass: 'tooltip_top',
        responsive: false,
        fadeSpeed: 100,
        zIndex: 10
      }, userSettings),
      elements = {
        elementWithTooltip: elementWithTooltip,
        tooltip: getTooltip(elementWithTooltip)
      },
      elementWithTooltipId = '',
      breakpointsArray = [],
      responsiveSettings = [],
      responsiveSettingsArray = [],
      tooltipArray = [],
      i = 0,
      l = 0;

    //set id on element with tooltip, if not set
    setId(elementWithTooltip, 'element-tt-', count);

    //get id of element with tooltip and save in varaible
    elementWithTooltipId = elementWithTooltip.attr('id');

    //set role and initialise tooltip
    elements.tooltip.attr(a.r, 'tooltip').attr(a.aHi, a.t).hide();




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
    tooltipArray.push(elementWithTooltipId, elements, settings, breakpointsArray, responsiveSettingsArray);

    //push array to 1st. level array - tooltipsArray
    tooltipsArray.push(tooltipArray);

    //TOOLTIPS ARRAY ARCHITECTURE:
    /*
    tooltipsArray ---> [i] ---> [0] Id of element with tooltip
                           ---> [1] Object wih elements
                           ---> [2] Object with settings
                           ---> [3] Array with breakpoints
                           ---> [4] responsiveSettingsArray[i] ---> Settings for each breakpoint
    */

    //Bind event handlers
    elements.elementWithTooltip.on('mouseenter focus', function () {
      methods.show(getTooltipIndex(elements.elementWithTooltip));
    });

    elements.elementWithTooltip.on('mouseout', function () {
      if (!elements.elementWithTooltip.is(':focus')) {
        methods.hide(getTooltipIndex(elements.elementWithTooltip));
      }
    });

    elements.elementWithTooltip.on('blur', function () {
      methods.hide(getTooltipIndex(elements.elementWithTooltip));
    });

    //Close tooltips on resize and scroll
    //to prevent positioning problems
    $(window).on('resize scroll', function () {
      methods.hide(getTooltipIndex(elements.elementWithTooltip));
    });

    //increment count after every initalisation
    count = count + 1;
  };





  //SHOW TOOLTIP
  //-----------------------------------------------
  methods.show = function (index) {
    var tooltip = tooltipsArray[index][1].tooltip,
      elementWithTooltip = tooltipsArray[index][1].elementWithTooltip,
      tooltipSize = getElementWidthAndHeight(tooltip),
      elementWithTooltipSize = getElementWidthAndHeight(elementWithTooltip),
      elementWithTooltipPosition = getElementPosition(elementWithTooltip),
      screenSize = getElementWidthAndHeight($(window)),
      breakpoint = tooltipsArray[index][3].length > 0 ? getBreakpoint(tooltipsArray[index][3]) : false,
      settings = tooltipsArray[index][4].length > 0 ? tooltipsArray[index][4][breakpoint] : tooltipsArray[index][2],
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
      '-webkit-transform': 'translate(' + settings.translateX + 'rem, ' + settings.translateY + 'rem)',
      '-moz-transform': 'translate(' + settings.translateX + 'rem, ' + settings.translateY + 'rem)',
      '-ms-transform': 'translate(' + settings.translateX + 'rem, ' + settings.translateY + 'rem)',
      transform: 'translate(' + settings.translateX + 'rem, ' + settings.translateY + 'rem)',
      'z-index': settings.zIndex
    });

    //show tooltip
    if (settings.modifierClass !== false) {
      tooltip.addClass(settings.modifierClass);
    }
    tooltip.attr(a.aHi, a.f).fadeIn(settings.fadeSpeed);

    //close tooltip with esc button
    $(window).on('keydown', function (event) {
      if (event.keyCode === 27 && checkForSpecialKeys(event) === true) {
        methods.hide(index);
      }
    });
  };




  //HIDE TOOLTIP
  //-----------------------------------------------
  methods.hide = function (index) {
    var tooltip = tooltipsArray[index][1].tooltip,
      breakpoint = tooltipsArray[index][3].length > 0 ? getBreakpoint(tooltipsArray[index][3]) : false,
      settings = tooltipsArray[index][4].length > 0 ? tooltipsArray[index][4][breakpoint] : tooltipsArray[index][2],
      i = 0,
      l = settings.length;

    //hide tooltip
    tooltip.attr(a.aHi, a.t).fadeOut(settings.fadeSpeed, function () {
      if (Array.isArray(settings)) {
        //remove all modifier classes from tooltip
        for (i; i < l; i = i + 1) {
          tooltip.removeClass(tooltipsArray[i][4].modifierClass);
        }
      } else {
        tooltip.removeClass(settings.modifierClass);
      }
    });

    //Unbind keydown event
    $(window).unbind('keydown');
  };




  //DESTROY TOOLTIP
  //-----------------------------------------------
  methods.destroy = function (index) {

    //hide tooltip if open
    methods.hide(index);

    //remove attributes from tooltip and element with tooltip
    tooltipsArray[index][1].tooltip.removeAttr(a.r);
    tooltipsArray[index][1].elementWithTooltip.removeAttr(a.aDes).unbind('focus blur mouseenter mouseout');

    //remove entry from array
    tooltipsArray.splice(index, 1);
  };




  //REMOVE TOOLTIP
  //-----------------------------------------------
  methods.remove = function (index) {
    //remove attributes from tooltip and element with tooltip
    tooltipsArray[index][1].tooltip.remove();
    tooltipsArray[index][1].elementWithTooltip.removeAttr(a.aDes).unbind('focus blur mouseenter mouseout');

    //remove entry from array
    tooltipsArray.splice(index, 1);
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
          methods.show(getTooltipIndex($(this)));
          break;
        case 'hide':
          methods.hide(getTooltipIndex($(this)));
          break;
        case 'destroy':
          this.each(function () {
            methods.destroy(getTooltipIndex($(this)));
          });
          break;
        case 'remove':
          this.each(function () {
            methods.remove(getTooltipIndex($(this)));
          });
          break;
      }
    }
  };
}(jQuery));


$(document).ready(function () {
  'use strict';
  $('.has-tooltip').ariaTooltip({
    responsive: [
      {
        breakpoint: 1,
        position: 'screenBottom',
        fadeSpeed: 100,
        modifierClass: 'tooltip_screen-bottom'
      },
      {
        breakpoint: 768,
        position: 'top',
        modifierClass: 'tooltip_top',
        translateY: -0.75
      },
      {
        breakpoint: 992,
        position: 'right',
        translateY: 0,
        fadeSpeed: 100,
        modifierClass: 'tooltip_right',
        translateX: 0.75
      }
    ]
  });
});
