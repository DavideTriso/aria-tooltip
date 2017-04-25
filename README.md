# ARIA TOOLTIP

jQuery plugin for **accessible** tooltips. **WAI ARIA 1.1** compliant.

* Easy to customise tanks to a small but useful set of options.
* Simply target all devices with 'responsive mode'.
* SASS/SCSS files for simple and quick UI customisations.
* Only 4KB (minified).
* Fully compatible with **t-css-framework**
* Runs in strict mode.

## Dependencies

**jQuery**

Developed and tested with jQuery 3.2.1

## Cross-browser tests

* Tested on **Google Chrome 57** / macOS Sierra 10.

## Options

Name | Default | Type | Description
-----|---------|------|-------------
position | top | token | Set whre the tooltip should be positioned relative to the element it blongs to. Accepted values: top, left, right, bottom, screen-top, screen-bottom.
translateX | 0 | float | Offset tooltip on the X axis by a given value to adjust distance between tooltip and element (in rem units).
translateY | 0 | float | Offset tooltip on the Y axis by a given value to adjust distance between tooltip and element (in rem units).
modifierClass | tooltip_top | string | Class added to tooltip when visible to modify default aspect. (Some ready-to-use modifier classes are already defined in css/scss).
responsive | false | false or array of objects | Enable responsive mode by passing an array of object with settings for different breakpoints. For detailed infos check the section **'responsive mode'**.
fadeSpeed | 100 | int (>= 0) | Duration of fade-in and fade-out animation.
zIndex | 10 | int | Z-index set to tooltip when visible.

## Usage

1. Include the JS script **aria-tooltip.js** - or the minified production script **aria-tooltip.min.js** - in the head or the body of your HTML file.
2. Include the CSS file  **aria-tooltip.css** in the head of your HTML file or include the SCSS files in your project. Adapt the CSS rules to match your website's design. 
3. Initialise the widget within an inline script tag, or in an external JS file.


### HTML

Use following HTML markup to implement a tooltip:


```html
<!-- EXAMPLE 1: BLOCK ELEMENTS -->
 <input name="example2" type="button" class="has-tooltip" value="button with tooltip" aria-describedby="tt2">
<span class="tooltip" id="tt2">This button is really useful. You can click on it!</span>


<!-- EXAMPLE 1: INLINE ELEMENTS -->
<p><span class="has-tooltip" aria-describedby="tt3" id="demo3" style="color: #cb6129;">Lorem ipsum dolor sit amet</span> <span class="tooltip" id="tt3">This phrase is nonsense.</span>, consectetur adipiscing elit. Pellentesque vel urna vel urna sodales semper quis in nisi. Nam id metus nec tortor tempus cursus. Etiam eget tortor ac quam faucibus pretium. In rhoncus lobortis risus eget semper. Suspendisse et pulvinar diam. Aliquam dictum ex nulla, et aliquet ante gravida id. Praesent eu tincidunt nunc, ac egestas nibh. Vivamus porttitor, ante eu placerat mollis, lacus neque aliquam arcu, eget elementum metus ante sed odio. Etiam libero diam, interdum sed pharetra nec, maximus pellentesque turpis. Suspendisse ex velit, sagittis efficitur tristique non, porttitor non nibh. Fusce placerat orci in enim aliquam, ut vestibulum turpis interdum.</p>
```

**IMPORTANT:** Do not forget to set an id on the tooltip and expose the relation between the tooltip and the element it belongs to by setting the attribute `aria-describedby`.

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

In order to show a tooltip call **ariaTooltip** and pass **'show'** as parameter:

```javascript
$('#my-element').ariaTooltip('show');
```

### Hide

In order to hide a tooltip call **ariaTooltip** and pass **'hide'** as parameter:

```javascript
$('#my-element').ariaTooltip('hide');
```

### Destroy and remove:

If you want, you can destroy a tooltip by passing **'destroy'** as a parameter to the function:

```javascript
$('.has-tooltip').ariaTooltip('destroy');
```

Calling 'destroy' will remove all attributes added from the script from a tooltip, but the tooltip will remain in the DOM.
If you want to completly remove the tooltip from the DOM, use instead  the **'remove'** method:

```javascript
$('.has-tooltip').ariaTooltip('remove');
```

**NOTE:** It is possible to initalise, destroy and remove multiple tooltips with a single function call. The **show** and **hide** methods instead can be called only on a single element at a time.


## Responsive mode

The plugin supports an advanced responsive mode. This mode gives authors better control over the aspect and functionality of the tooltips on different devices. The responsive mode is enabled through the option **responsive**. This option accepts an array of objects with the settings for the differen breakpints (see code below). 


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
When using responsive mode, each object passed as an array entry, should have the property **breakpoint** set to an **integer greater than 0**. The option **breakpoint** represents the minimum device width, therefore, is recommended to set this option to **1** in the first object to address all screen sizes with the first entry.
@ cosa succede se i breakpoint non coprono tutte le dimensioni possibili

@ quali opzioni sono compatibili con la modalita responsive e quali no.

@ cosa succede se alcune opzioni vengono tralasciate.


# LICENSE

FLOSS: Free/Libre and Open Source Software.