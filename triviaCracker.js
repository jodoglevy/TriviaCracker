var userID = null;
var facebookID = null;

var cachedLicenseStatus = null;
var cachedLicenseCachedUntilTime = new Date(0);

function setUp() {
    
    setTimeout(function() {
        var hackButtonClass = "hackButton";
        
        var existingHackButton = $("." + hackButtonClass);
        var hackButtonContainer = $(".btns-menu.pull-right");
        var achievementButton = $(".btn.btn-primary.achievements");
        var volumeButton = $(".btn.btn-primary.toggle-sounds");

        if(existingHackButton.length == 0 && hackButtonContainer.length != 0) {
            var hackButton = $("<button />");
            var hackImage = $("<img title='Select the correct answer using Trivia Cracker!' style='width: 30px' />");
            var hackButtonImage = 'images/app/triviaCrackerAnswerButton.png';
            hackImage.attr("src", chrome.extension.getURL(hackButtonImage));
            hackButton.append(hackImage);
            hackButton.addClass(hackButtonClass);
            hackButton.click(findAnswer);

            var giveGiftButton = $("<button />");
            var giveGiftImage = $("<img title='Get another life or spin using Trivia Cracker!' style='width: 30px' />");
            var giveGiftButtonImage = 'images/app/triviaCrackerGiftButton.png';
            giveGiftImage.attr("src", chrome.extension.getURL(giveGiftButtonImage));
            giveGiftButton.append(giveGiftImage);
            giveGiftButton.click(function() {
                
                $("<div title='What would you like to do?' />").dialog({
                    width: 500,

                    buttons: {
                        "Add Life": function() {
                            sendGift("LIFE");
                            $(this).dialog("close");
                        },
                        "Add Spin": function() {
                            sendGift("EXTRA_SHOT");
                            $(this).dialog("close");
                        },
                        "Get For Android": function() {
                            showOtherCheats();
                            $(this).dialog("close");
                        },
                        //"More Cheats": function() {
                        //    showOtherCheats();
                        //    $(this).dialog("close");
                        //},
                        "Help": function() {
                            window.open("https://apptastic.uservoice.com/knowledgebase/topics/74850-trivia-cracker");
                            $(this).dialog("close");
                        }
                    }

                });
            });

            hackButtonContainer.append(hackButton);
            hackButtonContainer.append(giveGiftButton);

            achievementButton.hide();
            volumeButton.hide();

            getUserIDs();

            askUserToReview();
        }
        else{
            setUp();
        }
    }, 500);

}

function tellUserToPurchase() {
    alert('Your Trivia Cracker free trial has expired. Please buy the full version to continue using Trivia Cracker.');
    window.open("https://chrome.google.com/webstore/detail/trivia-cracker/mpaoffaaolfohpleklnbmhbndphfgeef");
}

function verifyLicense(callback) {
    var now = new Date();
    var timeDiff = cachedLicenseCachedUntilTime - now;

    if(cachedLicenseStatus && timeDiff > 0) {
        // use cached license status
        console.log("Trivia Cracker cached license: " + cachedLicenseStatus);
        console.log("Cached until: " + cachedLicenseCachedUntilTime);

        if(cachedLicenseStatus == "FULL" || cachedLicenseStatus == "FREE_TRIAL") {
            incrementPaidUses();
            callback(cachedLicenseStatus);
        }
        else {
            tellUserToPurchase();
        }
    }
    else {
        // check license status and cache it

        chrome.runtime.sendMessage({"verifyLicense": true}, function(licenseStatus) {
            console.log("Trivia Cracker license: " + licenseStatus);
            
            if(licenseStatus) {
                cachedLicenseStatus = licenseStatus;

                if(licenseStatus == "FULL" || licenseStatus == "FREE_TRIAL") {
                    // cache for 30 minutes
                    cachedLicenseCachedUntilTime = new Date(now.getTime() + 1000*60*30);
                    
                    incrementPaidUses();
                    callback(licenseStatus);
                }
                else {
                    // cache for 1 minute
                    cachedLicenseCachedUntilTime = new Date(now.getTime() + 1000*60*1);

                    tellUserToPurchase();
                }
            }
            else {
                // hit an error, couldn't get license status
                alert("We were unable to validate your Trivia Cracker license. Opening troubleshooting page.");
                window.open("https://apptastic.uservoice.com/knowledgebase/articles/504907-why-does-trivia-cracker-tell-me-we-were-unable-to");
            }
        });
    }
}

function sendGift(giftType) {
    // valid giftType values are "LIFE" and "EXTRA_SHOT"

    verifyLicense(function() {
        
        var messageData = {
            sendGift: true,
            targetFacebookId: facebookID,
            giftType: giftType
        }

        chrome.runtime.sendMessage(messageData, function() {
            window.location.reload();
        });
    })
}

