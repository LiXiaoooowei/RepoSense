var getQueryVariable = function(variable, defaultValue) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return decodeURI(pair[1]);
        }
    }
    return defaultValue;
}

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

var getLegalClassName = function(original) {
    return original.replace(/ /g, "-");
}

var getContribution = function(repo) {
    var count = 0;
    for (author in repo['authorFinalContributionMap']) {
        count += repo['authorFinalContributionMap'][author];
    }
    return count;
}

function getScaleLimitMap(docType) {
    var result = {};
    //var docType = docType.join();
    result["authorWeeklyIntervalContributions"] = getScaleLimit("authorWeeklyIntervalContributions", docType);
    result["authorDailyIntervalContributions"] = getScaleLimit("authorDailyIntervalContributions", docType);
    return result;
}

function getScaleLimit(intervalType, docType) {
    var totalContribution = 0;
    var count = 0;
    for (var idx in docType) {
    for (repo in summaryJson[docType[idx]]) {
        for (author in summaryJson[docType[idx]][repo][intervalType]) {
            for (i in summaryJson[docType[idx]][repo][intervalType][author]) {
                currentPeriod = summaryJson[docType[idx]][repo][intervalType][author][i];
                if (totalContribution['insertions'] != 0) {
                    totalContribution += currentPeriod['insertions'];
                    count += 1
                }

            }
        }
    }
    }
    return totalContribution / count * 20;
};

function getIntervalCount(intervalType, minDate, maxDate) {
    var minDateParsed = Date.parse(minDate);
    var maxDateParsed = Date.parse(maxDate);
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

    var diffDays = Math.round(Math.abs((minDateParsed.getTime() - maxDateParsed.getTime()) / (oneDay)));
    if (intervalType == "authorWeeklyIntervalContributions") {
        var divisor = 7;
    } else {
        var divisor = 1;
    }
    return diffDays / divisor;
}

function getTotalContributionLimit(docType) {
    var totalContribution = 0;
    var count = 0;
    for (var idx in docType) {
    for (repo in summaryJson[docType[idx]]) {
        for (author in summaryJson[docType[idx]][repo]['authorFinalContributionMap']) {
            totalContribution += (summaryJson[docType[idx]][repo]['authorFinalContributionMap'][author]);
            count += 1
        }
    }
    }
    return totalContribution / count * 10;
};

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

function flatten(authorRepos) {
    result = [];
    for (repo in authorRepos) {
        for (author in authorRepos[repo]) {
            result.push(authorRepos[repo][author]);
        }
    }
    return result;
}

function sortSegment(segment, sortElement, sortOrder) {
    if (sortOrder == "high2low") {
        segment.sort(function(a, b) {
            if (b[sortElement] > a[sortElement]){
                return 1;
            } else if (b[sortElement] < a[sortElement]){
                return -1
            } else{
                return 0;
            }
        })
    } else {
        segment.sort(function(a, b) {
            if (a[sortElement] > b[sortElement]){
                return 1;
            } else if (a[sortElement] < b[sortElement]){
                return -1
            } else{
                return 0;
            }
        })
    }
    return segment;
}

function sortByLineContributed(files, currentAuthor) {
    files.sort(function(lhs, rhs) {
        var lhsValue = lhs.authorContributionMap[currentAuthor] ? lhs.authorContributionMap[currentAuthor] : 0;
        var rhsValue = rhs.authorContributionMap[currentAuthor] ? rhs.authorContributionMap[currentAuthor] : 0;
        return rhsValue - lhsValue;
    })
    return files;
}

function filterFilesBasedOnDocTypes(files, docTypes) {
    var filteredFiles = [];
    if (docTypes[0] == '') {
        return filteredFiles;
    }
    console.log(files["adoc"]);
    console.log('outside filterFilesBasedOnDocTypes');
    for (var key of files) {
//        if(isDocTypeMatch(fileDocType, docTypes)) {
//            filteredFiles.push(file);
//        }
        if (!files.hasOwnProperty(key)) {continue};
        var docType = files[key];
        console.log('FileDocType is '+fileDocType.toString());
        if (docTypes.indexOf(fileDocType) > -1) {
            console.log(fileDocType);
            for (var [idx, file] in Object.entries(files[file])) {
                filteredFiles.push(file);
            }
        }
    }

    return filteredFiles;
}

