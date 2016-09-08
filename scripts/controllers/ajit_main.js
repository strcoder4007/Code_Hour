'use strict';
/**
 * @ngdoc function
 * @name codeHourApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the codeHourApp
 */
angular.module('codeHourApp')
  .factory('FeedLoader', function($resource) {
    return $resource('http://ajax.googleapis.com/ajax/services/feed/load', {}, {
      fetch: {
        method: 'JSONP',
        params: {
          v: '1.0',
          callback: 'JSON_CALLBACK',
          output: 'xml'
        }
      }
    });
  })

  .controller('MainCtrl', ['$http', '$scope', 'FeedLoader', function($http, $scope, FeedLoader) {
    $http.get('http://codeforces.com/api/contest.list')
      .success(function(data) {
        var res = data.result;
        var result = [];
        for (var i = 0; i < res.length; i++) {
          if (res[i].relativeTimeSeconds > 0)
            break;
          result.push({
            'name': res[i].name,
            'url': 'http://codeforces.com/contests',
            'startTime': res[i].startTimeSeconds * 1000,
            'endTime': (res[i].startTimeSeconds + res[i].durationSeconds) * 1000
          });
        }
        $scope.cfcontests = result;
      })
      .error(function(err) {confirm("yay");});


    var date = new Date();
    var isoDate = date.toISOString();
    isoDate = isoDate.substring(0, isoDate.length - 1);
    var url = 'http://api.topcoder.com/v2/data/srm/schedule?registrationStartTimeAfter=' + isoDate + '-0400';
    //note: bug fixed here dated 5th sept 2016: dateCon bug
    $http.get(url)
      .success(function(data) {
        var tcdata = data.data;
        var dif = 4 * 60 * 60 * 1000;
        var result = [];
        tcdata.forEach(function(element, index, array) 
        {
          var dateCon = element.codingStartTime;
          dateCon = dateCon.substring(0, dateCon.length - 6);
          var dates = new Date(dateCon) / 1000;
          dates = Math.round(dates * 1000);
          dateCon = element.codingEndTime;
          dateCon = dateCon.substring(0, dateCon.length - 6);
          var daten = new Date(dateCon) / 1000;
          daten = Math.round(daten * 1000);
          result.push({
            'name': element.contestName +" " + element.name,
            'url': 'http://community.topcoder.com/tc?module=MatchDetails&rd='+element.roundId,
            'startTime': dates + dif,
            'endTime': daten + dif
          });
        });
        $scope.tccontests = result;
      })
      .error(function(err) {});

    var ar = [];
    var ar1 = [];
    var feed = FeedLoader.fetch({
      q: 'https://www.hackerrank.com/calendar/feed.rss',
      num: 30
    }, {}, function(data) {
      var xmlDoc = $.parseXML(data.responseData.xmlString);
      var $xml = $(xmlDoc);
      $xml.find('item').each(function(data) {
        var dates = new Date($(this).find('startTime')[0].innerHTML) / 1000;
        var daten = new Date($(this).find('endTime')[0].innerHTML) / 1000;
        var url = $(this).find('url')[0].innerHTML;
        if (url.length != 7) {
          var resolve = new URL(url);
          if (resolve.hostname == 'www.codechef.com') {
            var obj = {
              'name': $(this).find('title')[0].innerHTML,
              'startTime': Math.round(dates * 1000),
              'url': url,
              'endTime': Math.round(daten * 1000)
            };
            ar.push(obj);
          }
            else if(resolve.hostname == 'www.hackerrank.com'){
                var obj = {
              'name': $(this).find('title')[0].innerHTML,
              'startTime': Math.round(dates * 1000),
              'url': url,
              'endTime': Math.round(daten * 1000)
            };
            ar1.push(obj);
            }
        }
      });
    });
    $scope.cccontests = ar;
      
      $http.get('https://jsonp.afeld.me/?url=https://www.hackerrank.com/rest/contests/college')
        .success(function(data){
          var conlist = data.models;
          for(var i = 0; i < conlist.length; i++){
           if(conlist[i].ended===true)
               break;
              ar1.push({
                 'name':conlist[i].name,
                  'url':'https://www.hackerrank.com/contests/college',
                  'startTime':conlist[i].epoch_starttime*1000,
                  'endTime':conlist[i].epoch_endtime*1000
              });
          }
      }).error(function(data){
      });
      
      $scope.Hrcontests = ar1;
      

      var hccons = [];
      $http.get('https://jsonp.afeld.me/?url=https://www.hackerearth.com/chrome-extension/events')
            .success(function(data){
       var contests = data.response;
          for(var i=0;i<contests.length;i++){
              var dates = new Date(contests[i].start_utc_tz)/1000;
              var daten = new Date(contests[i].end_utc_tz)/1000;
              dates=Math.round(dates*1000);
              daten=Math.round(daten*1000);
              hccons.push({
               'name':contests[i].title,
                'url':contests[i].url,
                'startTime':dates,
                'endTime':daten
              });
          }
      }).error(function(err){});
      
      $scope.Hecontests = hccons;
  }]);
