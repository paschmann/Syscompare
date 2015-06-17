var connection0 = {};
var connection1 = {};
var connections = [];
var selectedViewType = 0;
var system1file = "";
var system2file = "";

connection0.system = "dev";
connections.push(connection0);

connection1.system = "prod";
connections.push(connection1);

var repo = "/lilabs/metric2/css";
var selectedViewType;

$(function() {
    init();
});

function init() {

    $('#hanasystem0').val(connections[0].system);
    $('#hanasystem1').val(connections[1].system);
    $('#repopath').val(repo);

    $('#btnSideBar').click(function(e) {
        if ($('#logoarea').css("display") == "block") {
            $('#logoarea').css("display", "none");
            $('#main').css("margin-left", "0");
            $('#header .tools-bar').css("margin-left", "0");
        } else {
            $('#logoarea').css("display", "block");
            $('#main').css("margin-left", "270px");
            $('#header .tools-bar').css("margin-left", "250px");
        }
    });

    $(document).on("click", ".hanapage", function(event) {
        event.stopPropagation();
        clearResults();
        var filename = $(this).data('ref');
        var images = false;
        if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(filename)) {
            //Not working correctly
            $('#results').html('<p align="center"><br />Images are not currently supported</p>');
            /*
            getDataSet({
                service: "getimagefile",
                system1: $('#hanasystem0').val(),
                path: filename,
                images: images
            });
            */
        } else {
            getDataSet({
                service: "getfiles",
                system1: $('#hanasystem0').val(),
                system2: $('#hanasystem1').val(),
                path: filename,
                images: images
            });
        }
    });
}

function showExecuting(display) {
    if (display) {
        $("#executing").fadeTo(200, 1);
    } else {
        $("#executing").fadeTo(200, 0, function() {
            $(this).hide();
        });
    }
}

function getFileCompareCB(data) {
    system1file = data.system1file;
    system2file = data.system2file;

    if (system1file.indexOf("Error 404 - Not found") > 0) {
        system1file = "Not Found";
    } else if (system2file.indexOf("Error 404 - Not found") > 0) {
        system2file = "Not Found";
    }
    compareFiles(selectedViewType);
}

function doCheck() {
    getDataSet({
        service: "read",
        system1: $('#hanasystem0').val(),
        system2: $('#hanasystem1').val(),
        path: $('#repopath').val()
    });
}

function doCheckCB(data) {
    $("#exeTime").html("<i class='fa fa-clock-o'></i> " + data.exeTime);

    if (data.arrMissingFile.length > 0) {
        var html = "<b><u>Missing Files</b> (" + data.arrMissingFile.length + ")</u><hr><br />";
        for (var i = 0; i < data.arrMissingFile.length; i++) {
            html += "<li class='hanapage' data-ref='" + data.arrMissingFile[i].RunLocation + "' style='display: block'><i class='fa fa-file-code-o'></i><a href='#'>    " + data.arrMissingFile[i].RunLocation + " [" + data.arrMissingFile[i].sys + "]</li>";
        }
    }

    if (data.arrDifferenceFile.length > 0) {
        html += "<hr><b><u>Files Difference</b> (" + data.arrDifferenceFile.length + ")</u><hr><br />";
        for (var i = 0; i < data.arrDifferenceFile.length; i++) {
            html += "<li class='hanapage' data-ref='" + data.arrDifferenceFile[i].RunLocation + "' style='display: block'><i class='fa fa-file-code-o'></i><a href='#'>    " + data.arrDifferenceFile[i].RunLocation + "</a></li>";
        }
    }

    if (data.arrUnableToOpen.length > 0) {
        html += "<hr>Error Opening Files<hr><br />"
        for (var i = 0; i < data.arrUnableToOpen.length; i++) {
            html += "<li style='display: block'><i class='fa fa-file-code-o'></i>    " + data.arrUnableToOpen[i].RunLocation + +" [" + data.arrUnableToOpen[i].sys + "]</li>";
        }
    }
    
    showInfobox(data);
    $('#hanasystem').html(html);
}

function getRefSystem(sys) {
    return sys === connections[0].system ? connections[1].system : connections[0].system
}

