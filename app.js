var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var jsonfile = require('jsonfile');
//var file = 'procedures.json';
var file = 'diseases.json';
//var promisez=[];
//var allPromises=[];
var dbPromises = [];
//var allDetails=[];
//var START_URL = "http://www.arstechnica.com";
var START_URL = "https://emedicine.medscape.com/clinical_procedures";
var SEARCH_WORD = "";
//var MAX_PAGES_TO_VISIT = 1000;

var pagesVisited = {};
var numPagesVisited = 0;
var numItems = 0;
var pagesToVisit = ["https://emedicine.medscape.com/allergy_immunology"];
//var links=[];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;
var isLastPage = false;
//pagesToVisit.push(START_URL);
crawl();

function crawl() {
    if (pagesToVisit.length <= 0) {
        console.log("visited all pages.");
        Promise.all(dbPromises).then(function(values) {

        });
        return;
    }
    var nextPage = pagesToVisit.shift();
    if (nextPage in pagesVisited) {
        // We've already visited this page, so repeat the crawl
        crawl();
    } else {
        // New page we haven't visited
        if (nextPage == null) {
            return;
        }
        numPagesVisited++;
        visitPage(nextPage, crawl);
    }
}

function requestPage(url, callback) {
    return new Promise(function(resolve, reject) {
        // Do async job
        request.get(url, function(err, resp, body) {
            if (err) {
                reject(err);
                callback();
            } else {
                resolve(body);
            }
        })
    })
}

function visitPage(url, callback) {
    // Add page to our set
    pagesVisited[url] = true;
    // Make the request
    console.log("Visiting page " + url);
    var requestPag = requestPage(url, callback);
    //promisez.push(requestPag);
    requestPag.then(function(body) {
        var $ = cheerio.load(body);
        scrapeCellPhone($, url, callback);

    }, function(err) {
        console.log(err);
        callback();
    })
}

function collectAllLinks($) {
    var relativeLinks = $("a[href^='/']");
    //console.log("Found " + relativeLinks.length + "links on page");
    $('a').each(function() {
        var lnk = $(this).attr('href');
        if (lnk == null) {
            return;
        }
        lnk = lnk.toLowerCase()
        var arr = lnk.split("/");
        var validi = lnk.includes("cell-phones") || lnk.includes("apple") || lnk.includes("motorola") || lnk.includes("lg") || lnk.includes("blu") || lnk.includes("samsung");
        validi = validi || lnk.includes("htc") || lnk.includes("sony") || lnk.includes("huawei") || lnk.includes("nokia");
        validi = validi || lnk.includes("alcatel") || lnk.includes("zte") || lnk.includes("asus");
        //console.log(lnk);
        if (lnk.startsWith("/")) {
            lnk = baseUrl + lnk;
            if (lnk in pagesVisited) {} else {
                if (validi) {
                    // console.log("pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp");
                    pagesToVisit.push(baseUrl + $(this).attr('href'));

                }
            }

            /*var indx = links.indexOf(lnk);if (lnk in links){    }else{if(validi && arr.length===4){//  links.push(lnk);}} */
        }
    });

    console.log(numItems + " Items scraped and saved  so far");
    console.log(pagesToVisit.length + " pages to visit  ");
}

function printUrls() {
    //console.log(links.length);
}

function scrapeCellPhone($, url, callback) {
    var arr = [];
    $("li a").each(function(lnk) {
        arr.push($(this).text());
    });

    jsonfile.writeFile(file, arr, { spaces: 2 }, function(err) { //
        console.error(err + ' ==');
    });
    //allDetails.push(item);
}