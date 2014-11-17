//WEBVTT Parser service

angular.module('webvttParser', []).factory('webvttParser', [function(){



	/**
	* Some regular expressions for parsing
	*/
	var TIMESTAMP = /^(?:(\d{2,}):)?(\d{2}):(\d{2})[,.](\d{3})$/,
	CUE = /^(?:(.*)(?:\r\n|\n))?([\d:,.]+) --> ([\d:,.]+)(?:\r\n|\n)(.*)$/,
	WEBVTT = /^\uFEFF?WEBVTT(?: .*)?/;



	var trimStr = function(text) {
		return (text || "").replace( /^(\s|\u00A0)+|(\s|\u00A0)+$/g, "" );
	}

	/**
	* Converts a WebVTT timestamp into a floating number
	*/
	function timestampToNumber(time) {

		if (!TIMESTAMP.test(time)) {
			throw "'" + time + "' doesn't match to the WebVTT timestamp pattern.";
		}
		var matches = TIMESTAMP.exec(time),
			number = matches[4] / 1000;
			
		number += parseInt(matches[3], 10);
			
		if (matches[2]) {
			number += matches[2] * 60;
		}

		if (matches[1]) {
			number += matches[1] * 60 * 60;
		}
		return number;

	}


	/**
	* Parse the WebVTT source into a javascript array
	*/
	function parse(text) {

		var lines = trimStr(text).split(/(?:(?:\r\n|\n){2,})/),
			cues = [],
			matches = [],
			i = 0;


		do {
			// If there is the optional WebVTT Header, omit first two lines
			if (i === 0 && WEBVTT.test(lines[i])) {
				i += 1;
			}

			if (!CUE.test(lines[i])) {
				throw "An error while parsing a WebVTT cue string on cue " + (i + 1) + ".";
			}
			matches = CUE.exec(lines[i]);
			cues.push({
				marker: matches[1],
				from: timestampToNumber(matches[2]),
				to: timestampToNumber(matches[3]),
				payload: matches[4]
			});
			i += 1;
		} while (i < lines.length);

		return cues;
	}

	return {

		parser: function(source, time) {


			var element = angular.element(document.querySelector(source)),
				matches = '';
			
			if (!element.data('webvtt')) {
				element.data('webvtt', parse(element.html()));
			}

			if (typeof time !== "number") {
				time = timestampToNumber(time);
			}


			angular.forEach(element.data('webvtt'), function (cue, index) {
				
				if (cue.from <= time && cue.to > time) {
					matches = cue.payload;
				}
			});

			return matches;
		}

	};


}]);