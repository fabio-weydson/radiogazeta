/*!
 * Roots v 2.0.0
 * Follow me @adanarchila at Codecanyon.net
 * URL: http://codecanyon.net/item/roots-phonegapcordova-multipurpose-hybrid-app/9525999
 * Don't forget to rate Roots if you like it! :)
 */

// In this file we are goint to include all the Controllers our app it's going to need

(function(){
  'use strict';

  var app = angular.module('app', ['onsen', 'angular-images-loaded', 'ngAudio', 'angular-jwplayer']);

  // Filter to convert HTML content to string by removing all HTML tags
  app.filter('htmlToPlaintext', function() {
      return function(text) {
        return String(text).replace(/<[^>]+>/gm, '');
      }
    }
  );

  app.controller('networkController', function($scope){

    ons.ready(function(){
      StatusBar.styleBlackOpaque();
    });

    // Check if is Offline
    document.addEventListener("offline", function(){

      offlineMessage.show();

      /*
       * With this line of code you can hide the modal in 8 seconds but the user will be able to use your app
       * If you want to block the use of the app till the user gets internet again, please delete this line.
       */

      setTimeout('offlineMessage.hide()', 8000);

    }, false);

    document.addEventListener("online", function(){
      // If you remove the "setTimeout('offlineMessage.hide()', 8000);" you must remove the comment for the line above
      // offlineMessage.hide();
    });

  });

  // This functions will help us save the JSON in the localStorage to read the website content offline

  Storage.prototype.setObject = function(key, value) {
      this.setItem(key, JSON.stringify(value));
  }

  Storage.prototype.getObject = function(key) {
      var value = this.getItem(key);
      return value && JSON.parse(value);
  }

  // This directive will allow us to cache all the images that have the img-cache attribute in the <img> tag
  app.directive('imgCache', ['$document', function ($document) {
    return {
      link: function (scope, ele, attrs) {
        var target = $(ele);

        scope.$on('ImgCacheReady', function () {

          ImgCache.isCached(attrs.src, function(path, success){
            if(success){
              ImgCache.useCachedFile(target);
            } else {
              ImgCache.cacheFile(attrs.src, function(){
                ImgCache.useCachedFile(target);
              });
            }
          });
        }, false);

      }
    };
  }]);



  // News Controller
  // This controller gets all the posts from our WordPress site and inserts them into a variable called $scope.items
  app.controller('newsController', [ '$http', '$scope', '$rootScope', function($http, $scope, $rootScope){

    // I'm using the same post type video, but you will need another custom post type for this one
    $scope.yourAPI = 'http://dev.studio31.co/api/get_posts/?post_type=video';
    $scope.items = [];
    $scope.totalPages = 0;
    $scope.currentPage = 1;
    $scope.pageNumber = 1;
    $scope.isFetching = true;
    $scope.lastSavedPage = 0;
    $scope.localSavePrefix = 'news_';

    // Let's initiate this on the first Controller that will be executed.
    ons.ready(function() {

      // Cache Images Setup
      // Set the debug to false before deploying your app
      ImgCache.options.debug = true;

      ImgCache.init(function(){

        //console.log('ImgCache init: success!');
        $rootScope.$broadcast('ImgCacheReady');
        // from within this function you're now able to call other ImgCache methods
        // or you can wait for the ImgCacheReady event

      }, function(){
        //console.log('ImgCache init: error! Check the log for errors');
      });

    });


    $scope.pullContent = function(){

      $http.jsonp($scope.yourAPI+'&page='+$scope.pageNumber+'&callback=JSON_CALLBACK').success(function(response) {

        if($scope.pageNumber > response.pages){

          // hide the more news button
          $('#moreButton').fadeOut('fast');

        } else {

          $scope.items = $scope.items.concat(response.posts);
          window.localStorage.setObject($scope.localSavePrefix+'rootsPosts', $scope.items); // we save the posts in localStorage
          window.localStorage.setItem($scope.localSavePrefix+'rootsDate', new Date());
          window.localStorage.setItem($scope.localSavePrefix+"rootsLastPage", $scope.currentPage);
          window.localStorage.setItem($scope.localSavePrefix+"rootsTotalPages", response.pages);

          // For dev purposes you can remove the comment for the line below to check on the console the size of your JSON in local Storage
          // for(var x in localStorage)console.log(x+"="+((localStorage[x].length * 2)/1024/1024).toFixed(2)+" MB");

          $scope.totalPages = response.pages;
          $scope.isFetching = false;

          if($scope.pageNumber == response.pages){

            // hide the more news button
            $('#moreButton').fadeOut('fast');

          }

        }

      });

    }

    $scope.getAllRecords = function(pageNumber){

      $scope.isFetching = true;

      if (window.localStorage.getItem($scope.localSavePrefix+"rootsLastPage") == null ) {

        $scope.pullContent();

      } else {

        var now = new Date();
        var saved = new Date(window.localStorage.getItem($scope.localSavePrefix+"rootsDate"));

        var difference = Math.abs( now.getTime() - saved.getTime() ) / 3600000;

        // Lets compare the current dateTime with the one we saved when we got the posts.
        // If the difference between the dates is more than 24 hours I think is time to get fresh content
        // You can change the 24 to something shorter or longer

        if(difference > 24){
          // Let's reset everything and get new content from the site.
          $scope.currentPage = 1;
          $scope.pageNumber = 1;
          $scope.lastSavedPage = 0;
          window.localStorage.removeItem($scope.localSavePrefix+"rootsLastPage");
          window.localStorage.removeItem($scope.localSavePrefix+"rootsPosts");
          window.localStorage.removeItem($scope.localSavePrefix+"rootsTotalPages");
          window.localStorage.removeItem($scope.localSavePrefix+"rootsDate");

          $scope.pullContent();

        } else {

          $scope.lastSavedPage = window.localStorage.getItem($scope.localSavePrefix+"rootsLastPage");

          // If the page we want is greater than the last saved page, we need to pull content from the web
          if($scope.currentPage > $scope.lastSavedPage){

            $scope.pullContent();

          // else if the page we want is lower than the last saved page, we have it on local Storage, so just show it.
          } else {

            $scope.items = window.localStorage.getObject($scope.localSavePrefix+'rootsPosts');
            $scope.currentPage = $scope.lastSavedPage;
            $scope.totalPages = window.localStorage.getItem($scope.localSavePrefix+"rootsTotalPages");
            $scope.isFetching = false;

          }

        }

      }

    };

    $scope.imgLoadedEvents = {
        done: function(instance) {
            angular.element(instance.elements[0]).removeClass('is-loading').addClass('is-loaded');
        }
    };

    $scope.showPost = function(index){

      $rootScope.postContent = $scope.items[index];
      $scope.ons.navigator.pushPage('post.html');

    };

    $scope.nextPage = function(){

      $scope.currentPage++;
      $scope.pageNumber = $scope.currentPage;
      $scope.getAllRecords($scope.pageNumber);

    }

  }]);

  // This controller let us print the Post Content in the post.html template
  app.controller('postController', [ '$scope', '$rootScope', '$sce', function($scope, $rootScope, $sce){

    $scope.item = $rootScope.postContent;

    $scope.renderHtml = function (htmlCode) {
      return $sce.trustAsHtml(htmlCode);

    };

    $scope.imgLoadedEvents = {
        done: function(instance) {
            angular.element(instance.elements[0]).removeClass('is-loading').addClass('is-loaded');
        }
    };

  }]);


  // Radio Controller
  var radio = null;
  var isPlaying = false;

  app.controller('radioController', function($scope, $sce, ngAudio, $interval){


    $scope.radioHost = 'http://sc6.dnip.com.br'; // Replace this with your own radio stream URL
    $scope.radioPort = '13250'; // Replace this with the port of your Radio Stream
    $scope.lastFMKey = 'ab68e9a71c1bb15efaa9c706b646dee4';
    $scope.lastFM = 'http://ws.audioscrobbler.com/2.0/?method=track.search&format=json&limit=1&api_key='+$scope.lastFMKey+'&track=';

    $scope.radioURL = $scope.radioHost+':'+$scope.radioPort+'/;';
    $scope.buttonIcon = '<span class="ion-ios-play"></span>';

    $scope.radioOptions = {
      albumArt: 'images/radio/cover.png',
      songName: '',
       Artista: '',
        Musica: ''
    }

    $scope.ExisteTexto = function (str, substrings) {
        for (var i = 0; i != substrings.length; i++) {
           var substring = substrings[i];
           if (str.indexOf(substring) != - 1) {
             return substring;
           }
        }
        return null; 
    }
    $scope.limpa_str = function(str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();
        
        // remove accents, swap ñ for n, etc
        var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
        var to   = "aaaaeeeeiiiioooouuuunc------";
        for (var i=0, l=from.length ; i<l ; i++) {
          str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace('  ', '+') // remove invalid chars
         .replace('-', '') // remove invalid chars
         .replace(' ', '+'); // remove invalid chars
        return str;
    }




    $scope.RefreshFaixa = function(){
      var songTitle = '';
      var Artista = '';
      var Musica = '';
      //var d = new Date();
      var n = Math.floor(Math.random() * 999) + 1;
      //var URLCurrentSong = 'http://localhost/aplicativos/current_song.php';
      var URLCurrentSong = 'http://184.172.104.3/~fmgazeta/player/current_song.php?v='+n;
      $.get(URLCurrentSong, function( data ) {
           // data = "Like a virgin - Madonna";
            var faixa = data.split(" - ");

            if(faixa[1]!=undefined) {
               Artista = faixa[1];
            }
            if(faixa[0]!=undefined) {
               Musica = faixa[0];
            }

            //songTitle = Artista+Musica;
            //console.log(Musica+Artista)

          }).done(function(data){

                $scope.$apply(function(){
                  $scope.radioOptions.Artista = Artista;
                  $scope.radioOptions.Musica = Musica;
                 });

              var result =  $scope.ExisteTexto(songTitle.toLowerCase(), ["gazeta", "VH", "FM"]);
               if(result!=null) {
                    $scope.$apply(function(){
                    $scope.radioOptions.albumArt = 'images/radio/cover.png';
                    });
               } else {
              var URLText = $scope.limpa_str(Artista);
              var URLCover = 'http://184.172.104.3/~fmgazeta/player/cover.php?h=250&filename='+URLText;
              //var URLCover = 'http://localhost/gazeta/novo/player/cover.php?h=250&filename='+URLText;
                  $scope.$apply(function(){
                  $scope.radioOptions.albumArt = URLCover;
                  $("span.capa img").error(function () { 
                     $scope.radioOptions.albumArt = 'images/radio/cover.png';
                  });
                    });

               }
              
                

          })
    }
    setTimeout($scope.RefreshFaixa, 1000);
        $interval( function(){ $scope.RefreshFaixa(); }, 40000);

    // // Let's start the Shoutcast plugin to get the Song Name
    // $.SHOUTcast({
    //    host : '192.99.8.192', // Replace this with your own radio stream URL but remove the http
    //    port : '3536',
    //    interval : 40000, // Refresh interval in miliseconds is equal to 40 seconds.
    //    stream: 1, // Replace with your stream, default is 1.
       
    //    stats : function(){
    //     var songTitle = '';
    //       var albumArt = '';
    //       var URL = '';
    //        $.get('http://localhost/aplicativos/radiogazeta/www/current_song.php', function( data ) {
    //         var faixa = data.split(" - ");
    //         songTitle = faixa[1]+"-"+faixa[0];
    //            $scope.$apply(function(){
    //         $scope.radioOptions.songName = songTitle;
    //       });
    //         URL = $scope.lastFM+encodeURIComponent(songTitle);
    //         console.log(URL);
         
    //       $.getJSON( URL, function( data ) {
    //         if(data.error){
    //           albumArt = 'images/radio/cover.png';
    //         } else {
    //          console.log(data); // delete this for production
    //           if( data.results!== undefined ){
    //             if(data.results.trackmatches !="\n" ){
    //               if(data.results.trackmatches.track.image !== undefined){
    //                 albumArt = data.results.trackmatches.track.image[3]['#text'];
    //               } else {
    //                 albumArt = 'images/radio/cover.png';
    //               }
    //             } else {
    //               albumArt = 'images/radio/cover.png';
    //             }
    //           }
    //         }

    //         $scope.$apply(function(){
    //           $scope.radioOptions.albumArt = albumArt;
    //         });

    //       });
    //       });

       
    //    }

    // }).startStats();
  
    $scope.curtir = function() {
      $('.descurtir').removeClass('active');
        $('.curtir').addClass('active');
    }
     $scope.descurtir = function() {
       $('.curtir').removeClass('active');
        $('.descurtir').addClass('active');
    }
    if (radio!==null) {
        $scope.radio = radio;

        if(isPlaying){
          $scope.buttonIcon = '<span class="ion-ios-pause"></span>';
        } else {
          $scope.buttonIcon = '<span class="ion-ios-play"></span>';
        }
    } else {

      isPlaying = false;
        $scope.radio = ngAudio.load($scope.radioURL);
        radio = $scope.radio;
    }

    $scope.renderHtml = function (htmlCode) {
          return $sce.trustAsHtml(htmlCode);
      };

      $scope.startRadio = function(){

        if(!isPlaying){
          
          // Let's play it
          isPlaying = true;
        $scope.radio.play();

        $scope.buttonIcon = '<span class="ion-ios-pause"></span>';
        $scope.isFetching = true;
        $scope.RefreshFaixa();

        } else {
          // Let's pause it
          isPlaying = false;
        $scope.radio.pause();
        $scope.buttonIcon = '<span class="ion-ios-play"></span>';

        }

      }


    $scope.shareMusica = function () {

        var subject = 'Estou ouvindo';
        var message = $scope.radioOptions.songName+" Via App ofical...";
        //var imagem = $scope.radioOptions.albumArt;
        var imagem = '';
        var link = 'http://fm.gazetadigital.com.br';
        alert(message);
        window.plugins.socialsharing.share(message, subject, imagem, link);
  
    }

      // Check if is Offline
    document.addEventListener("offline", function(){

      isPlaying = false;
      $scope.radio.stop();
      $scope.buttonIcon = '<span class="ion-ios-play"></span>';
      $scope.radio = null;
      modal.show();
      setTimeout('modal.hide()', 8000);

    }, false);

    document.addEventListener("online", function(){
      $scope.radio = ngAudio.load($scope.radioURL);
      radio = $scope.radio;
    });

  });

  var pad2 = function(number){
    return (number<10 ? '0' : '') + number;
  }

  app.filter('SecondsToTimeString', function() {
    return function(seconds) {
      var s = parseInt(seconds % 60);
      var m = parseInt((seconds / 60) % 60);
      var h = parseInt(((seconds / 60) / 60) % 60);
      if (seconds > 0) {
        return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
      } else {
        return '00:00:00';
      }
    }
  });


})();
