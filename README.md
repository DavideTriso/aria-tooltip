# ARIA TOOLTIP

jQuery plugin for **accessible** tooltips. **WAI ARIA 1.1** compliant.

* User friendly and accessible
* Simply target all devices with responsive-mode.
* Only 4KB (minified).
* Runs in strict mode.
* Compatible with amd and require.js

## Dependencies

**jQuery**

Developed and tested with jQuery 3.2.1

## Cross-browser tests

* Tested on **Google Chrome 57** / macOS Sierra 10.

## Options

Name | Default | Type | Description | Required or optional
-----|---------|------|-------------|-------------------------
position | top | token | Set whre the tooltip should be positioned relative to the element it blongs to. Accepted values: **top, left, right, bottom, screen-top, screen-bottom**. | optional
translateX | 0 | float | Offset tooltip on the X axis by a given value to adjust distance between tooltip and element (in rem units). | optional
translateY | 0 | float | Offset tooltip on the Y axis by a given value to adjust distance between tooltip and element (in rem units). | optional
tooltipOpenClass | tooltip_open | string | Class added to tooltip when visible. | optional
modifierClass | tooltip_top | string | Class added to tooltip when visible to modify default aspect. (Some ready-to-use modifier classes are already defined in css/scss). | optional
cssTransitions | false | bool | Use css transitions to animate tooltip instead of JS. Check 'Using CSS transitions' for more infos. | default
responsive | false | false or array of objects | Enable responsive mode by passing an array of object with settings for different breakpoints. For detailed infos check the section **'responsive mode'**. | optional
fadeSpeed | 100 | int (>= 0) | Duration of fade-in and fade-out animation. | optional
zIndex | 10 | int | Z-index set to tooltip when visible. | optional

## Usage

1. Include the JS script **aria-tooltip.js** - or the minified production script **aria-tooltip.min.js** - in the head or the body of your HTML file.
2. Include the CSS file  **aria-tooltip.css** in the head of your HTML file or include the SCSS files in your project. 
3. Initialise the widget within an inline script tag, or in an external JS file.


### HTML

Use following HTML markup to implement a tooltip:

```html
<!-- EXAMPLE 1: BLOCK ELEMENTS -->
<input name="example2" type="button" class="has-tooltip" value="button with tooltip" aria-describedby="tt2">
<span class="tooltip" id="tt2">This button is really useful. You can click on it!</span>

<!-- EXAMPLE 2: INLINE ELEMENTS -->
<p><span class="has-tooltip" aria-describedby="tt3" id="demo3" style="color: #cb6129;">Lorem ipsum dolor sit amet</span> <span class="tooltip" id="tt3">This phrase is nonsense.</span>, consectetur adipiscing elit. Pellentesque vel urna vel urna sodales semper quis in nisi. Nam id metus nec tortor tempus cursus. Etiam eget tortor ac quam faucibus pretium. In rhoncus lobortis risus eget semper. Suspendisse et pulvinar diam. Aliquam dictum ex nulla, et aliquet ante gravida id. Praesent eu tincidunt nunc, ac egestas nibh. Vivamus porttitor, ante eu placerat mollis, lacus neque aliquam arcu, eget elementum metus ante sed odio. Etiam libero diam, interdum sed pharetra nec, maximus pellentesque turpis. Suspendisse ex velit, sagittis efficitur tristique non, porttitor non nibh. Fusce placerat orci in enim aliquam, ut vestibulum turpis interdum.</p>
```

**IMPORTANT:** Do not forget to **set an id on the tooltip** and **expose the relation between the tooltip and the element it belongs to by setting the attribute `aria-describedby`**.

### JS: Initialisation

Initialise the plugin as follows:

```javascript
$('.has-tooltip').ariaTooltip({
  option1: value1,
  option2: value2
});
```

## Methods:

The plugin supports following methods: show, hide, destroy, remove.

### Show

To show a tooltip, call **ariaTooltip** and pass **'show'** as parameter:

```javascript
$('#my-element').ariaTooltip('show');
```

### Hide

To hide a tooltip call **ariaTooltip** and pass **'hide'** as parameter:

```javascript
$('#my-element').ariaTooltip('hide');
```

### Destroy and remove:

If you want, you can destroy a tooltip by passing **'destroy'** as a parameter to the function:

