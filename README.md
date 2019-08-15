# ascii-gen-js
A small tool for converting images into ASCII using the [sharp](https://github.com/lovell/sharp) image processing library.

I find that it works best if you use a black and white image, but feel free to mess around with it! :fire:


## ascii-cli
Useful for trying out the tool through your terminal :smile:

There are some images in the `/res` folder that you can try out.

The tool will try to fit the image within the bounds of your terminal without stretching the image, so give yourself more terminal space if it looks really small.

### Arguments
* `filename`
* `-i` `--invert`: `Boolean` *optional*
* `-t` `--type`: `String<'avg'>` *optional*

### Usage
```bash
ascii-cli -i -t avg path_to_img.png
```