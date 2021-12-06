## Slideshare Scraper

This Node.js CLI tool scrapes images from a Slideshare presentation and assembles them into a single PDF file for offline viewing. For usage instructions, run:

```
$ sh slideshare.js
```


### Example

To create a PDF from a Dental Materials presentation, run the following command: 

```
$ node slideshare.js -p 47 -u https://image.slidesharecdn.com/physicalpropertiesofdentalmaterials-180214150135/95/physical-properties-of-dental-materials-[[[PAGE_NUM]]]-638.jpg?cb=1544018344
``` 

This tells the program there are 47 total pages.  The `[[[PAGE_NUM]]]` placeholder tells the script which part of the URL represents the different pages.

If you want to start at a page other than 1, use the -s argument, and if you want less pages, adjust the -p argument to a lower value.


### Dependencies

The script assumes you have ImageMagick installed, as well as Node.js. ImageMagick's convert command is used to create the PDF. Instructions for installing ImageMagick can be found [on their website](https://imagemagick.org/script/download.php).


### Debugging

You can use the Node.js debugger and the launch.json config to step through the program at various places, if something isn't working.


## License

MIT License

