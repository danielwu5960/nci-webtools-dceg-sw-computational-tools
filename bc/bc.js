var oTable;
var outputTable;
var giRedraw = false;
var aData;
var numberOfRows;
var uniqueKey;

var old_value;
var editing = false;
var row;
var col;
var validPrevValue = false;

$(document).ready(function() {
	bind_reference_row();
	bind_input();
	bind_calculate_button();
	bind_remove_row();
	bind_add_new_row();
});

function bind_remove_row() {
	$(".remove_row_button").on("click", function(){ 
		remove_row($(this));
	});	
}

function bind_add_new_row() {
	$( "#new_row_button" ).click(function() {
		add_new_row();
	});	
}

function bind_calculate_button() {
	$( "#calculate_button" ).click(function() {
		do_calculation();
	});
}

function bind_reference_row() {
    $('.reference').click(function (e) {
    	var row = $(this).attr("row");
    	var col = $(this).attr("col");
		clear_reference_row();
		$(this).html("<img src='/common/images/checkbox.png' height='18' width='18' alt='check'/>");
		$(this).parent().addClass("reference_row")
			.children().last().empty().html("&nbsp");
    });	
}

function bind_input() {
    $('.input').click(function (e) {
    	if (!editing) {
    	   	row = $(this).attr("row");
        	col = $(this).attr("col");
        	var val = $(this).text();
        	old_value = val;
        	var inp = $("<INPUT id='new_value' type='text' size='5' class='new_value' value=''> </INPUT>");
        	$(this).empty();
        	$(this).append(inp);
        	bind_text_change(inp);
        	inp.focus();
        	editing = true;
    	}
    });	
}

function bind_text_change(inp) {
	// When user clicks without changing the value
	inp.on('blur', function(e) {
		var new_value = $("#new_value").val();
		change_value($(this), new_value);	
	});
/*	
	inp.on('change', function(){
		var new_value = $("#new_value").val();
		change_value($(this), new_value, true);
	});
*/	
	inp.on('keypress', function(e){
		if(e.which == 13) {
			var new_value = $("#new_value").val();
			change_value($(this), new_value);
		}
	});

}


function change_value (field, new_value) {
	
	if (!new_value || new_value == '') {
	    field.parent().empty().text(old_value);
		editing=false;
		return;
	}
	
	if (isNumberBetweenZeroAndOne(new_value)) {
		field.parent().empty().text(new_value);
		editing=false;
	} else {
		alert("Valid Values are between 0 and 1 inclusive, you tried: " + new_value);
	    field.parent().empty().text(old_value);
		editing=false;
	}
	
}

function clear_reference_row() {
	$("#inputdata").find(".reference").html("<img src='/common/images/uncheckbox.png' height='18' width='18' alt='uncheck'/>");
	$("#inputdata").find("tr").each (function () {
		$(this).removeClass("reference_row");
		if (!$(this).hasClass('non-data-row')) {
			$(this).children().last().empty().html("<BUTTON class='remove_row_button'>Remove</BUTTON>");
		}
	});

	bind_remove_row();
	var num_rows = $("#inputdata").find("tr").length - 3;
	if (num_rows <= 2) {
		$("#inputdata").find(".remove_row_button").remove();		
	}
	
}

function add_new_row() {
	// Note 3 non-data rows, top-header, header, and add-new-row button
	var num_rows = $("#inputdata").find("tr").length - 3;
	$("#inputdata").find("tr").last().prev().after("<tr row='" + num_rows + "'>" +
			"<td><b>" + (num_rows+1) + "</b></td>" +
			"<td class='reference' row='" + num_rows + "' col='reference'><img src='/common/images/uncheckbox.png' height='18' width='18'  alt='uncheck'/></td>" + 
			"<td class='input sensitivity' row='" + num_rows + "' col='sensitivity'>&nbsp;</td>" +
			"<td class='input specificity' row='" + num_rows + "' col='specificity'>&nbsp;</td>" +
			"<td><BUTTON class='remove_row_button'>Remove</BUTTON></td>" +
			"</tr>");
	
	// Need to rebind events on the new row
	if (num_rows == 2) {
		$("#inputdata").find("tr").each(function () {
			if (!$(this).hasClass('non-data-row') &&  !$(this).hasClass('reference_row')) {
				$(this).children().last().empty().html("<BUTTON class='remove_row_button'>Remove</BUTTON>");
			}
		});
	}
	bind_remove_row();
	bind_reference_row();
	bind_input();
	
}