function compareFiles(viewType) {
    "use strict";
    var byId = function(id) {
        return document.getElementById(id);
    },
        base = difflib.stringAsLines(system1file),
        newtxt = difflib.stringAsLines(system2file),
        sm = new difflib.SequenceMatcher(base, newtxt),
        opcodes = sm.get_opcodes(),
        diffoutputdiv = byId("results"),
        contextSize = null;

    selectedViewType = viewType;
    diffoutputdiv.innerHTML = "";
    contextSize = contextSize || null;

    diffoutputdiv.appendChild(diffview.buildView({
        baseTextLines: base,
        newTextLines: newtxt,
        opcodes: opcodes,
        baseTextName: "System 1 [" + connections[0].system + "] File",
        newTextName: "System 2 [" + connections[1].system + "] File",
        contextSize: contextSize,
        viewType: viewType
    }));
}

function clearResults() {
    $('#results').html('');
    system1file = "";
    system2file = "";
}

function checkConnect(sys) {
    getDataSet({
        service: "testcon",
        connection: sys,
        system1: connections[sys].system
    });
}

function checkConnectCB(data) {
    if (data.result === "OK") {
        $("#check" + data.sys).css("background-color", "#9CFF88");
    } else {
        $("#check" + data.sys).css("background-color", "#FE4D4D");
    }
}

function showInfobox(data) {
    var sys1filecount = 0;
    var sys2filecount = 0;
    
    for (var i = 0; i < data.arrMissingFile.length; i++){
        if (data.arrMissingFile[i].sys === connections[0].system){
            sys1filecount++;        
        } else {
            sys2filecount++;
        }
    }
    var strHtml = "<div class='col-md-3'><p align='center'><i class='fa fa-search-minus fa-3x'></i></p><p align='center'>" + sys1filecount + " files missing on " + connections[0].system + ".</p></div>";
    strHtml += "<div class='col-md-3'><p align='center'><i class='fa fa-search-minus fa-3x'></i></p><p align='center'>" + sys2filecount + " files missing on " + connections[1].system + ".</p></div>";
    strHtml += "<div class='col-md-3'><p align='center'><i class='fa fa-file-code-o fa-3x'></i></p><p align='center'>" + data.arrDifferenceFile.length + " files which are not identical.</p></div>";
    strHtml += "<div class='col-md-3'><p align='center'><i class='fa fa-warning fa-3x'></i></p><p align='center'>Unable to open " + data.arrUnableToOpen.length + " files.</p></div>";
    strHtml += "<div class='col-md-12 timetaken'><p><i class='fa fa-clock'></i>  This took " + data.exeTime + " seconds to process.</p></div>";
    $("#infoBody").html(strHtml);
    $('#infoModal').appendTo("body").modal('show');
}

function showSettings(sys) {
    $('#dialogHTML1').css('height', 'auto');
    $('#modaldlg').css('height', 'auto');
    $('#modaldlg').css('width', '720px');
    $('#myModal').appendTo("body").modal('show');

    $('#txtHanaSystem1').val(connections[0].system);
    $('#txtHanaSystem2').val(connections[1].system);
    $('#txtRepo').val(repo);
}

function saveDialog() {
    var header = $('#modal-header').html();
    repo = $('#txtRepo').val();
    connections[0].system = $('#txtHanaSystem1').val();
    connections[1].system = $('#txtHanaSystem2').val();

    $('#hanasystem0').val(connections[0].system);
    $('#hanasystem1').val(connections[1].system);
    $('#repopath').val(repo);
    $('#myModal').modal('hide');
    init();
}



function getDataSet(options) {
    showExecuting(true);
    var html = "";
    var jURL = "lib/api.xsjs";

    $.ajax({
        url: jURL,
        type: "GET",
        data: options,
        success: function(data) {
            objData = JSON.parse(data);
            if (options.service === "testcon") {
                objData.sys = options.connection;
                checkConnectCB(objData);
            } else if (options.service === "read") {
                doCheckCB(objData);
            } else if (options.service === "getfiles") {
                objData.path = options.path;
                getFileCompareCB(objData);
            }
            showExecuting(false);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            if (options.service === "testcon") {
                if (jqXHR.responseText.indexOf("destination not found") > 0) {
                    var objData = {};
                    objData.result = "Not Found";
                    objData.sys = options.connection;
                    checkConnectCB(objData);
                }
            }
            showExecuting(false);
        }
    });
}