var TriviaCrackAPI = {};

TriviaCrackAPI.CreateUser = function (callback) {
	var headers = {
		"Accept": "application/json, text/javascript, */*; q=0.01",
		"Content-Type": "application/json; charset=utf-8",
	};

	var data = {
		email: "Trivia-Cracker-" + new Date().getTime() + "@gmail.com"
	}

	data = JSON.stringify(data);

	$.ajax({
		type: "POST",
		headers: headers,
		url: "https://api.preguntados.com/api/users",
		data: data,
	})
	.always(function (response, error, request) {
		callback(error, response, request)
	});
}

TriviaCrackAPI.sendGift = function (fromTriviaCrackId, targetFacebookId, giftType, callback) {
	// valid giftType values are "LIFE" and "EXTRA_SHOT"

	var headers = {
		"Accept": "application/json, text/javascript, */*; q=0.01",
		"Content-Type": "application/json; charset=utf-8"//,
	};

	var data = {
		"action": "SEND",
		"items": [{
			"type": giftType
		}],
		"receivers": [{
			"facebook_id": targetFacebookId
		}]
	};

	data = JSON.stringify(data);

	$.ajax({
		type: "POST",
		headers: headers,
		url: "https://api.preguntados.com/api/users/" + fromTriviaCrackId + "/gifts",
		data: data
	})
	.always(function (response, error) {
		callback(error, response)
	});
}