function remove_row(el) {
	var row_to_remove = el.parent().parent();
	row_to_remove.remove();
	var num_rows = $("#inputdata").find("tr").length - 3;
	if (num_rows <= 2) {
		$("#inputdata").find(".remove_row_button").remove();		
	}
}

function do_calculation()
{
    var refSpec;
    var refSens;
	
    var sensArray = "";
    var specArray = "";
    var prev = "";
    var sensArrayWithRef = "";
    var specArrayWithRef = "";
    var labels = "";

    var prevalence = $("#prevalence").val();
    
    if (!isNumberBetweenZeroAndOne(prevalence)) {
        validPrevValue = false;
    	prev = 0;
    } else {
        validPrevValue = true;
        prev = prevalence;
    }
    
    var hasNoErrors = true;
    $("#inputdata > tbody > tr").each (function (i, el) {
    	if ($(this).hasClass("reference_row")) {
    		refSens = parseFloat($(this).find(".sensitivity").text());
    		refSpec = parseFloat($(this).find(".specificity").text());
    		sensArrayWithRef += refSens + ",";
    		specArrayWithRef += refSpec + ",";
    		
    		hasNoErrors &= isNumberBetweenZeroAndOne(refSens);
    		hasNoErrors &= isNumberBetweenZeroAndOne(refSpec);
    		
    	}
    	else if (! $(this).hasClass("non-data-row")) {
    		// Add them to the Arrays
    		sensArray += parseFloat($(this).find(".sensitivity").text()) + ",";
    		specArray += parseFloat($(this).find(".specificity").text()) + ",";
    		sensArrayWithRef += parseFloat($(this).find(".sensitivity").text()) + ",";
    		specArrayWithRef += parseFloat($(this).find(".specificity").text()) + ",";
    		hasNoErrors &= isNumberBetweenZeroAndOne(parseFloat($(this).find(".sensitivity").text()));
    		hasNoErrors &= isNumberBetweenZeroAndOne(parseFloat($(this).find(".specificity").text()));
    		labels = labels + (i+1)+",";
    	}
    	
    	
    });
    sensArray = sensArray.slice(0, -1);
    specArray = specArray.slice(0, -1);
    sensArrayWithRef = sensArrayWithRef.slice(0, -1);
    specArrayWithRef = specArrayWithRef.slice(0, -1);
    
    labels = labels.slice(0, -1);

    if (!hasNoErrors) {
    	alert ("Error with input data.  Not all values are numbers between Zero and One");
    	return;
    }
    uniqueKey = (new Date()).getTime();
    
    hostname = window.location.hostname;
    if (validPrevValue)
    {
        $.ajax({
            type: "POST",
            url: "http://"+hostname+"/bcRest/",
            data:{numberOfValues: "8",
                  refSpec: refSpec,
                  refSens: refSens,
                  specArray:specArray,
                  specArrayWithRef:specArrayWithRef,
                  sensArray: sensArray,
                  sensArrayWithRef: sensArrayWithRef,
                  prev: prev,
                  labels: labels,
                  unique_key: uniqueKey},
            dataType:"json",
            success:function(data) {
            	set_data(data);
            },
            error: function (request, status, error) {
                alert(request.responseText);
            }
        });    
    }
    else
    {
        $.ajax({
            type: "POST",
            url: "http://"+hostname+"/bcRest/",
            data:{numberOfValues: "7",
                  refSpec: refSpec,
                  refSens: refSens,
                  specArray:specArray,
                  specArrayWithRef:specArrayWithRef,
                  sensArray: sensArray,
                  sensArrayWithRef: sensArrayWithRef,
                  labels: labels,
                  unique_key: uniqueKey},
            dataType:"json",
            success:function(data) {
            	set_data(data);
            },
            error: function (request, status, error) {
                alert(request.responseText);
            }
        });    
    }
}

function isNumberBetweenZeroAndOne(n) {
	if (isNaN(parseFloat(n))) return false;
	if (n > 1) return false;
	if (n < 0) return false;
	return true;
}

function refreshGraph(drawgraph) {
   if (drawgraph == 1) graph_file = "./tmp/SensSpecLR-"+uniqueKey+".png?";
   else graph_file = "/common/images/fail-message.jpg?";

   d = new Date();
   $("#graph").attr("src", graph_file+d.getTime());
}

function set_data(dt)
{
   var jsonObject=JSON.parse(JSON.stringify(dt));
 
   refreshGraph(1);
   $("#output").empty();
   $("#output th").remove();
   if (validPrevValue)
	{
        createOutputTableWithPrev(jsonObject)
	}
	else
	{
        createOutputTable(jsonObject)
	}
   //from glossary.js for term definition popup in the output
	bindTermToDefine();
}