```javascript
$('.has-tooltip').ariaTooltip('destroy');
```
Calling 'destroy' will remove all attributes added from the script from a tooltip, but the tooltip will remain in the DOM. If you want to completly remove the tooltip from the DOM, use instead  the **'remove'** method:

```javascript
$('.has-tooltip').ariaTooltip('remove');
```


## Responsive mode

The plugin supports an **advanced responsive mode**. This mode gives authors better control over the aspect and functionality of the tooltips on different devices. The responsive mode is enabled through the option **'responsive'**. This option **accepts an array of objects** with the options for differen screen widths (see code below). 

```javascript
$('.has-tooltip').ariaTooltip({
    responsive: [
      {
        breakpoint: 1,
        position: 'screenBottom',
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
        modifierClass: 'tooltip_right',
        translateX: 0.75
      }
    ]
  });
```
The option **'breakpoint'** sets the minimum screen width (in px) and is **allowed only in responsive mode**, e.g. as a property of an object of the 'responsive' array. Except for 'breakpoint' and 'responsive', all other options are not restricted to a specific mode.

Options that applies to any screen width **can and should** be set outside of the option **'responsive'** to keep code clear and reduce the amount of operations needed for the initialisation of the plugin.
Consider following example:

```javascript
$('.has-tooltip').ariaTooltip({
    responsive: [
      {
        breakpoint: 1,
        position: 'right',
        [...]
      },
      {
        breakpoint: 768,
        position: 'right',
        [...]
      },
      {
        breakpoint: 992,
        position: 'right',
        [...]
      }
    ]
  });
```

Although this code would perfectly work, it is strongly recommended to set the option **'position'** only once:

```javascript
$('.has-tooltip').ariaTooltip({
    position: 'right',  //This option is valid for all breakpoints
    responsive: [
      {
        breakpoint: 1,
        [...]
      },
      {
        breakpoint: 768,
        [...]
      },
      {
        breakpoint: 992,
        [...]
      }
    ]
  });
```

When using responsive mode, it is important to **cover all screen widths** by setting the first **'breakpoint'** to **1** or to the minimum screen width possible. Also, for the plugin to work correctly, all objects **must be sorted ascendingly by breakpoint**:

```javascript
$('.has-tooltip').ariaTooltip({
    responsive: [
      {
        breakpoint: 768,
        [...]
      },
      {
        breakpoint: 1,
        [...]
      },
      {
        breakpoint: 992,
        [...]
      }
    ]
  });
```

This code would cause an error and the plugin wont work correctly!

The correct initialisation code is instead the following:

```javascript
$('.has-tooltip').ariaTooltip({
    responsive: [
      {
        breakpoint: 1,    //first breakpoint
        [...]             //options for screens >= 1px width
      },
      {
        breakpoint: 768,  //second breakpoint
        [...]             //options for screens >= 768px width (wich is > first breakpoint)
      },
      {
        breakpoint: 992,  //third breakpoint
        [...]             //options for screens >= 992px width (wich is > second breakpoint)
      }
    ]
  });
```



## Custom events

The plugin triggers following events:

* **ariaTooltip.initialised** after the tooltip is isinitialised
* **ariaTooltip.updated** when the tooltips's responisve options are updated
* **ariaTooltip.positioned** when the tooltip's position is calculated (occurs on resize)
* **ariaTooltip.show** when th tooltip is shown
* **ariaTooltip.hide** when the tooltip gets hidden

### Example

This events are triggered on window and return the tooltips's data object as arguments.

```javascript

//listen for ariaTooltip.initialised
$(window).on('ariaTooltip.initialised', function(event, tooltip){
  //When a tooltip is initialised, perform an action
  ariaTooltip.element.addClass('aria-tooltip_initialised');
});

//Initialise the tooltip
$('.has-tooltip').ariaTabs();

```



## Using CSS transitions

By default the plugin is configured to use JS to show/hide the tooltips. Setting the option **cssTransitions** to 'true' will disable the JS animations and it is possible to implement show/hide animations directly in the css. In fact, the plugin toggles the class passed along with the option **tooltipOpenClass** and **modifierClasses** when a tooltip is toggled.


## LICENSE

This project is licensed under the terms of the **MIT license**.

See [LICENSE.md](LICENSE.md) for detailed informations.
