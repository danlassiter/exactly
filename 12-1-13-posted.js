var sliderMoved = false;

//
// DISPLAY SETTINGS
//

var verticalBuffer = 40;
var horizontalBuffer = 50;
var sideLength = 80; // set desired side length
var delta = Math.sqrt(Math.pow(sideLength,2)/2);
var interDieSpace = 50; 
// vertical distance between lower point of upper die and upper point of lower die, same for horizontal mutatis mutandis
var canvasHeight = 2 * verticalBuffer + 4 * delta + interDieSpace;
var canvasWidth = 2 * horizontalBuffer + 4 * delta + interDieSpace;
var dotRadius = 8;

//
// LINGUISTIC STIMULI
//

var numberOfQuestions = 40;

var quantifiers = ['exactly', 'only', 'more than', 'less than', 'bare'];
var numbers = ['four', 'five','six','seven','eight'];
var contexts = ['plain','existential'];
var colors = ['red', 'black'];

/*
var fillers = [

]
*/

var mintxt = "totally unacceptable";
var maxtxt = "totally acceptable";

var $j = jQuery.noConflict();

function Capitalize(string) {
	var firstLetter = string.substring(0,1); 
	firstLetter = firstLetter.toUpperCase(); 
	var rest = string.substring(1,string.length); 
	return firstLetter.concat(rest);
}

function clearPaper(p){
    var paperDom = p.canvas;
    paperDom.parentNode.removeChild(paperDom);
}

function makeDiamondPath(xy, delta) {
	var x = xy[0];
	var y = xy[1];
	str = 'M' + x + ',' + y + 'L' + (x + delta) + ',' + (y + delta) + 'L' + x + ',' + (y + 2*delta) + 'L' + (x - delta) + ',' + (y+delta) + 'Z'
	return str;
}

function makeDotArray(xy, num, sideLength, delta) {
	var x = xy[0];
	var y = xy[1];
	if (num == 1) {
		var loc = [[x, y+delta]];
	} else if (num == 2) {
		var loc = [[x, y+(2*delta/3)],[x, y+(4*delta/3)]];
	} else if (num == 3) {
		var loc = [[x, y+(delta/2)], [x, y+delta], [x, y+delta*3/2]];
	} else if (num == 4) {
		var loc = [[x,y+delta/2],[x+delta/2,y+delta],[x,y+delta*3/2],[x-delta/2,y+delta]];
	} else if (num == 5) {
		var loc = [[x,y+delta/2],[x+delta/2,y+delta],[x,y+delta*3/2],[x-delta/2,y+delta],[x,y+delta]];
	} else if (num == 6) {
		var inset = Math.sqrt(.5*Math.pow(sideLength/3,2));
		var dr = dotRadius;
		var x1 = x;
		var y1 = y + inset + dr;
		var x3 = x - delta + inset + dr;
		var y3 = y + delta;
		var x4 = x + delta - inset - dr;
		var y4 = y + delta;
		var x6 = x;
		var y6 = y + 2*delta - inset - dr;
		var x2 = x3 + (x1 - x3)/2;
		var y2 = y1 + (y3 - y1)/2;
		var x5 = x6 + (x4 - x6)/2;
		var y5 = y4 + (y6 - y4)/2;
		var loc = [[x1,y1],[x2,y2],[x3,y3],[x4,y4],[x5,y5],[x6,y6]];
	}
	return loc;
}

function showSlide(id) {
	$j(".slide").hide();
	$j("#"+id).show();
}

function shuffle(v) { // non-destructive.
    newarray = v.slice(0);
    for(var j, x, i = newarray.length; i; j = parseInt(Math.random() * i), x = newarray[--i], newarray[i] = newarray[j], newarray[j] = x);
    return newarray;
};

function random(a,b) {
    if (typeof b == "undefined") {
	a = a || 2;
	return Math.floor(Math.random()*a);
    } else {
	return Math.floor(Math.random()*(b-a+1)) + a;
    }
}