function jsonToCell(obj)
{
	for (var key in obj)
	{
	    if (obj.hasOwnProperty(key))
	    {
	        value = obj[key];
	        if (key== 'Specificity') Specificity=value;
			else if (key== 'Sensitivity') Sensitivity=value;
			else if (key== 'LRplus') LRplus=value;
			else if (key== 'LRminus') LRminus=value;
	    }
	}
  
	var new_row = $("<tr>");
	new_row.append("<td>" + Sensitivity + "</td>");
	new_row.append("<td>" + Specificity + "</td>");
	new_row.append("<td>" + LRplus + "</td>");
	new_row.append("<td>" + LRminus + "</td>");
	$("#output").append(new_row);
}

function jsonToCellWithPrev(obj)
{
	for (var key in obj)
	{
	    if (obj.hasOwnProperty(key))
	    {
	        value = obj[key];
	        if (key== 'Specificity') Specificity=value;
			else if (key== 'Sensitivity') Sensitivity=value;
			else if (key== 'LRplus') LRplus=value;
			else if (key== 'LRminus') LRminus=value;
			else if (key== 'PPV') PPV=value;
			else if (key== 'cNPV') cNPV=value;
	    }
	}
  
	var new_row = $("<tr>");
	new_row.append("<td>" + Sensitivity + "</td>");
	new_row.append("<td>" + Specificity + "</td>");
	new_row.append("<td>" + LRplus + "</td>");
	new_row.append("<td>" + LRminus + "</td>");
	if (validPrevValue) new_row.append("<td>" + PPV + "</td>");
	if (validPrevValue) new_row.append("<td>" + cNPV + "</td>");
	$("#output").append(new_row);
}

function createOutputTable(jsondata)
{
    $("#output").empty();
    var top_header_row = $("<tr>");
    top_header_row.append("<th class='top-header' colspan='7'>Output Data</th>");
    $("#output").append(top_header_row);

    var header_row = $("<tr>");
    header_row.append("<th class='header'><div class='termToDefine' id='Sens2' data-term='Sens'>Sensitivity</div><div class='popupDefinition' id='Sens2Definition'></div></th>");
    header_row.append("<th class='header'><div class='termToDefine' id='Spec2' data-term='Spec'>Specificity</div><div class='popupDefinition' id='Spec2Definition'></div></th>");
    header_row.append("<th class='header'><div class='termToDefine' id='LRP2' data-term='LRP'>LR+</div><div class='popupDefinition' id='LRP2Definition'></div></th>");
    header_row.append("<th class='header'><div class='termToDefine' id='LRN2' data-term='LRN'>LR-</div><div class='popupDefinition' id='LRN2Definition'></div></th>");
    $("#output").append(header_row);
	
	for (var each in jsondata) {
		jsonToCell(jsondata[each]);
    }
}

function createOutputTableWithPrev(jsondata)
{
    $("#output").empty();
    var top_header_row = $("<tr>");
    top_header_row.append("<th class='top-header' colspan='7'>Output Data</th>");
    $("#output").append(top_header_row);

    var header_row = $("<tr>");
    header_row.append("<th class='header'><div class='termToDefine' id='Sens3' data-term='Sens'>Sensitivity</div><div class='popupDefinition' id='Sens3Definition'></div></th>");
    header_row.append("<th class='header'><div class='termToDefine' id='Spec3' data-term='Spec'>Specificity</div><div class='popupDefinition' id='Spec3Definition'></div></th>");
    header_row.append("<th class='header'><div class='termToDefine' id='LRP3' data-term='LRP'>LR+</div><div class='popupDefinition' id='LRP3Definition'></div></th>");
    header_row.append("<th class='header'><div class='termToDefine' id='LRN3' data-term='LRN'>LR-</div><div class='popupDefinition' id='LRN3Definition'></div></th>");
    header_row.append("<th class='header'><div class='termToDefine' id='PPV3' data-term='PPV'>PPV</div><div class='popupDefinition' id='PPV3Definition'></div></th>");
    header_row.append("<th class='header'><div class='termToDefine' id='cNPV3' data-term='cNPV'>cNPV</div><div class='popupDefinition' id='cNPV3Definition'></div></th>");
    $("#output").append(header_row);
	
	for (var each in jsondata) {
		jsonToCellWithPrev(jsondata[each]);
    }
}

function ajax_error(jqXHR, exception)
{	
   refreshGraph(1);
   alert("ajax problem");
}