function clone(obj) {
      if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
        return obj;

      if (obj instanceof Date)
        var temp = new obj.constructor(); //or new Date(obj);
      else
        var temp = obj.constructor();

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          obj['isActiveClone'] = null;
          temp[key] = clone(obj[key]);
          delete obj['isActiveClone'];
        }
      }

      return temp;
}

function obtainRelevantFilesBasedOnDocTypes(resultJson, docTypes) {
    var result = [];
    for (var idx in docTypes) {
        var temp = resultJson[docTypes[idx]];
       // console.log(temp);
        for (var id in temp) {
            result.push(temp[id]);
        }
    }
    return result;
}

function isDocTypeMatch(file, docTypes) {
    for (var [key, value] of Object.entries(docTypes)) {
        var type = value.split(".");
        type = type[type.length-1];
        var exp = new RegExp("\\."+type);
        var result = exp.test(file);
        if(result) {
            return result;
        }
    }
    return false;
}

function isSearchMatch(searchTerm, authorRepo) {
    if (searchTerm == "") {
        return true;
    }
    var terms = searchTerm.split(" ");
    for (var i = 0; i < terms.length; i++) {
        //neither author name or repo name is a match for the search term
        if (isMatch(terms[i], authorRepo['author']) || isMatch(terms[i], authorRepo['displayName']) || isMatch(terms[i], authorRepo['authorDisplayName'])) {
            return true;
        }
    }
    return false;

}

function isMatch(searchTerm, currentPhrase) {
    return currentPhrase.toLowerCase().indexOf(searchTerm.toLowerCase()) != -1;
}

function getMinDate(docType) {
    var docType = docType[0];
    rawDate = summaryJson[docType][Object.keys(summaryJson[docType])[0]]["sinceDate"];
    if (rawDate) {
        //the sinceDate has been set
        return Date.parse(rawDate).toString("M/d/yy");
    } else {
        //find the min Date among all intervals
        var result;
        for (var i in summaryJson[docType]) {
            var authorContribution = summaryJson[docType][i]["authorDailyIntervalContributions"];
           // console.log(authorContribution);
            var currentRawDate = authorContribution[Object.keys(authorContribution)[0]][0]["sinceDate"];
            var currentDate = Date.parse(currentRawDate);

            if (result) {
                if (result.compareTo(currentDate) > 0) {
                    result = currentDate;
                }
            } else {
                result = currentDate;
            }
        }
        if (result==null){
            result = Date.today();
        }

        return result.toString("M/d/yy");
    }
}

function getMaxDate(docType) {
    var docType = docType[0];
    rawDate = summaryJson[docType][Object.keys(summaryJson[docType])[0]]["untilDate"];
    if (rawDate) {
        //the untilDate has been set
        return Date.parse(rawDate).toString("M/d/yy");
    } else {
        //find the max Date among all intervals
        var result;

        for (var i in summaryJson[docType]) {
            var authorContributions = summaryJson[docType][i]["authorDailyIntervalContributions"];
            if (Object.keys(authorContributions).length == 0) continue;

            var authorIntervals = authorContributions[Object.keys(authorContributions)[0]];
            if (authorIntervals.length == 0) continue;

            var currentRawDate = authorIntervals[authorIntervals.length - 1]["untilDate"];
            var currentDate = Date.parse(currentRawDate);

            if (result) {
                if (result.compareTo(currentDate) < 0) {
                    result = currentDate;
                }
            } else {
                result = currentDate;
            }
        }
        if (result==null){
            result = Date.today();
        }
        return result.toString("M/d/yy");
    }
}

function isNotAuthored(currentAuthor,line){
    return currentAuthor==null || line.author == null || line.author.gitID != currentAuthor;
}

