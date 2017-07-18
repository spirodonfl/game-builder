# Game Builder
A tool to let you build base assets that you can then port to your game engine or game directly.

## Builds Status
I currently do not have release candidates or builds that are ready to go. Therefore, you will have to review the requirements below to run this.

## Requirements

You should use NWJS (formerly node-webkit) for best results. It can be found here: https://nwjs.io/

### NWJS
If you are going to use nwjs then you will need to ensure you know how to use it. If you don't know how to use then make sure you read the documentation.

Essentially the HTML / JS / CSS can be drag and dropped into the NWJS executable or you can specify the startup via the command line.

NOTE: If you are on Windows, I have a "Game Builder.lnk" file that you can adapt to make it easy to execute the program.

### Standard Browser
This will require adjustments to the code (which is an objective of mine) to allow you to implement the HTML / CSS / JS without the node dependency that comes with NWJS. For the most part, it's the loading and saving of files that need to be handled in a browser friendly way.

Code will have to be updated to accommodate this.

## Keyboard Shortcuts
On any page of this app, you can use F4 to go to the home page and then F5 to reload the page.

On the tile builder page, you can use F6 to hide or show the main window and F7 to enable sticky grid hover / mouse actions.

On the character builder page, there are no special keyboard shortcuts other than two global ones.

One the map builder page, you can use F6 to hide or show the main window, F7 to enable sticky grid hover / mouse actions and F8 to clear tiles instead of place them on the map.

## Assets

Assets will end up being saved in the "assets" folder. Specifically named folders exist for each type of asset and you mostly generate PNG files. Some assets (like maps) will generate JSON files along with the PNG files. It's up to you if they are useful or not.

## What this will not do

One thing this will not do is give you a merged, flat, output of a map if you have multiple layers. It will spit out each layer as an individual PNG file. It's up to you to merge it into a flat file if that's what you need. I may add the feature to include a flattened map in the future.

# License - Please refer to the LICENSE file in this repo.