function showOtherCheats() {
    $("<div title='More from Apptastic!'>Looking to cheat at other popular games? Check out our other hacks to get a leg up on the competition!</div>").dialog({
        width: 460,

        buttons: {
            "Trivia Crack (Facebook)": function() {
                window.open("https://chrome.google.com/webstore/detail/trivia-cracker/mpaoffaaolfohpleklnbmhbndphfgeef");
                $(this).dialog("close");
            },
            "Trivia Crack (Android)": function() {
                window.open("https://play.google.com/store/apps/details?id=com.apptastic.triviacracker");
                $(this).dialog("close");
            }
        }
    });
}

function askUserToReview() {
    if(localStorage.paidUses && parseInt(localStorage.paidUses) >= 20 && !localStorage.dontAskUserToReview) {
        
        $("<div title='How are we doing?'>Hey there! If you're enjoying Trivia Cracker, would you mind posting a quick review?</div>").dialog({
            width: 460,

            buttons: {
                "Sure": function() {
                    window.open("https://chrome.google.com/webstore/detail/trivia-cracker/mpaoffaaolfohpleklnbmhbndphfgeef/reviews");
                    localStorage.setItem("dontAskUserToReview", "true");
                    $(this).dialog("close");
                },
                "Maybe later": function() {
                    $(this).dialog("close");
                },
                "No thanks": function() {
                    localStorage.setItem("dontAskUserToReview", "true");
                    $(this).dialog("close");
                }
            }
        });

    }
}

function incrementPaidUses() {
    var paidUses = 1;

    if(localStorage.paidUses) {
        paidUses = parseInt(localStorage.paidUses) + 1;
    }

    localStorage.setItem("paidUses", ("" + paidUses));
}

function findAnswer() {
    verifyLicense(function() {
        var url = (window.location.href);
        var urlParts = url.split("#game/");
        
        if(urlParts.length == 2) {
            // we are in a game, look for an answer

            var gameID = urlParts[1];
            
            TriviaCrack.GetGameData(gameID, userID, new Date().getTime(), function(err, response) {
                var response = response.response;

                if(response.type == "DUEL_GAME") {
                    // game type is a many-user challenge
                    findManyUserChallengeAnswer(response);
                }
                else {
                    // game type is either regular, playing for a crown, or a
                    // two person challenge
                    findRegularAnswer(response);
                }
            });
        }
    });
}

function findRegularAnswer(response) {
    var questionText = $(".question-container").find("p").text().toLowerCase();

    // crown or regular questions    
    var questions = response.spins_data.spins[0].questions;
    
    // check if two person challenge questions were also sent
    // if so, add them to questions array we will search through
    if(response.spins_data.spins[1]) {
        questions = questions.concat(response.spins_data.spins[1].questions);
    }

    questions.forEach(function(questionItem) {
        var question = questionItem.question;

        if(question.text.toLowerCase() == questionText) {
            var correctAnswerString = question.answers[question.correct_answer];
            clickCorrectAnswer(correctAnswerString);
        }
    });
}

function findManyUserChallengeAnswer(response) {
    var currentQuestionIndexString =  $(".duel-stats").find("span").first().text();
    var currentQuestionIndex = parseInt(currentQuestionIndexString.split("/")[0]) - 1;
    var currentQuestion = response.questions[currentQuestionIndex];

    var correctAnswerString = currentQuestion.answers[currentQuestion.correct_answer];

    clickCorrectAnswer(correctAnswerString);
}

function clickCorrectAnswer(correctAnswer) {
    console.log(correctAnswer);

    var answers = $(".answers-container").find("button");
    answers.each(function(index, answer) {
        var answerText = $(answer).find("p").first().text();

        if(answerText.toLowerCase() == correctAnswer.toLowerCase()) {
            $(answer).trigger("click");
        }
    });
}

function getUserIDs() {
    var request = window.indexedDB.open("localforage", 1);

    request.onerror = function(event) {
        console.log(event);
    };

    request.onsuccess = function(event) {
        var db = event.target.result;
        var transaction = db.transaction(["keyvaluepairs"]);
        var objectStore = transaction.objectStore("keyvaluepairs");
    
        var request = objectStore.get("session_data");
        
        request.onerror = function(event) {
            console.log(event);
        };
        
        request.onsuccess = function(event) {
            userID = request.result.id;

            TriviaCrack.GetUserData(userID, new Date().getTime(), function(err, response) {
                facebookID = response.response.facebook_id;
            });
        };
    };
}

document.addEventListener('DOMContentLoaded', function (evt) {
    setUp();
}, false);