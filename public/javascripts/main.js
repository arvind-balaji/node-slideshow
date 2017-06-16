var timeDelay;
var cycleMode;
var clockWindow;
var userUrl = [];
var content = [];
var weightedContent = [];
var contentQueue = {
	0: '',
	1: '',
	2: '',
	3: '',
	4: '',
	5: ''
};
var contentPriority = {};
var config = {};

//get list of content from server
function getContent() {
	content = $.ajax({
		type: 'POST',
		url: '../',
		data: 'blerb',
		dataType: 'JSON',
		context: document.body,
		global: false,
		async: false,
		success: function (data) {
			return data;
		}
	}).responseJSON;
}

//get settings.json from server
function getSettings(initial) {
	config = $.ajax({
		type: 'POST',
		url: '/api/getSettings',
		data: config,
		dataType: 'JSON',
		context: document.body,
		global: false,
		async: false,
		success: function (data) {
			return data;
		}
	}).responseJSON;
	getContent();
	applySetings(initial);
}
getSettings(true);

var width = screen.width / 3;
var height = screen.height;

//create 3 child windows with references
var win1 = window.open('../child/child.html', 'win1', 'width=' + width + ',height=' + height + '');
var win2 = window.open('../child/child.html', 'win2', 'width=' + width + ',height=' + height + ',left=' + width + '');
var win3 = window.open('../child/child.html', 'win3', 'width=' + width + ',height=' + height + ',left=' + width * 2 + '');

//apply settings recieved from settings.json to variables and UI
function applySetings(initial) {
	userUrl = config.userUrl;
	content = content.concat(config.userUrl);
	contentPriority = config.contentPriority;
	applyPriority();
	if (initial) {
		queueContent();
	} else {
		startClock(eval(clockWindow));
	}
	timeDelay = config.timeDelay;
	cycleMode = eval(config.cycleMode);
	clockWindow = config.clockWindow;
	//startClock(eval(clockWindow));

}

//handle unload by closing child windows
function handleUnload() {
	win1.close();
	win2.close();
	win3.close();
}

//apply priority settings from settings.json
function applyPriority() {
	tempArray = [];
	for (var key in contentPriority) { //iterate through the items in contentPriority
		if (contentPriority.hasOwnProperty(key)) {
			for (var i = contentPriority[key] - 1; i > 0; i--) {
				tempArray.push(key); //add the item to temp array for however many times is set for item
			}
		}
	}
	weightedContent = content.concat(tempArray); //add tempArray to weightedContent
}

//send content path to child window
function contentToWindow(file, window) {
	var path = '/images/' + file;
	if (file.toString().substring(0, 4) === 'http') { //check if file is a URL or local
		window.dataFromParent = file; //dataFromParent is a variable in child.html
	} else {
		window.dataFromParent = path; //dataFromParent is a variable in child.html
	}
	window.init();
}

//start clock on child window
function startClock(window) {
	if (clockWindow != null) { //check if null
		window.toggleClock(true);
	}
}

var initial = true;
//run ContentCycle() or ContentSwap() on a timer
function callback() {

	if (initial) {
		messageExtension(); //temporary workaround
		messageExtension(); //messageExtension() needs to be called twice
		initial = false;
	}
	// messageExtension();
	if (cycleMode) {
		contentCycle();
	} else {
		contentSwap();
	}

	getSettings(false);
	setTimeout(callback, timeDelay);
}
setTimeout(callback, timeDelay);

var randPrev;
var rand;

//get a random number that is different from the past 2
function getUniqueRandom() {
	var i = true;
	while (i) {
		var randTemp = Math.floor((Math.random() * weightedContent.length)); //generate random number within length of content
		if (randTemp === rand || randTemp === randPrev || weightedContent[randTemp] === weightedContent[rand] || weightedContent[randTemp] === weightedContent[randPrev]) {
			i = true;
		} else {
			randPrev = rand;
			rand = randTemp;
			i = false;
		}
	}
	return randTemp;
}

//queue up initial content to display
function queueContent() {
	for (var key in contentQueue) {
		contentQueue[key] = weightedContent[getUniqueRandom()];
	}
	console.log(contentQueue);
}

//cycle content across windows on timer
function contentCycle() {
	for (var key in contentQueue) {
		if (parseInt(key) + 1 === Object.keys(contentQueue).length) {
			contentQueue[key] = weightedContent[getUniqueRandom()];
		} else {
			contentQueue[key] = contentQueue[parseInt(key) + 1]; //shift content over by settting new key to previous key
			if (parseInt(key) <= 2) {
				var winNum = parseInt(key) + 1;
				contentToWindow(contentQueue[key], eval('win' + winNum));
			}
		}
	}
}

//swap out all content on windows on timer
function contentSwap() {
	for (var key in contentQueue) {
		if (parseInt(key) > 2) {
			contentQueue[key] = weightedContent[getUniqueRandom()];
		} else {
			contentQueue[key] = contentQueue[parseInt(key) + 3];
			if (parseInt(key) <= 2) {
				var winNum = parseInt(key) + 1;
				contentToWindow(contentQueue[key], eval('win' + winNum));
			}
		}
	}
}

function messageExtension() {
	var event = document.createEvent('Event');
	event.initEvent('hello');
	document.dispatchEvent(event);
}

//win3.onload = alert('test');