function obtainSummariesForCombinedDocTypes(summary, docType) {
        if (docType.length == 0) {return;}
        var summariesForCombinedDocType = clone(summary[docType[0]]);
        if (docType.length == 1) {return summariesForCombinedDocType;}
        var dailyIntervalContributionSize = 0, totalDailyContribution = 0;
        for (var idx in docType) {
                var type = docType[idx];
                var summary_temp = clone(summary[type]);
                for (var organization in summary_temp) {
                    for(var item in summary_temp[organization]) {
                        if (item === "authorDailyIntervalContributions") {
                            for (var person in summary_temp[organization][item]) {
                                for (var commmit_idx = 0;
                                      commmit_idx < Math.min(summary_temp[organization][item][person].length, summariesForCombinedDocType[organization][item][person].length)
                                      ; commmit_idx++) {
                                      var dailyIntervalContributionSize = dailyIntervalContributionSize + 1;
                                      var totalDailyContribution = totalDailyContribution + parseInt(summary_temp[organization][item][person][commmit_idx]["insertions"]);
                                      if (idx != 0){
                                      var temp1 = parseInt(summariesForCombinedDocType[organization][item][person][commmit_idx]["insertions"]) +
                                                                                                parseInt(summary_temp[organization][item][person][commmit_idx]["insertions"]);
                                      var temp2 = parseInt(summariesForCombinedDocType[organization][item][person][commmit_idx]["deletions"]) +
                                                                                                parseInt(summary_temp[organization][item][person][commmit_idx]["deletions"]);
                                      summariesForCombinedDocType[organization][item][person][commmit_idx]["insertions"] = temp1;
                                      summariesForCombinedDocType[organization][item][person][commmit_idx]["deletions"] = temp2;
                                }
                                }
                            }
                        }
                        if (item === "authorWeeklyIntervalContributions") {
                           if (idx != 0) {
                           for (var person in summary_temp[organization][item]) {
                               for (var commmit_idx = 0;
                               commmit_idx < Math.min(summary_temp[organization][item][person].length, summariesForCombinedDocType[organization][item][person].length)
                               ; commmit_idx++) {
                                   var temp1 = parseInt(summariesForCombinedDocType[organization][item][person][commmit_idx]["insertions"]) +
                                                    parseInt(summary_temp[organization][item][person][commmit_idx]["insertions"]);
                                   var temp2 = parseInt(summariesForCombinedDocType[organization][item][person][commmit_idx]["deletions"]) +
                                                              parseInt(summary_temp[organization][item][person][commmit_idx]["deletions"]);
                                   summariesForCombinedDocType[organization][item][person][commmit_idx]["insertions"] = temp1;
                                   summariesForCombinedDocType[organization][item][person][commmit_idx]["deletions"] = temp2;
                               }
                           }
                           }
                        }
                        if (item === "authorFinalContributionMap") {
                            if (idx != 0) {
                            for (var person in summary_temp[organization][item]) {
                                var total = parseInt(summariesForCombinedDocType[organization][item][person]) + parseInt(summary_temp[organization][item][person]);
                                summariesForCombinedDocType[organization][item][person] = total;
                            }
                            }
                        }
                    }
                }

         }
        var mean = totalDailyContribution / dailyIntervalContributionSize;
        for (var organization in summariesForCombinedDocType) {
            for (var person in summariesForCombinedDocType[organization]["authorDailyIntervalContributions"]) {
                var variance = 0;
                for (var commit in summariesForCombinedDocType[organization]["authorDailyIntervalContributions"][person]) {
                        var insertions = parseInt(summariesForCombinedDocType[organization]["authorDailyIntervalContributions"][person][commit]["insertions"]);
                        variance = variance + Math.pow((mean - insertions), 2);
                 }
                 variance /= dailyIntervalContributionSize;
                 summariesForCombinedDocType[organization]["authorContributionVariance"][person] = variance;
                 console.log('variance for '+person+": "+variance);
            }
        }
        return summariesForCombinedDocType;
    }
