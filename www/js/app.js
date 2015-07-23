/*!
 * Roots v 2.0.0
 * Follow me @adanarchila at Codecanyon.net
 * URL: http://codecanyon.net/item/roots-phonegapcordova-multipurpose-hybrid-app/9525999
 * Don't forget to rate Roots if you like it! :)
 */
// In this file we are goint to include all the Controllers our app it's going to need
(function() {
    'use strict';

    var app = angular.module('app', ['onsen', 'angular-images-loaded', 'ngAudio',  'angular-jwplayer']);

    // Filter to convert HTML content to string by removing all HTML tags
    app.filter('htmlToPlaintext', function() {
        return function(text) {
            return String(text).replace(/<[^>]+>/gm, '');
        }
    });

    app.controller('networkController', function($scope) {

        $scope.logo = 'images/radio/logo_xx.png';


        // Check if is Offline
        document.addEventListener("offline", function() {

            offlineMessage.show();

            /*
             * With this line of code you can hide the modal in 8 seconds but the user will be able to use your app
             * If you want to block the use of the app till the user gets internet again, please delete this line.
             */

            setTimeout('offlineMessage.hide()', 8000);

        }, false);

        document.addEventListener("online", function() {
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
    app.directive('imgCache', ['$document', function($document) {
        return {
            link: function(scope, ele, attrs) {
                var target = $(ele);

                scope.$on('ImgCacheReady', function() {

                    ImgCache.isCached(attrs.src, function(path, success) {
                        if (success) {
                            ImgCache.useCachedFile(target);
                        } else {
                            ImgCache.cacheFile(attrs.src, function() {
                                ImgCache.useCachedFile(target);
                            });
                        }
                    });
                }, false);

            }
        };
    }]);
    app.directive('fadeIn', function($timeout) {
        return {
            restrict: 'A',
            link: function($scope, $element, attrs) {
                $element.addClass("ng-hide-remove");
                $element.on('load', function() {
                    $element.addClass("ng-hide-add");
                });
            }
        }
    })

    // Radio Controller

    app.controller('radioController', function($scope, $sce, $interval, $timeout) {

 $('.bgbox img').width
        $scope.isPlaying = false;
        $scope.autoplay = false;
        $scope.lastradio = window.localStorage.getItem('lastradio');

        if (!$scope.lastradio) {
            $scope.lastradio = 0;
        }
        $scope.radios_arr = [{
            id: '0',
            title: 'Cuiabá 99.9',
            icon: 'ion-ios7-calendar-outline',
            ip: 'sc6.dnip.com.br:13250'
        }, {
            id: '1',
            title: 'Alta Floresta 95.5',
            icon: 'ion-ios7-calendar-outline',
            ip: 'sc4.dnip.com.br:12575'
        }, {
            id: '2',
            title: 'Barra do Garças 96.1',
            icon: 'ion-ios7-calendar-outline',
            ip: 'sc4.dnip.com.br:15165'
        }, {
            id: '3',
            title: 'Poxoréu 90.9',
            icon: 'ion-ios7-calendar-outline',
            ip: 'sc4.dnip.com.br:11540'
        }];

        $scope.radioOptions = {
            Titulo: '',
            albumArt: 'images/radio/cover.png',
            Artista: '',
            Musica: '',
            songTitle: '',
            currentTime: '',
            ProximaArtista: '',
            ProximaMusica: ''
        }

        $scope.radioOptions.Titulo = $scope.radios_arr[$scope.lastradio].title;
        $scope.buttonIcon = '<span class="ion-ios-pause"></span>';

        $('#jquery_jplayer_1').jPlayer({
            swfPath: "http://jplayer.org/latest/dist/jplayer",
            supplied: "mp3",
            preload: "none",
            autoplay: true,
            wmode: "window",
            useStateClassSkin: true,
            autoBlur: false,
            keyEnabled: true,
            toggleDuration: true,
            ready: function() {
                $scope.isPlaying = false;
                $scope.mudaRadio($scope.lastradio);
                console.log("Player pronto");
            },
            play: function() {
                //$scope.startRadio();
            },
            pause: function() {
            },
            stop: function() {
            },
            ended: function() {
                // $control.removeClass(cls);
            }
        }).end();

        $scope.mudaRadio = function(idRadio) {
             console.log("mudaRadio");
            $scope.lastradio = idRadio;
            $scope.isPlaying = false;
            $('#jquery_jplayer_1').jPlayer('stop');

            var stream = {
                title: $scope.radios_arr[idRadio].title,
                mp3: 'http://' + $scope.radios_arr[idRadio].ip + '/;stream.mp3'
            };
            window.localStorage.setItem('lastradio', $scope.radios_arr[idRadio].id);
            window.localStorage.setItem('autoplay', true);

            $scope.radioOptions.Titulo = stream.title;

             if($scope.radioOptions.songTitle) {
                       var texto = $scope.radioOptions.songTitle;
                    } else {
                       var texto = 'Clique para abrir o aplicativo.';
                    }

            cordova.plugins.backgroundMode.configure({
                        title:  $scope.radioOptions.Titulo,
                        text: texto
             });

            $('#jquery_jplayer_1').jPlayer("setMedia", stream);
            $scope.startRadio();
            return false;
        }

        $scope.startRadio = function() {
            if ($scope.lastradio == '0') {
                $timeout($scope.RefreshFaixa, 10);
                $interval(function() {
                    if ($scope.lastradio == '0') {
                        $scope.RefreshFaixa();
                          $scope.NextFaixa();
                    }
                }, 50000);
            } else {
                $scope.radioOptions.ProximaMusica = false;
                $scope.radioOptions.Artista = "";
                $scope.radioOptions.Musica = $scope.radioOptions.Titulo;
               // $scope.radioOptions.albumArt = 'images/radio/logo_grande.png';
                $scope.ExibeBanner();
            }
            if ($scope.isPlaying) {
                $scope.isPlaying = false;
                $scope.buttonIcon = '<span class="ion-ios-play"></span>';

                $('#jquery_jplayer_1').jPlayer('stop');
            } else {
                $('#jquery_jplayer_1').jPlayer('play');
                $scope.buttonIcon = '<img src="images/load.gif">';

                $timeout(function() {
                    $scope.buttonIcon = '<span class="ion-ios-pause"></span>';

                    $scope.isPlaying = true;
                }, 7000);
            }
            return false;
        }

        $scope.ExisteTexto = function(str, substrings) {
            for (var i = 0; i != substrings.length; i++) {
                var substring = substrings[i];
                if (str.indexOf(substring) != -1) {
                    return substring;
                }
            }
            return null;
        }

        $scope.limpa_str = function(str) {
            str = str.replace(/^\s+|\s+$/g, '');
            str = str.toLowerCase();
            var from = "ãàáäâèéëêìíïîòóöôùúüûñç·/_,:;";
            var to = "aaaaaeeeeiiiioooouuuunc------";
            for (var i = 0, l = from.length; i < l; i++) {
                str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
            }
            str = str.replace(/[^a-z0-9 -]/g, '').replace('  ', '+').replace('-', '').replace(' ', '+'); // remove invalid chars
            return str;
        }



        $scope.curtir = function() {
            $('.descurtir').removeClass('active');
            $('.curtir').addClass('active');
            window.plugins.toast.show('Obrigado por curtir essa música!', 'long', 'center', null, null);
        }
        $scope.descurtir = function() {
            $('.curtir').removeClass('active');
            $('.descurtir').addClass('active');
            window.plugins.toast.show('Descurtido. Obrigado pelo seu voto!', 'long', 'center', null, null);
        }

        $scope.renderHtml = function(htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };
    
        $scope.RefreshFaixa = function() {
            $scope.capa_antiga =  window.localStorage.getItem('capa_antiga');

            var track_atual = window.localStorage.getItem('track_atual');
            var songTitle = '';
            var Artista = '';
            var Musica = '';
            var n = Math.floor(Math.random() * 9999) + 1;
            console.log(n);
            var largura_capa = $('.capa').width();

            if (document.location.hostname == "localhost") {
                var URLCover = 'http://localhost/gazeta/novo/player/cover.php?w=' + largura_capa + '&h=' + largura_capa + '&filename=';
                var URLCurrentSong = 'http://localhost/aplicativos/current_song.php?v=' + n;
                $scope.URLNextSong = 'http://localhost/aplicativos/next_song.php?v=' + n;
            } else {
                var URLCover = 'http://184.172.104.3/~fmgazeta/player/cover.php?w=' + largura_capa + '&h=' + largura_capa + '&filename=';
                var URLCurrentSong = 'http://184.172.104.3/~fmgazeta/player/current_song.php?v=' + n;
                $scope.URLNextSong = 'http://184.172.104.3/~fmgazeta/player/next_song.php?v=' + n;
            }

            $.get(URLCurrentSong, function(data) {
                var faixa = data.split(" - ");
                if (faixa[1] != undefined) {
                    Artista = faixa[1];
                }
                if (faixa[0] != undefined) {
                    Musica = faixa[0];
                }
                songTitle = Artista + ' - ' + Musica;
               
                $scope.track_check = $scope.limpa_str(songTitle.replace(/\s/g, ''));
            }).done(function(data) {
                $scope.$apply(function() {
                    $scope.radioOptions.songTitle = songTitle;
                    $scope.radioOptions.Artista = Artista;
                    $scope.radioOptions.Musica = Musica;
                });
                var result = $scope.ExisteTexto(songTitle.toLowerCase(), ["gazeta", "teaser", "thomas", "andorinha", "gazeta fm", "diversos", "trilha", "vh", "fm", "ferreto", "2015"]);
                if (result != null) {
                    $scope.ExibeBanner();
                } else {
                  if(track_atual!=$scope.track_check) {
                    $('.descurtir,.curtir').removeClass('active');
                    $scope.ExibeFavoritar = true;
                    cordova.plugins.backgroundMode.configure({
                        title: $scope.radioOptions.songTitle
                    });
                     window.localStorage.setItem('track_atual', $scope.limpa_str(songTitle.replace(/\s/g, '')));

                    //var URLText = $scope.limpa_str($scope.radioOptions.Artista)+'+'+$scope.radioOptions.Musica.split(' ')[0];
                    var URLText = $scope.limpa_str($scope.radioOptions.Artista);
                    $scope.$apply(function() {
                     $scope.radioOptions.albumArt = URLCover + URLText;
                        /* FADE CAPA */
                        //  $timeout(function(){

                        //   $('.mask').fadeOut('slow', function(){
                        //       window.localStorage.setItem('capa_antiga', $scope.radioOptions.albumArt);

                        //   }).fadeIn('normal');
                        // }, 5000);

                        //  $timeout(function(){
                        //   $('#controls').fadeOut('slow');
                        // }, 20000);

                        $("span.capa img").error(function() {
                            $scope.radioOptions.albumArt = 'images/radio/cover.png';
                        });
                    });
                    
                  } 
                }
              
            })
        }
        $scope.ExibeBanner = function (){
            $scope.ExibeFavoritar = false;
            var b = Math.floor(Math.random() * 2) + 1; 
            $scope.radioOptions.albumArt = 'images/banners/'+b+'.jpg';
              
        }
        $scope.NextFaixa = function() {
           var songTitle = '';
            var Artista = '';
            var Musica = '';
           var n = Math.floor(Math.random() * 999) + 1;
          

          $.get($scope.URLNextSong, function(data) {
                var faixa = data.split(" - ");
                if (faixa[1] != undefined) {
                    Artista = faixa[1];
                }
                if (faixa[0] != undefined) {
                    Musica = faixa[0];
                }
                songTitle = Artista + ' - ' + Musica;
                window.localStorage.setItem('proximaFaixa', $scope.limpa_str(songTitle.replace(/\s/g, '')));
            }).done(function(data) {
                $scope.$apply(function() {
                    $scope.radioOptions.ProximaArtista = Artista;
                    $scope.radioOptions.ProximaMusica = Musica;
                });
            })
        }
  
        $scope.shareMusica = function() {
            var subject = 'Radio ' + $scope.radioOptions.Titulo;
            if($scope.radioOptions.songTitle) {
               var message = 'Estou ouvindo ' + $scope.radioOptions.songTitle + " Via App ofical Rede Gazeta MT #redegazeta";
            } else {
               var message = 'Estou ouvindo ' + $scope.radioOptions.Titulo + " Via App ofical da Rede Gazeta MT #redegazeta";
            }
            var imagem = 'http://i.imgur.com/jsHElO0.jpg';
            //var imagem = '';
            var link = 'http://bit.ly/1LThHb0';
            window.plugins.socialsharing.share(message, subject, imagem, link);
        }

        $scope.AbrePedidos = function(){
          pedidos.show();
        }
         $scope.FechaPedidos = function(){
          pedidos.hide();
        }
         $scope.enviaPedido = function(){
          var dados = {};
          $('#pedidos .text-input').each(function() {
            dados[$(this).attr('name')] = $(this).val();
        });         
          $.post("http://fm.gazetadigital.com.br/site/musica.php?acao=enviar", dados , function(response) {
              $('#pedidos .form').hide();
              $('#pedidos .enviado').html('<h4>'+dados.nome.split(' ')[0] +', <br/>seu pedido foi enviado com sucesso! Obrigado</h4><ons-button modifier="small">Aguarde...</ons-button>').show();
               $timeout(function(){
                $scope.FechaPedidos();
                $('#pedidos .form').show();
                $('#pedidos .enviado').hide();
              }, 4000);
          })
            .done(function() {
               
            })
            .fail(function() {
              alert( "Ocorreu um erro, tente novamente." );
            });
        }
        $scope.CloseApp = function(){
            $('#jquery_jplayer_1').jPlayer('stop');
             if (navigator.app) {
                        navigator.app.exitApp();
                    } else if (navigator.device) {
                        navigator.device.exitApp();
                    }
        }
        $scope.BackgroundMode = function(){
    
            e.preventDefault();

        }


        ons.ready(function() {
            if(ons.platform.isIOS()){
                $('.navigation-bar').css({'padding-top':"20px"});
            }
            cordova.plugins.backgroundMode.setDefaults({  title:  $scope.radioOptions.Titulo, ticker: 'Entrando em segundo plano',  text:'Clique para abrir o aplicativo.'});
            cordova.plugins.backgroundMode.enable();
            Called when background mode has been activated
            cordova.plugins.backgroundMode.onactivate = function () {
                setTimeout(function () {
                    // Modify the currently displayed notification
                    if($scope.radioOptions.songTitle) {
                       var texto = $scope.radioOptions.songTitle;
                    } else {
                       var texto = 'Clique para abrir o aplicativo.';
                    }
                    cordova.plugins.backgroundMode.configure({
                        title:  $scope.radioOptions.Titulo,
                        text: texto

                    });
                }, 5000);
            }
                    StatusBar.styleBlackOpaque();
        });
        
        document.addEventListener("backbutton", $scope.BackgroundMode, true); 

        document.addEventListener("offline", function() {

            $scope.isPlaying = false;
            $('#jquery_jplayer_1').jPlayer('stop');
            $scope.buttonIcon = '<span class="ion-ios-play"></span>';
            $scope.radio = null;
            modal.show();
            setTimeout('modal.hide()', 8000);

        }, false);

    });

    var pad2 = function(number) {
        return (number < 10 ? '0' : '') + number;
    }

    app.filter('SecondsToTimeString', function() {
        return function(seconds) {
            var s = parseInt(seconds % 60);
            var m = parseInt((seconds / 60) % 60);
            var h = parseInt(((seconds / 60) / 60) % 60);
            if (seconds > 0) {
                return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
            } else {
                return '';
            }
        }
    });


})();