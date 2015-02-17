const FREE_TRIAL_PERIOD_DAYS = 2;

function verifyLicense(callback) {
    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
        $.ajax({
            url: "https://www.googleapis.com/chromewebstore/v1.1/userlicenses/mpaoffaaolfohpleklnbmhbndphfgeef",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .done(function(license) {
            var licenseStatus = null;

            if (license.result && license.accessLevel == "FULL") {
                licenseStatus = "FULL";
            } 
            else if (license.result && license.accessLevel == "FREE_TRIAL") {
                var daysAgoLicenseIssued = Date.now() - parseInt(license.createdTime, 10);
                daysAgoLicenseIssued = daysAgoLicenseIssued / 1000 / 60 / 60 / 24;
                
                if (daysAgoLicenseIssued <= FREE_TRIAL_PERIOD_DAYS) {
                    licenseStatus = "FREE_TRIAL";
                }
                else {
                    licenseStatus = "FREE_TRIAL_EXPIRED";
                }
            }
            else {
                licenseStatus = "NONE";
            }

            console.log("Trivia Cracker license: " + licenseStatus);
            callback(licenseStatus);
        }); 
    });   
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.verifyLicense) {
            verifyLicense(sendResponse);
            return true;
        }
    }
);