Array.prototype.random = function() {return this[random(this.length)];}

$j(document).ready(function() {

    new Control.Slider('handle0', 'track0', {
    	sliderValue: .5,
		onSlide: function(v) { $('debug0').innerHTML = Math.floor(v*100); },
		onChange: function(v) { $('debug0').innerHTML = Math.floor(v*100); }
	}); 
	$j("#debug0").html("50");

    showSlide("instructions");
    $j(".numquestions").html(numberOfQuestions);
    $j("#totaltime").html(Math.round(numberOfQuestions/4,0));
    $j(".mintxt").html(mintxt);
    $j(".maxtxt").html(maxtxt);
	$j("#sliderexamplediv").show();
    $j("#instructions #mustaccept").hide();
    $j("#canvascontainer").height(canvasHeight);
	$j("#canvascontainer").width(canvasWidth);
	$j("#canvas").height(canvasHeight);
	$j("#canvas").width(canvasWidth); 
	return false;
});

var experiment = {
    data: {},
    intro: function () {
    	if (turk.previewMode) {
	    	$j("#instructions #mustaccept").show();
		} else {
	    	showSlide("intro");
	    }
	    return false;
    },
    begin: function () {
		showSlide("stage");
		experiment.next(1);
		return false;
    },
    next: function(num) {
    	if (num > numberOfQuestions) { // ask for language and then submit data to Turk
		    showSlide("language");
		    $j("#lgerror").hide();
		    $j("#lgbox").keypress(function(e){ // capture return so that it doesn't restart experiment
		    	if (e.which == 13) {
		    		return(false);
		    	}
		    });
		    $j("#lgsubmit").click(function(){
				var lang = document.getElementById("lgbox").value;
				if (lang.length >= 3) {
				    experiment.data.language = lang;
				    showSlide("finished");
				    setTimeout(function() { turk.submit(experiment.data) }, 1000);
				}
				return(false);
			});
		} else { 
	    	// main experiment code
	    	$j("#continue").unbind("click");
	    	var qdata = {};
	    	var startTime = (new Date()).getTime(); 
	    	$j("#slidererror").hide();
	    	$j(".sliders").hide();
	    	
	    	$j("#sliderdiv").html('<table style="margin:auto;"><tr><td class="mintxt" style="padding-right:5px; width:30px; text-align:center;">{{}}</td><td><div id="track' + num + '" style="margin:auto; width:300px; background-color:#ccc; height:10px;"><div id="handle' + num + '" style="width:10px; height:15px; background-color:#f00; cursor:move;"></div></div></td><td class="maxtxt" style="padding-left:5px; width:30px; text-align:center;">{{}}</td></tr></table><p id="debug' + num + '">&nbsp;</p>');
	    	$j(".mintxt").html(mintxt);
    		$j(".maxtxt").html(maxtxt);
    		var initialValue = Math.random();
	    	qdata.initialValue = initialValue;
    		$j("#debug"+num).html(Math.floor(initialValue*100));
	    	var response;
	    	new Control.Slider('handle'+num, 'track'+num, {
    			sliderValue: initialValue,
				onSlide: function(v) { 
					$('debug' + num).innerHTML = Math.floor(v*100); 
					sliderMoved = true;
					response = v;
					return false;
				},
				onChange: function(v) { 
					$('debug' + num).innerHTML = Math.floor(v*100); 
					sliderMoved = true;
					response = v;
					return false;
				}
			}); 
	    	sliderMoved = false;
	    	var paper = Raphael("canvas", canvasWidth, canvasHeight);
	    	var redDie1 = [0,1,2,3].random();
	    	var redDie2 = [0,1,2,3].random();
	    	while (redDie1 == redDie2) {
	    		redDie2 = [0,1,2,3].random();
	    	}
	  		var numberOfRedDots = 0;
	  		var numberOfBlackDots = 0;
	    	dieTopCoordinates = [ // in counter-clockwise order: 0 is top, 1 is left, 2 is bottom, 3 is right
	    		[canvasWidth/2, verticalBuffer],
	    		[horizontalBuffer + delta, verticalBuffer + 2*delta + interDieSpace/2 - delta],
	    		[canvasWidth/2, verticalBuffer + 2*delta + interDieSpace],
	    		[canvasWidth - horizontalBuffer - delta, verticalBuffer + 2*delta + interDieSpace/2 - delta]
	    	]; 
	    	for (var i=0; i<4; i++) {
	    		var die = paper.path(makeDiamondPath(dieTopCoordinates[i], delta));
	    		die.attr({"stroke-width": 4, fill: "white"});
	    		var numDots = [1,2,3,4,5,6].random();
	    		var dotLocations = makeDotArray(dieTopCoordinates[i], numDots, sideLength, delta);
	    		if (i == redDie1 || i == redDie2) {
	    			numberOfRedDots = numberOfRedDots + numDots;
	    			var color = "red";
	    		} else {
	    			numberOfBlackDots = numberOfBlackDots + numDots;
	    			var color = "black";
	    		}
	    		qdata['die' + i + 'numdots'] = numDots;
	    		qdata['die' + i + 'color'] = color;
	    		for (j=0; j<numDots; j++) {
	    			// make a dot for each [x,y] in array dotLocations[j]
	    			var dot = paper.circle(dotLocations[j][0],dotLocations[j][1],dotRadius);
	    			dot.attr({fill: color});
	    		}
	    	}
	    	qdata.numRed = numberOfRedDots;
	    	qdata.numBlack = numberOfBlackDots;
	    	var context = contexts.random();
	    	qdata.context = context;
	    	var quantifier = quantifiers.random();
	    	qdata.quantifier = quantifier;
	    	var number = numbers.random();
	    	qdata.number = number;
	    	var qcolor = colors.random();
	    	qdata.qcolor = qcolor;
	    	if (num == Math.floor(numberOfQuestions/3) || num == Math.floor(numberOfQuestions*2/3)) {
	    		qdata.attentionCheck = 'Yes';
	    		qdata.requestedValue = Math.floor(Math.random()*100);
	    		$j("#questiontxt").html("<br><b>Please adjust the slider to the value " + qdata.requestedValue + ".</b>");
	    	} else {
	    		qdata.attentionCheck = 'No';
	    		qdata.requestedValue = "NA";
		    	if (qdata.context == 'plain') {
		    		if (quantifier == 'bare') {
		    			$j("#questiontxt").html('<br>How acceptable is the following statement as a description of the picture?<br><br><b>"' + Capitalize(number) + ' dots are ' + qcolor + '."</b>');
		    		} else {
			    		$j("#questiontxt").html('<br>How acceptable is the following statement as a description of the picture?<br><br><b>"' + Capitalize(quantifier) + ' ' + number + ' dots are ' + qcolor + '."</b>');
			    	}
		    	} else {
		    		if (quantifier == 'bare') {
		    			$j("#questiontxt").html('<br>How acceptable is the following statement as a description of the picture?<br><br><b>"There are ' + number + ' ' + qcolor + ' dots."</b>');
		    		} else {
						$j("#questiontxt").html('<br>How acceptable is the following statement as a description of the picture?<br><br><b>"There are ' + quantifier + ' ' + number + ' ' + qcolor + ' dots."</b>');
		    		}
		    	}
		    }
	    	$j("#continue").click(function() {
				if (!sliderMoved) {
			    	$j("#slidererror").show();
			    	return false;
				} else {
					$j('.bar').css('width', (200.0 * num / numberOfQuestions) + 'px');
				    var endTime = (new Date()).getTime(); 
				    qdata.rt = endTime - startTime;
				    qdata.response = Math.floor(100*response);
				    experiment.data['q' + num] = qdata;
				 	clearPaper(paper);
	    			experiment.next(num + 1);
	    			return false;
	    		}
	    	});
	    }
	    return false;
	}
}