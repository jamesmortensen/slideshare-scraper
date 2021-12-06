#!/usr/bin/env node
/**
 * This script takes a Slideshare image url and a number of pages and pulls down all
 * the slides as images. Afterwards, we use ImageMagick to convert them into a single
 * PDF file.
 */
const { spawn } = require('child_process');


function getNumPagesArgument(argsArr) {
    return argsValue(argsArr, '-p', '--pages');
}

function getUrlPatternArgument(argsArr) {
    return argsValue(argsArr, '-u', '--url-pattern');
}

function getStartPageArgument(argsArr) {
    return argsValue(argsArr, '-s', '--start-page', 1);
}

function getOutputFolderArgument(argsArr) {
    return argsValue(argsArr, '-o', '--output', 'output');
}

function getVerboseArgument(argsArr) {
    return argsArr.includes('-v') || argsArr.includes('--verbose');
}

function getHelpArgument(argsArr) {
    return argsArr.includes('-h') || argsArr.includes('--help');
}

function argsValue(argsArr, shortForm, longForm, defaultValue) {
    return argsArr.reduce((acc, elem, index, array) => {
        if ((array[index - 1] === shortForm || array[index - 1] === longForm))
            acc = elem;
        return acc;
    }, defaultValue);
}

const NUM_PAGES = getNumPagesArgument(process.argv);
const URL_PATTERN = getUrlPatternArgument(process.argv);
const START_PAGE = getStartPageArgument(process.argv);

if (getHelpArgument(process.argv) || NUM_PAGES === undefined || URL_PATTERN === undefined) {
    console.log(`
Usage: 
    ./slideshare.js [-h|--help] | -p|--pages NUM_PAGES | -u|--url-pattern URL_PATTERN | [-s|--start-page START_PAGE]

    -h -> Help (this output)
    -p -> Number of pages to retrieve
    -u -> URL Pattern with [[[PAGE_NUM]]] replacing the page numbers in the url
    -s -> Start page. Default is 1. Set to a higher number to start capture from a different page

    Example Usage:
    $ node slideshare.js -p 47 -u https://image.slidesharecdn.com/physicalpropertiesofdentalmaterials-180214150135/95/physical-properties-of-dental-materials-[[[PAGE_NUM]]]-638.jpg?cb=1544018344
    `);
    process.exit(0);
}

if(NUM_PAGES < 1) {
    console.error('NUM_PAGES must be greater than 0');
    process.exit(1);
}
if(START_PAGE < 1) {
    console.error('START_PAGE must be greater than 0');
    process.exit(1);
}


const QUIET = getVerboseArgument(process.argv) ? '' : '--quiet';
const OUTPUT_FOLDER = getOutputFolderArgument(process.argv);
const cmd = `wget ${QUIET} --no-check-certificate ${URL_PATTERN} -O ${OUTPUT_FOLDER}/[[[PAGE_NUM]]].jpg`;
const cmds = [];

for (var i = parseInt(START_PAGE); i <= parseInt(NUM_PAGES); i++) {
    cmds.push(cmd.replace('[[[PAGE_NUM]]]', i).replace('[[[PAGE_NUM]]]', i < 10 ? '0' + i : i));
}

console.log('Starting with page ' + START_PAGE);
console.log('Capturing total number of pages: ' + NUM_PAGES);

const fs = require('fs');
const path = require("path");
if (!fs.existsSync(OUTPUT_FOLDER))
    fs.mkdirSync(path.join(__dirname, OUTPUT_FOLDER));

(async () => {
    if(getVerboseArgument(process.argv))
        console.log('map page numbers to the URL pattern: ' + cmd);
    try {
        await Promise.all(
            cmds.map(cmd =>
                execute(cmd, false)
                //console.log('command: ' + cmd)
            )
        ).then(() => {
            execute(`convert ${OUTPUT_FOLDER}/*.jpg -auto-orient ${OUTPUT_FOLDER}/slides.pdf`, true);
        }).then(() => {
            console.log('Done!');
        });
    } catch (e) {
        console.error(e);
    }
})();

function execute(cmd, stdoutEnabled) {
    if(getVerboseArgument(process.argv))
        console.log('execute command: ' + cmd);

    stdoutEnabled = typeof (stdoutEnabled) === 'undefined' ? false : stdoutEnabled;
    return new Promise((resolve, reject) => {
        const process = executeProcess(cmd, stdoutEnabled);

        if (process.stdout)
            process.stdout.on('data', (output) => {
                console.log('launcher: ' + output);
            });

        process.on('close', (code) => {
            if (code !== 0)
                reject(code);
            else
                resolve(code);
        });
    });
}

function executeProcess(cmd, stdoutEnabled) {
    const { spawn } = require('child_process');
    const { execFile } = require('child_process');
    if (stdoutEnabled)
        return spawn(
            cmd.split(' ')[0],
            cmd.split(' ').filter((arg, index) => {
                if (index != 0)
                    return arg;
            }), { stdio: 'inherit', env: { ...process.env } });
    else
        return execFile(
            cmd.split(' ')[0],
            cmd.split(' ').filter((arg, index) => {
                if (index != 0)
                    return arg;
            }), { shell: '/bin/bash' });
}