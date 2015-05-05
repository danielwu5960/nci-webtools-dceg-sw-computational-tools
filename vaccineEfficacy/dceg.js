"use strict";

$(function() {

    console.log($.now() + " - dceg.js invoked.");

    console.log('check duplicate ids');
    $('[id]').each(function() {
        var id = $('[id="' + this.id + '"]');
        if (id.length > 1 && id[0] == this) {
            console.log('Duplicate id ' + this.id);
            alert('duplicate found');
        }
    });
    console.log('end.');

    // Load pages. 
    var loadFunction = function(response, status, xhr) {
        console.log("loading page " + status);
        if (status === "error") {
            var msg = "Error: ";
            alert(msg + xhr.status + " " + xhr.statusText);
        }
    };
    $("#nci_logo").load("common/html/NCI_Logo.html", loadFunction);
    $("#nci_foot").load("common/html/NCI_Foot.html", loadFunction);
    // $("#sampleSizeHtml").load("sampleSize.html", loadFunction);
    //$("#riskStratAdvancedHtml").load("riskStratAdvanced.html", loadFunction);
    //$("#vaccineEfficacyHtml").load("vaccineEfficacy.html", loadFunction);

    // tab handling.
    $('#myTab a').click(function(e) {
        e.preventDefault();
        $(this).tab('show');
    });

    // Replace the window.location
    $('#dceg-logo').click(function() {
        var newUrl = window.location + "?fileid=12345";
        console.log(newUrl);
        window.location.replace(newUrl);
    });

});

// define a function.
var activateTab = function(tabId) {
    $('#myTab a[href="#' + tabId + '"]').tab('show');
};

// resize iframe.
function resizeiFrame(iframe) {
    iframe.width = (parseInt($('.container').width()) - 60) + "px";
    iframe.height = (parseInt($('.container').height()) + 5) + "px";
    console.log('' + iframe.width + ', ' + iframe.height);
}

