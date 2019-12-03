  var colors = jsColorPicker('input.color', {
    customBG: '#222',
    readOnly: true,
    // patch: false,
    init: function (elm, colors) { // colors is a different instance (not connected to colorPicker)
      elm.style.backgroundColor = elm.value;
      elm.style.color = colors.rgbaMixCustom.luminance > 0.22 ? '#222' : '#ddd';
    },
    // appendTo: document.querySelector('.samples')
  });