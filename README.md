# Node-Slideshow
## Description
Run a slideshow containing markup, websites, and images across multiple windows using a web browser.

## Dependencies
Make sure you have node and npm installed on your machine.

## Getting Started
When building the project for the very first time, run the following command to get all required dependencies.

    npm install

## Running
To run the project, execute the following command.

    npm start

To run the project in dev mode to automatically restart the server on file changes, run the following command.

    npm run dev

Server runs on port 3000 by default. Going to /config will open the config GUI.

##  Config Values
    timeDelay:       [int]  Slideshow delay in ms.
    cycleMode:       [bool] True cycles through content, False swaps them out.
    clockWindow:     [str]  Set window to display clock. Takes 'win1', 'win2', or 'win3'.
    userUrl:         [arr]  Add websites to content pool.
    userDir:         [arr]  Set a directory other than public/images to get content.
    contentPriority: [obj]  File name as key and priority as value. Higher the number, higher the priority.
    clockAlignment:  [obj]  'vertical' key takes 'bottom' or 'top'. 'horizontal' key takes 'left' or 'right'.
