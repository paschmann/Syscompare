var service = $.request.parameters.get('service');
var sys1 = $.request.parameters.get('system1');
var sys2 = $.request.parameters.get('system2');
var path = $.request.parameters.get('path');
var images = $.request.parameters.get('images');
var body = "";
var isReverse = false;
var objBody = {};
var arrMissingFile = [];
var arrDifferenceFile = [];
var arrUnableToOpen = [];

switch (service) {
    case 'testcon':
        testConnection(sys1);
        break;
    case 'read':
        readData();
        break;
    case 'info':
        getServerData();
        break;
    case 'query':
        //getToken();
        doQuery();
        break;
    case 'getfiles':
        objBody.system1file = doFileGet(sys1, path).body.asString();
        objBody.system2file = doFileGet(sys2, path).body.asString();
        break;
    case 'getimagefile':
        body = doFileGet(sys1, path).body.asString();
        break;
}

if (images === true){
    $.response.setBody(body);
    $.response.contentType = 'image/png'; //'application/json';
    $.response.status = $.net.http.OK;
} else {
    $.response.setBody(JSON.stringify(objBody));
    $.response.contentType = 'text/html'; //'application/json';
    $.response.status = $.net.http.OK;
}


function testConnection(system1) {
    objBody.result = doFileGet(system1, "/").headers[3].value;
}

function readData() {
    var startdt = new Date().getTime();
    //Compare Sys1 to Sys2
    loopThroughFiles("/sap/hana/xs/dt/base/file/" + path + "?depth=-1");
    
    //Compare Sys2 to Sys1
    isReverse = true;
    sys2 = $.request.parameters.get('system1');
    sys1 = $.request.parameters.get('system2');
    loopThroughFiles("/sap/hana/xs/dt/base/file/" + path + "?depth=-1");
    var enddt = new Date().getTime();
    
    objBody.arrMissingFile = arrMissingFile;
    objBody.arrDifferenceFile = arrDifferenceFile;
    objBody.arrUnableToOpen = arrUnableToOpen;
    objBody.exeTime = calcTime(startdt, enddt);
}

function calcTime(startdt, enddt) {
    var ms = enddt - startdt;
    var sec = (ms / 1000) % 60;
    return sec.toFixed(2);
}

function loopThroughFiles(path) {
    try {
        var files = JSON.parse(doFileGet(sys1, path).body.asString());

        for (var i = 0; i < files["Children"].length; ++i) {
            var obj = files["Children"][i];
            if (obj.Directory !== true) {
                doFileCompare(obj);
            } else {
                loopThroughFiles(obj.ChildrenLocation);
            }
        }
    } catch (err) {
        body += "<br />Unable to open " + path + " on " + sys1 + ", Error: " + err;
    }
}

function doFileCompare(obj) {
    var compareresult = {};
    compareresult.RunLocation = obj.RunLocation;

    //Get  and Check text contents
    try {
        var file1 = doFileGet(sys1, obj.Location).body.asString();
    } catch (err) {
        //Add to missing on system 2 log
        compareresult.sys = sys1;
        compareresult.err = err;
        arrUnableToOpen.push(compareresult);
    }
    try {
        var file2 = doFileGet(sys2, obj.Location).body.asString();

        if (file2.indexOf("File not found") >= 0) {
            compareresult.sys = sys2;
            arrMissingFile.push(compareresult);
        } else {
            if (file1.localeCompare(file2) !== 0 && !isReverse) {
                arrDifferenceFile.push(compareresult);
            }
        }
    } catch (err) {
        compareresult.sys = sys2;
        compareresult.err = err;
        arrUnableToOpen.push(compareresult);
    }
}

function replaceAll (string, search, replace){
    var index = 0;
    do {
        string = string.replace(search, replace);
    } while((index = string.indexOf(search, index + 1)) > -1);
}

function doFileGet(dest, url) {
    var client = new $.net.http.Client();
    var getresult = {};
    
    var oSapBackPack = {
        "Active": "true"
    };
    var sapBackPack = JSON.stringify(oSapBackPack);
    var destination = $.net.http.readDestination("lilabs.syscompare.lib", dest);
    var CSRF = $.session.getSecurityToken();
    //var strUrl = replaceAll(url, " ", "%20");

    var request = new $.web.WebRequest($.net.http.GET, url);
    // Header parameters
    request.headers.set("Orion-Version", "1.0");
    request.headers.set("X-CSRF-Token", CSRF);
    request.headers.set("SapBackPack", sapBackPack);

    client.request(request, destination);
    try {
        var response = client.getResponse();
    } catch (err) {
        getresult.sys = dest;
        getresult.err = err;
        getresult.RunLocation = url;
        arrUnableToOpen.push(getresult);
        body += "<br />Unable to open " + url + " on " + dest + ", Error: " + err;
    }
    return response;
}



/* -------------------------- Experimental ------------------------------- */

function doQuery() {
    var client = new $.net.http.Client();

    var destination = $.net.http.readDestination("lilabs.syscompare.lib", "prod");
    var CSRF = $.session.getSecurityToken();

    var request = new $.web.WebRequest($.net.http.POST, "/sap/hana/ide/common/remote/server/net.xsjs");
    // Header parameters
    request.headers.set("X-CSRF-Token", CSRF);
    request.headers.set("Content-Type", "text/json; charset=UTF-8");
    request.Body = "%7B%22absoluteFunctionName%22:%22sap.hana.ide.common.plugin.catalogsystem.server.common.sqlMultiExecute%22,%22inputObject%22:%7B%22statements%22:%5B%7B%22statement%22:%22SET%2520SCHEMA%2520%2522METRIC2%2522%22,%22type%22:%22UPDATE%22%7D,%7B%22statement%22:%22SELECT%2520TOP%25201000%250A%2509%2522ALERT_ID%2522,%250A%2509%2522DASHBOARD_WIDGET_ID%2522,%250A%2509%2522COND%2522,%250A%2509%2522OPERATOR%2522,%250A%2509%2522VALUE%2522,%250A%2509%2522NOTIFY%2522,%250A%2509%2522USER_ID%2522,%250A%2509%2522STATUS%2522,%250A%2509%2522LAST_EXECUTED%2522,%250A%2509%2522CREATED_ON%2522%250AFROM%2520%2522METRIC2%2522.%2522M2_ALERT%2522%22,%22type%22:%22SELECT%22%7D,%7B%22statement%22:%22SELECT%2520CURRENT_SCHEMA%2520FROM%2520DUMMY%22,%22type%22:%22SELECT%22%7D%5D,%22maxResultSize%22:1000,%22limitLOBColumnSize%22:1024,%22includePosColumn%22:true,%22measurePerformance%22:false%7D%7D";
    
    client.request(request, destination);
    try {
        var response = client.getResponse();
    } catch (err) {
        body += "<br />Unable to open, Error: " + err;
    }
    body += response.body.asString();
}

function getServerData() {
    body += doFileGet("prod", "/sap/hana/admin/cockpit/services/TilesDataProvider.xsjs?request=generalInformation").body.asString();
}

function getToken() {
    var client = new $.net.http.Client();

    var destination = $.net.http.readDestination("lilabs.syscompare.lib", "dev");
    
    var request = new $.web.WebRequest($.net.http.GET, "/sap/hana/ide/common/remote/server/csrf.xsjs");
    // Header parameters
    request.headers.set("X-CSRF-Token", "Fetch");
    
    client.request(request, destination);
    try {
        var response = client.getResponse();
    } catch (err) {
        objBody.error = "<br />Unable to open file, Error: " + err;
    }
    return response;
}