var timeDelay;
var cycleMode;
var clockWindow;
var userUrl = [];
var userDir = [];
var content = [];
var contentPriority = {};
var clockAlignment = {};
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
	configOld = config
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
	if (JSON.stringify(config) != JSON.stringify(configOld)){
		applySetings();
	}
}
getSettings(true);

//send current options to server to be saved
function saveSettings() {
	config = { //take all options and put them in 1 object
		'timeDelay': timeDelay,
		'cycleMode': cycleMode,
		'clockWindow': clockWindow,
		'userUrl': userUrl,
		'contentPriority': contentPriority,
        'userDir': userDir,
		'clockAlignment': clockAlignment
	};
    $.ajax({
        url: '/api/saveSettings',
        type: "POST",
        data: JSON.stringify(config),
        contentType: "application/json",
        async: false
    });
}

//reflect settings recieved from settings.json on to UI
function applySetings() {
	userUrl = config.userUrl;
	userDir = config.userDir;
	content = content.concat(config.userUrl);
	contentPriority = config.contentPriority;
	timeDelay = config.timeDelay;
	cycleMode = eval(config.cycleMode);
	clockWindow = config.clockWindow;

	$(time).val(timeDelay / 1000);
	$(dir).val(userDir);
	if (cycleMode) {
		$(cycle).click();
	} else {
		$(swap).click();
	}

	if (clockWindow === 'win1') {
		$(cOne).click();
	} else if (clockWindow === 'win2') {
		$(cTwo).click();
	} else if (clockWindow === 'win3') {
		$(cThree).click();
	}
	clockAlignUI();
}

//handle input and call update options
function handleInput() {
	if (document.getElementById('url').value != 0) { //if not null, add url to userUrl
		if ($('#urlAdd').hasClass('active')){
			userUrl.push(document.getElementById('url').value);
			userUrl = _.uniq(userUrl)
		} else {
			userUrl = _.without(userUrl, document.getElementById('url').value);
		}
	}
	if (document.getElementById('time').value !== 0) {
		timeDelay = document.getElementById('time').value * 1000;
	}
	if (document.getElementById('dir').value != 0) {
		userDir = document.getElementById('dir').value;
	}
	if ($(cycle).hasClass('active')) {
		cycleMode = true;
	} else {
		cycleMode = false;
	}
	if (document.getElementById('priorityFile').value !== 0 && document.getElementById('priorityValue').value !== 0) {
		priorityFile = document.getElementById('priorityFile').value;
		priorityValue = parseInt(document.getElementById('priorityValue').value);
		if (_.contains(content, priorityFile)){
			contentPriority[ priorityFile ] = priorityValue;
		}
	}
	clockAlignUI();
	saveSettings(); //call saveSettings() to send new data options server
}

//run ContentCycle() or ContentSwap() on a timer
function callback() {
	getSettings(false);
	setTimeout(callback, timeDelay);
}
setTimeout(callback, timeDelay);

//set clockWindow based on button state
$('#cOne, #cTwo, #cThree').click(function () {
	if (this.id === 'cOne') {
		clockWindow = 'win1';
	} else if (this.id === 'cTwo') {
		clockWindow = 'win2';
	} else if (this.id === 'cThree') {
		clockWindow = 'win3';
	}
});

function clockAlignUI() {
	var align =  config.clockAlignment
	if (align.vertical == 'top') {
		if (align.horizontal == 'left') {
			$('#tl').addClass('active');
		} else if(align.horizontal == 'right') {
			$('#tr').addClass('active');
		}
	} else if (align.vertical = 'bottom'){
		if (align.horizontal == 'left') {
			$('#bl').addClass('active');
		} else if(align.horizontal == 'right') {
			$('#br').addClass('active');
		}
	}
}

$('#tl, #tr, #bl, #br').click(function () {
	if (this.id === 'tl') {
		clockAlignment.vertical = 'top';
		clockAlignment.horizontal = 'left';
	} else if (this.id === 'tr') {
		clockAlignment.vertical = 'top';
		clockAlignment.horizontal = 'right';
	} else if (this.id === 'bl') {
		clockAlignment.vertical = 'bottom';
		clockAlignment.horizontal = 'left';
	} else if (this.id === 'br') {
		clockAlignment.vertical = 'bottom';
		clockAlignment.horizontal = 'right';
	}
});
