(function(){
    var script = {
 "scripts": {
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "playGlobalAudio": function(audio, endCallback){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = audio; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "existsKey": function(key){  return key in window; },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; } if(audio.get('state') == 'playing') audio.pause(); },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "unregisterKey": function(key){  delete window[key]; },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "setOverlayBehaviour": function(overlay, media, action){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 2000); }; if(window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "getPlayListWithMedia": function(media, onlySelected){  var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) return playList; } return undefined; },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')]; } return audio; },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "getKey": function(key){  return window[key]; },
  "shareFacebook": function(url){  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank'); },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios)); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "shareWhatsapp": function(url){  window.open('https://api.whatsapp.com/send/?text=' + encodeURIComponent(url), '_blank'); },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "registerKey": function(key, value){  window[key] = value; },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; if(audio){ delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "shareTwitter": function(url){  window.open('https://twitter.com/intent/tweet?source=webclient&url=' + url, '_blank'); },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')]; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } return this.playGlobalAudio(audio, endCallback); },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext); }; playNext(); },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; var mediaDispatcherByParam = mediaDispatcher != undefined; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = mediaDispatcher ? this.getPlayListWithMedia(mediaDispatcher, true) : undefined; if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } if(player != itemDispatcher.get('player') || !mediaDispatcherByParam){ item.bind('begin', onBeginFunction, self); } this.executeFunctionWhenChange(playList, index, disposeCallback); },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } },
  "keepComponentVisibility": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } }
 },
 "downloadEnabled": false,
 "children": [
  "this.MainViewer",
  "this.Container_EF8F8BD8_E386_8E03_41E3_4CF7CC1F4D8E",
  "this.Container_0DD1BF09_1744_0507_41B3_29434E440055",
  "this.Container_1B9AAD00_16C4_0505_41B5_6F4AE0747E48",
  "this.Container_062AB830_1140_E215_41AF_6C9D65345420",
  "this.Container_23F0F7B8_0C0A_629D_418A_F171085EFBF8",
  "this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15",
  "this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7",
  "this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41",
  "this.Container_2820BA13_0D5D_5B97_4192_AABC38F6F169",
  "this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E",
  "this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC"
 ],
 "id": "rootPlayer",
 "data": {
  "name": "Player468"
 },
 "start": "this.playAudioList([this.audio_57104A95_474E_7911_41C2_054CC9520D93]); this.init(); this.visibleComponentsIfPlayerFlagEnabled([this.IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A], 'gyroscopeAvailable'); this.syncPlaylists([this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist,this.mainPlayList]); if(!this.get('fullscreenAvailable')) { [this.IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0].forEach(function(component) { component.set('visible', false); }) }",
 "scrollBarWidth": 10,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "buttonToggleMute": "this.IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D",
 "minHeight": 20,
 "paddingBottom": 0,
 "overflow": "visible",
 "propagateClick": true,
 "verticalAlign": "top",
 "desktopMipmappingEnabled": false,
 "definitions": [{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9F01D45_F410_C077_41DF_34543CA448D4",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 36.69,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 68.07,
  "class": "PanoramaCameraPosition",
  "pitch": -16.38
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -92.01,
  "class": "PanoramaCameraPosition",
  "pitch": 0.77
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "44-Recorrido38",
 "hfov": 360,
 "id": "panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3",
 "thumbnailUrl": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF",
   "yaw": -144.75,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 140.49
  },
  {
   "panorama": "this.panorama_269F2632_2897_7539_41C0_B5C658969E9C",
   "yaw": 45.46,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -54.91
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_2D679940_3816_2C7A_41C8_F2C723598B0D",
  "this.overlay_2E14B1AA_381A_3C0E_419E_411FDA3701AB"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FAF05CA4_F410_C035_41DC_BAABE0D83B3D",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 60.2,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9FE1D53_F410_C013_41C3_8C9C7D563507",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 160.86,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "14-Recorrido7",
 "hfov": 360,
 "id": "panorama_25476501_2891_74DB_4192_1CFE322BD079",
 "thumbnailUrl": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_t.jpg",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98"
  },
  {
   "panorama": "this.panorama_2554576B_2896_B328_41BF_FD80CFF00F46",
   "yaw": 153.26,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 66.19
  },
  {
   "panorama": "this.panorama_26F24DAA_2896_D728_41BD_23AF15C91790",
   "yaw": -59.77,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 118.58
  },
  {
   "panorama": "this.panorama_269201DB_2896_CF6F_41A7_14503FADDAA8",
   "yaw": 59.18,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 152.74
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_27A0A609_3836_240A_41AB_EF8D3EED9FEE",
  "this.overlay_18FFF57C_3836_640A_41C8_DDB2D98FD0C8",
  "this.overlay_278976C0_3836_247A_41C2_3B0C4A67A8C9",
  "this.overlay_189FCAFF_3836_EC06_4192_17CBE85DF2E2"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 50.94,
  "class": "PanoramaCameraPosition",
  "pitch": -19.08
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "28-Recorrido22",
 "hfov": 360,
 "id": "panorama_26F527D7_2896_F367_41BC_804C6E646518",
 "thumbnailUrl": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1",
   "yaw": 28.51,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -119.8
  },
  {
   "panorama": "this.panorama_269201DB_2896_CF6F_41A7_14503FADDAA8",
   "yaw": -101.62,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -30.82
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_1E061CFE_383E_6406_41BF_F45F7BAF37AF",
  "this.overlay_1C9EF2D3_383E_5C1E_41B4_844FDDA7A1CC"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FA22AD96_F410_C015_418B_13BD0EAA13CD",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -149.18,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9AA0D1B_F410_C013_41C4_DF1C8D55B4A1",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 170.47,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FA733DC0_F410_C06D_41CE_5029002C4EB0",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 67.09,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FAED9E37_F410_C014_41E8_B942E999C537",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 159.99,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "movements": [
   {
    "targetYaw": -23.94,
    "easing": "cubic_in_out",
    "pitchSpeed": 17.05,
    "class": "TargetPanoramaCameraMovement",
    "path": "shortest",
    "yawSpeed": 33.25,
    "targetPitch": -2.04
   }
  ],
  "restartMovementOnUserInteraction": false,
  "class": "PanoramaCameraSequence"
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -173.98,
  "class": "PanoramaCameraPosition",
  "pitch": -3.14
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 17.73,
  "class": "PanoramaCameraPosition",
  "pitch": -11.16
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -84.72,
  "class": "PanoramaCameraPosition",
  "pitch": -1.82
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9D13D25_F410_C037_41D6_711E7DF1AE7B",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 100.55,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FA9E0DE0_F410_C02D_41D5_384DE36681F6",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -125.44,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "vfov": 180,
 "hfovMin": "135%",
 "hfovMax": 130,
 "label": "Conversaciones Afuera_Dia2v2",
 "id": "panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580",
 "thumbnailUrl": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_t.jpg",
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "partial": false,
 "class": "Panorama",
 "pitch": 0,
 "hfov": 360
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -122.5,
  "class": "PanoramaCameraPosition",
  "pitch": -30.29
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 148.25,
  "class": "PanoramaCameraPosition",
  "pitch": -11.61
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "10-Recorrido3Altar",
 "hfov": 360,
 "id": "panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD",
 "thumbnailUrl": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_t.jpg",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC"
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_2C851F93_3816_241E_41BD_20093D5678DF",
  "this.overlay_2DF29F28_3816_240A_41C1_CCAD0097EEA1"
 ],
 "hfovMin": "135%"
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "Ritual-Inicio-Hombre",
 "hfov": 360,
 "id": "panorama_26F24DAA_2896_D728_41BD_23AF15C91790",
 "thumbnailUrl": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_25476501_2891_74DB_4192_1CFE322BD079",
   "yaw": 118.58,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -59.77
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_1A60C95B_383B_EC0E_41BF_C2321CFD8BFB"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FAFCACAF_F410_C032_41EB_4F3AE2D8173B",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 149.18,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FA7DDDCA_F410_C07D_41E0_953B60BE3211",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 64.43,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "42-Recorrido36",
 "hfov": 360,
 "id": "panorama_269F2632_2897_7539_41C0_B5C658969E9C",
 "thumbnailUrl": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3",
   "yaw": -54.91,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 45.46
  },
  {
   "panorama": "this.panorama_26FDD753_2897_5378_41B7_9619EA432C06",
   "yaw": 56.23,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -71.7
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_2EEFA38B_381A_5C0E_41A2_F5DD5506E8E7",
  "this.overlay_2F228949_381E_2C0A_41C8_9E55C770ABFC"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FAC61E14_F410_C014_41CB_5F2D5F5D2BA5",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 35.25,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26FDD753_2897_5378_41B7_9619EA432C06_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 135.94,
  "class": "PanoramaCameraPosition",
  "pitch": -9.7
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9976CDA_F410_C01D_41EB_F0F3E7E478E9",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -26.74,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "20-Recorrido13",
 "hfov": 360,
 "id": "panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F",
 "thumbnailUrl": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1",
   "yaw": 36.78,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -10.98
  },
  {
   "panorama": "this.panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98",
   "yaw": 28.33,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -150.77
  },
  {
   "panorama": "this.panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB",
   "yaw": -143.31,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -112.91
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_256CE479_382E_640A_4185_8344979ADC87",
  "this.overlay_11B81A48_383A_2C0A_41B2_183AFF3A2740",
  "this.overlay_1DFD34CE_383A_2406_41B7_762DFE2856D7"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 30.83,
  "class": "PanoramaCameraPosition",
  "pitch": 6.37
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9987CE5_F410_C037_41D1_3168365C9B54",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -113.81,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 47.76,
  "class": "PanoramaCameraPosition",
  "pitch": -26.18
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 40.15,
  "class": "PanoramaCameraPosition",
  "pitch": -3.38
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FAE2FE2B_F410_C03C_41ED_451F1E58D9E4",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 125.09,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "autoplay": true,
 "audio": {
  "oggUrl": "media/audio_57104A95_474E_7911_41C2_054CC9520D93.ogg",
  "mp3Url": "media/audio_57104A95_474E_7911_41C2_054CC9520D93.mp3",
  "class": "AudioResource"
 },
 "id": "audio_57104A95_474E_7911_41C2_054CC9520D93",
 "data": {
  "label": "Intro Busintana"
 },
 "class": "MediaAudio"
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "04-LugardeMemoriaEdit",
 "hfov": 360,
 "id": "panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5",
 "thumbnailUrl": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2",
   "yaw": -20.01,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 8.88
  },
  {
   "panorama": "this.panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E",
   "yaw": 1.42,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 54.56
  },
  {
   "panorama": "this.panorama_257C6FEF_2893_5328_4172_E0D92D05E20E",
   "yaw": -9.53,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -159.22
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_12D8E570_3836_241A_419C_C3AC74600BB7",
  "this.overlay_1FF51571_3835_E41A_41B0_9AF7DCB95E7C",
  "this.overlay_11F46063_382A_7C3E_41C5_3AB2A64B65CE"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -111.54,
  "class": "PanoramaCameraPosition",
  "pitch": 2.85
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_2554576B_2896_B328_41BF_FD80CFF00F46_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 156.89,
  "class": "PanoramaCameraPosition",
  "pitch": -0.33
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "07-Laberinto",
 "hfov": 360,
 "id": "panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB",
 "thumbnailUrl": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_257C6FEF_2893_5328_4172_E0D92D05E20E",
   "yaw": -79.45,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 30.82
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_121884FC_382F_E40A_41B3_788C19F20D55"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FA195D75_F410_C017_41E7_D5F5DF325A08",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -178.58,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -116.78,
  "class": "PanoramaCameraPosition",
  "pitch": -9.6
 }
},
{
 "vfov": 180,
 "hfovMin": "135%",
 "hfovMax": 130,
 "label": "34-Recorrido28",
 "id": "panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76",
 "thumbnailUrl": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_t.jpg",
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "partial": false,
 "class": "Panorama",
 "pitch": 0,
 "hfov": 360
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "05.Pagamento-04",
 "hfov": 360,
 "id": "panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2",
 "thumbnailUrl": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5",
   "yaw": 8.88,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -20.01
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_257C6FEF_2893_5328_4172_E0D92D05E20E"
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_110B8476_382A_2406_41C7_A3627122A64B",
  "this.overlay_14227294_382A_5C1A_41C0_F38B7035FE0C"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FA2F7DA1_F410_C02F_4196_86CDDEEE1D10",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -151.67,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9891CFA_F410_C01D_41E5_1A04248B3E50",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -27.26,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9802CEF_F410_C033_41E5_F85D6121EE81",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -61.42,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 33.55,
  "class": "PanoramaCameraPosition",
  "pitch": -23.95
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FA0A7D80_F410_C0ED_41E6_FB07FF63F470",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -123.77,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FA6CEDD5_F410_C017_41C1_89E001F6EC04",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -171.12,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_269F2632_2897_7539_41C0_B5C658969E9C_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -160.37,
  "class": "PanoramaCameraPosition",
  "pitch": -2.42
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "01-PortonDia3",
 "hfov": 360,
 "id": "panorama_4B8290DC_475B_C917_41D1_0520E111F4FE",
 "thumbnailUrl": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E",
   "yaw": -8.63,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -115.57
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "class": "CubicPanoramaFrame",
   "thumbnailUrl": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_t.jpg"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_4B8530DD_475B_C911_41AD_E2E73D1E1372",
  "this.overlay_4B8560DD_475B_C911_41D1_6EA1E464E6BE"
 ],
 "hfovMin": "135%"
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "45-Recorrido39",
 "hfov": 360,
 "id": "panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC",
 "thumbnailUrl": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_t.jpg",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555"
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_15D66C52_3816_241E_41A2_2ED1FB4586BC",
  "this.overlay_16DB0FC9_3815_E40A_4190_3D58A7561737",
  "this.overlay_086C97D5_386A_641A_41B8_BD281544DF56"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26F527D7_2896_F367_41BC_804C6E646518_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -129.29,
  "class": "PanoramaCameraPosition",
  "pitch": -14.61
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "37-Recorrido31",
 "hfov": 360,
 "id": "panorama_26D15EC9_2897_D568_41B8_31EF1FC59755",
 "thumbnailUrl": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB",
   "yaw": -19.14,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 123.44
  },
  {
   "panorama": "this.panorama_26FDD753_2897_5378_41B7_9619EA432C06",
   "yaw": -127.5,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 79.1
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_21A2FC79_3816_240A_41C5_9ABC807393C8",
  "this.overlay_22B64E87_3816_2406_41C7_A6CD38B33ADA"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FAD73E0A_F410_C3FC_41C4_E554091B4BA3",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -100.9,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "vfov": 180,
 "hfovMin": "135%",
 "hfovMax": 130,
 "label": "Conversaciones Afuera_Dia2",
 "id": "panorama_26E7E85E_2896_DD68_41C3_82E71C45E968",
 "thumbnailUrl": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_t.jpg",
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "partial": false,
 "class": "Panorama",
 "pitch": 0,
 "hfov": 360
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 33.5,
  "class": "PanoramaCameraPosition",
  "pitch": 2.2
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9B67D06_F410_C1F5_41ED_7D0F4587C23A",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -134.54,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "08-Recorrido1",
 "hfov": 360,
 "id": "panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF",
 "thumbnailUrl": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_t.jpg",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555"
  },
  {
   "panorama": "this.panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3",
   "yaw": 140.49,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -144.75
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_25210D8C_37F6_640A_41C5_D23A644FD354",
  "this.overlay_260B9FF6_37F6_6406_41AC_EF2F3A9B4A23",
  "this.overlay_25C99C2F_37F6_2406_41C1_92E15F1592EB"
 ],
 "hfovMin": "135%"
},
{
 "items": [
  {
   "media": "this.panorama_4B8290DC_475B_C917_41D1_0520E111F4FE",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_camera"
  },
  {
   "media": "this.panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 1, 2)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_camera"
  },
  {
   "media": "this.panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 2, 3)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_camera"
  },
  {
   "media": "this.panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 3, 4)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_camera"
  },
  {
   "media": "this.panorama_257C6FEF_2893_5328_4172_E0D92D05E20E",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 4, 5)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_camera"
  },
  {
   "media": "this.panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 5, 6)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_camera"
  },
  {
   "media": "this.panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 6, 7)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_camera"
  },
  {
   "media": "this.panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 7, 8)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_camera"
  },
  {
   "media": "this.panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 8, 9)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_camera"
  },
  {
   "media": "this.panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 9, 10)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_camera"
  },
  {
   "media": "this.panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 10, 11)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_camera"
  },
  {
   "media": "this.panorama_269F2632_2897_7539_41C0_B5C658969E9C",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 11, 12)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_269F2632_2897_7539_41C0_B5C658969E9C_camera"
  },
  {
   "media": "this.panorama_26FDD753_2897_5378_41B7_9619EA432C06",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 12, 13)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26FDD753_2897_5378_41B7_9619EA432C06_camera"
  },
  {
   "media": "this.panorama_26D15EC9_2897_D568_41B8_31EF1FC59755",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 13, 14)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_camera"
  },
  {
   "media": "this.panorama_26876093_2897_CDF8_41B3_20426A883A68",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 14, 15)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26876093_2897_CDF8_41B3_20426A883A68_camera"
  },
  {
   "media": "this.panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 15, 16)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_camera"
  },
  {
   "media": "this.panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 16, 17)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_camera"
  },
  {
   "media": "this.panorama_26F527D7_2896_F367_41BC_804C6E646518",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 17, 18)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26F527D7_2896_F367_41BC_804C6E646518_camera"
  },
  {
   "media": "this.panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 18, 19)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_camera"
  },
  {
   "media": "this.panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 19, 20)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_camera"
  },
  {
   "media": "this.panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 20, 21)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_camera"
  },
  {
   "media": "this.panorama_25476501_2891_74DB_4192_1CFE322BD079",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 21, 22)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_25476501_2891_74DB_4192_1CFE322BD079_camera"
  },
  {
   "media": "this.panorama_2554576B_2896_B328_41BF_FD80CFF00F46",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 22, 23)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_2554576B_2896_B328_41BF_FD80CFF00F46_camera"
  },
  {
   "media": "this.panorama_26F24DAA_2896_D728_41BD_23AF15C91790",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 23, 24)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26F24DAA_2896_D728_41BD_23AF15C91790_camera"
  },
  {
   "media": "this.panorama_269201DB_2896_CF6F_41A7_14503FADDAA8",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 24, 25)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_camera"
  },
  {
   "media": "this.panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 25, 26)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_camera"
  },
  {
   "media": "this.panorama_26E7E85E_2896_DD68_41C3_82E71C45E968",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 26, 0)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_camera"
  }
 ],
 "id": "ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist",
 "class": "PlayList"
},
{
 "vfov": 180,
 "hfovMin": "135%",
 "hfovMax": 130,
 "label": "36-Recorrido30",
 "id": "panorama_26876093_2897_CDF8_41B3_20426A883A68",
 "thumbnailUrl": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_t.jpg",
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26876093_2897_CDF8_41B3_20426A883A68_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "partial": false,
 "class": "Panorama",
 "pitch": 0,
 "hfov": 360
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FB1F7E43_F410_C073_41E6_D64684A8B430",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 78.38,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "06TemploUtero",
 "hfov": 360,
 "id": "panorama_257C6FEF_2893_5328_4172_E0D92D05E20E",
 "thumbnailUrl": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5",
   "yaw": -159.22,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -9.53
  },
  {
   "panorama": "this.panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB",
   "yaw": 30.82,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -79.45
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_11BFE8C0_382E_6C7A_41A5_4A9E4AFDE0C9",
  "this.overlay_125BAA80_382E_2CFA_41BC_1F92ACE7FFA4"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9BD0D11_F410_C1EF_41D1_F7947A6BE409",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 108.3,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9C57D3B_F410_C013_41B1_7CDD9C608D5D",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -151.49,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FA5ADDAB_F410_C033_41E0_DE93AFF46F52",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 169.02,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -23.42,
  "class": "PanoramaCameraPosition",
  "pitch": -6.31
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "Ritual-Inicio-Mujeres",
 "hfov": 360,
 "id": "panorama_2554576B_2896_B328_41BF_FD80CFF00F46",
 "thumbnailUrl": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_25476501_2891_74DB_4192_1CFE322BD079",
   "yaw": 66.19,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 153.26
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_1B137E45_383A_247A_41AC_43164E1F87C6"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FABABDF5_F410_C017_41E3_F63C8C4C0DDF",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 120.23,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26876093_2897_CDF8_41B3_20426A883A68_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -68.19,
  "class": "PanoramaCameraPosition",
  "pitch": -16.5
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FB0E6E4F_F410_C073_41A4_B456D5ECE9DE",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -120.82,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "30-Recorrido24",
 "hfov": 360,
 "id": "panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB",
 "thumbnailUrl": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F",
   "yaw": -112.91,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -143.31
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76"
  },
  {
   "panorama": "this.panorama_26D15EC9_2897_D568_41B8_31EF1FC59755",
   "yaw": 123.44,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -19.14
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_2697FEB2_382A_641E_41CB_FA680E2BD5F3",
  "this.overlay_25288F38_382A_640A_41C8_E290925351ED",
  "this.overlay_24282238_382E_5C0A_41C0_0494038C2513"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -136.68,
  "class": "PanoramaCameraPosition",
  "pitch": -9.61
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FAF11E1F_F410_C014_41E9_628AC34EA467",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -39.51,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FAA55E00_F410_C3ED_41CF_74FE39780454",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -56.56,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 159.13,
  "class": "PanoramaCameraPosition",
  "pitch": -13.29
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FA47ADB6_F410_C014_41C3_6604546A36A9",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 29.23,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "ExplicacionAltarDia2",
 "hfov": 360,
 "id": "panorama_269201DB_2896_CF6F_41A7_14503FADDAA8",
 "thumbnailUrl": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26F527D7_2896_F367_41BC_804C6E646518",
   "yaw": -30.82,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -101.62
  },
  {
   "panorama": "this.panorama_25476501_2891_74DB_4192_1CFE322BD079",
   "yaw": 152.74,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 59.18
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_19A72C80_3836_24FA_41AB_1BE44F93A6FC",
  "this.overlay_1B18D6B6_383A_2406_41C4_14321521C133"
 ],
 "hfovMin": "135%"
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "41-Recorrido35",
 "hfov": 360,
 "id": "panorama_26FDD753_2897_5378_41B7_9619EA432C06",
 "thumbnailUrl": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_269F2632_2897_7539_41C0_B5C658969E9C",
   "yaw": -71.7,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 56.23
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76"
  },
  {
   "panorama": "this.panorama_26D15EC9_2897_D568_41B8_31EF1FC59755",
   "yaw": 79.1,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -127.5
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_2FCF1729_381E_240A_41C3_C780D348DFAB",
  "this.overlay_21259E78_381A_640A_41B5_73386CAB70F0",
  "this.overlay_20B854AE_381A_6406_41BD_1C2C897C96E2"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_26F24DAA_2896_D728_41BD_23AF15C91790_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -62.92,
  "class": "PanoramaCameraPosition",
  "pitch": 2.17
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9DE4D30_F410_C02D_41D1_3629BC38A79A",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -143.22,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_25476501_2891_74DB_4192_1CFE322BD079_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 61.69,
  "class": "PanoramaCameraPosition",
  "pitch": -6.04
 }
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FA88DDEA_F410_C03D_41E1_FC19BDF8AD3A",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 20.78,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "25-Recorrido19",
 "hfov": 360,
 "id": "panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1",
 "thumbnailUrl": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F",
   "yaw": -10.98,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 36.78
  },
  {
   "panorama": "this.panorama_26F527D7_2896_F367_41BC_804C6E646518",
   "yaw": -119.8,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 28.51
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_1CDAE077_383D_DC06_41AC_6497754D90CD",
  "this.overlay_1FF4D2DA_383A_DC0E_41C7_EEFB60C4BB06"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "movements": [
   {
    "targetYaw": -173.98,
    "easing": "cubic_in_out",
    "pitchSpeed": 37.94,
    "class": "TargetPanoramaCameraMovement",
    "path": "shortest",
    "yawSpeed": 75.23,
    "targetPitch": -3.14
   },
   {
    "targetYaw": -23.94,
    "easing": "cubic_in_out",
    "pitchSpeed": 17.05,
    "class": "TargetPanoramaCameraMovement",
    "path": "shortest",
    "yawSpeed": 33.25,
    "targetPitch": -2.04
   }
  ],
  "restartMovementOnUserInteraction": false,
  "class": "PanoramaCameraSequence"
 },
 "automaticZoomSpeed": 10,
 "id": "camera_F9E5AD5F_F410_C013_41E0_BC3E41C6EDCB",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 171.37,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "items": [
  {
   "media": "this.panorama_4B8290DC_475B_C917_41D1_0520E111F4FE",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_camera"
  },
  {
   "media": "this.panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 1, 2)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_camera"
  },
  {
   "media": "this.panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 2, 3)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_camera"
  },
  {
   "media": "this.panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 3, 4)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_camera"
  },
  {
   "media": "this.panorama_257C6FEF_2893_5328_4172_E0D92D05E20E",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 4, 5)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_camera"
  },
  {
   "media": "this.panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 5, 6)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_camera"
  },
  {
   "media": "this.panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 6, 7)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_camera"
  },
  {
   "media": "this.panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 7, 8)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_camera"
  },
  {
   "media": "this.panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 8, 9)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_camera"
  },
  {
   "media": "this.panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 9, 10)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_camera"
  },
  {
   "media": "this.panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 10, 11)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_camera"
  },
  {
   "media": "this.panorama_269F2632_2897_7539_41C0_B5C658969E9C",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 11, 12)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_269F2632_2897_7539_41C0_B5C658969E9C_camera"
  },
  {
   "media": "this.panorama_26FDD753_2897_5378_41B7_9619EA432C06",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 12, 13)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26FDD753_2897_5378_41B7_9619EA432C06_camera"
  },
  {
   "media": "this.panorama_26D15EC9_2897_D568_41B8_31EF1FC59755",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 13, 14)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_camera"
  },
  {
   "media": "this.panorama_26876093_2897_CDF8_41B3_20426A883A68",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 14, 15)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26876093_2897_CDF8_41B3_20426A883A68_camera"
  },
  {
   "media": "this.panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 15, 16)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26AE95C0_2897_5758_41B4_9F0BD1469C76_camera"
  },
  {
   "media": "this.panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 16, 17)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_camera"
  },
  {
   "media": "this.panorama_26F527D7_2896_F367_41BC_804C6E646518",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 17, 18)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26F527D7_2896_F367_41BC_804C6E646518_camera"
  },
  {
   "media": "this.panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 18, 19)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_camera"
  },
  {
   "media": "this.panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 19, 20)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_camera"
  },
  {
   "media": "this.panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 20, 21)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_camera"
  },
  {
   "media": "this.panorama_25476501_2891_74DB_4192_1CFE322BD079",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 21, 22)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_25476501_2891_74DB_4192_1CFE322BD079_camera"
  },
  {
   "media": "this.panorama_2554576B_2896_B328_41BF_FD80CFF00F46",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 22, 23)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_2554576B_2896_B328_41BF_FD80CFF00F46_camera"
  },
  {
   "media": "this.panorama_26F24DAA_2896_D728_41BD_23AF15C91790",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 23, 24)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26F24DAA_2896_D728_41BD_23AF15C91790_camera"
  },
  {
   "media": "this.panorama_269201DB_2896_CF6F_41A7_14503FADDAA8",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 24, 25)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_camera"
  },
  {
   "media": "this.panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 25, 26)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26BFD624_2896_F4D8_41AC_13BF1D46D580_camera"
  },
  {
   "media": "this.panorama_26E7E85E_2896_DD68_41C3_82E71C45E968",
   "end": "this.trigger('tourEnded')",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 26, 0)",
   "player": "this.MainViewerPanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_26E7E85E_2896_DD68_41C3_82E71C45E968_camera"
  }
 ],
 "id": "mainPlayList",
 "class": "PlayList"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "camera_FA377D8B_F410_C0F3_41E7_68B31CBDF2E5",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 52.5,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "03-Afuera Casa",
 "hfov": 360,
 "id": "panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E",
 "thumbnailUrl": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_4B8290DC_475B_C917_41D1_0520E111F4FE",
   "yaw": -115.57,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": -8.63
  },
  {
   "panorama": "this.panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5",
   "yaw": 54.56,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 1.42
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_269F2632_2897_7539_41C0_B5C658969E9C"
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_1F390538_3836_240A_41B1_A3A33016190D",
  "this.overlay_1FD97542_3836_647E_41B8_62BF894D7E8F",
  "this.overlay_15CA7AF4_3816_6C1A_41C0_4BCCCF9B4CC9"
 ],
 "hfovMin": "135%"
},
{
 "gyroscopeVerticalDraggingEnabled": true,
 "mouseControlMode": "drag_acceleration",
 "buttonToggleHotspots": "this.IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96",
 "buttonCardboardView": [
  "this.IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB",
  "this.IconButton_1B9ADD00_16C4_0505_41B4_B043CA1AA270"
 ],
 "touchControlMode": "drag_rotation",
 "viewerArea": "this.MainViewer",
 "id": "MainViewerPanoramaPlayer",
 "buttonToggleGyroscope": "this.IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A",
 "class": "PanoramaPlayer",
 "displayPlaybackBar": true
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -63.74,
  "class": "PanoramaCameraPosition",
  "pitch": -16.74
 }
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "15-Recorrido8",
 "hfov": 360,
 "id": "panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98",
 "thumbnailUrl": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_t.jpg",
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F",
   "yaw": -150.77,
   "distance": 1,
   "class": "AdjacentPanorama",
   "backwardYaw": 28.33
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_25DC43E2_382A_5C3E_41CA_ED144E38E603",
  "this.overlay_1951805A_382A_7C0E_41C6_78CDCC3FEED6"
 ],
 "hfovMin": "135%"
},
{
 "partial": false,
 "hfovMax": 130,
 "label": "02. Altar",
 "hfov": 360,
 "id": "panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555",
 "thumbnailUrl": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_t.jpg",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD"
  }
 ],
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/f/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/f/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/f/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/f/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/u/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/u/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/u/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/u/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/r/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/r/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/r/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/r/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/b/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/b/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/b/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/b/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/d/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/d/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/d/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/d/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/l/0/{row}_{column}.jpg",
      "height": 2560,
      "rowCount": 5,
      "width": 2560,
      "tags": "ondemand",
      "colCount": 5,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/l/1/{row}_{column}.jpg",
      "height": 1536,
      "rowCount": 3,
      "width": 1536,
      "tags": "ondemand",
      "colCount": 3,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/l/2/{row}_{column}.jpg",
      "height": 1024,
      "rowCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_0/l/3/{row}_{column}.jpg",
      "height": 512,
      "rowCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_t.jpg",
   "class": "CubicPanoramaFrame"
  }
 ],
 "class": "Panorama",
 "pitch": 0,
 "vfov": 180,
 "overlays": [
  "this.overlay_23FC8AB0_37EA_6C1A_41C0_A6E239853DFB"
 ],
 "hfovMin": "135%"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   },
   {
    "yawSpeed": 7.96,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323
   },
   {
    "yawSpeed": 7.96,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 10,
 "id": "panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": -148.4,
  "class": "PanoramaCameraPosition",
  "pitch": 2.52
 }
},
{
 "progressBorderSize": 0,
 "id": "MainViewer",
 "left": 0,
 "toolTipPaddingRight": 10,
 "playbackBarBorderColor": "#FFFFFF",
 "toolTipBorderSize": 1,
 "progressBorderRadius": 0,
 "toolTipPaddingTop": 7,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "transitionMode": "blending",
 "toolTipPaddingLeft": 10,
 "width": "100%",
 "borderRadius": 0,
 "toolTipDisplayTime": 600,
 "paddingLeft": 0,
 "playbackBarLeft": 0,
 "progressBackgroundColorRatios": [
  0.01
 ],
 "minHeight": 50,
 "paddingBottom": 0,
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "toolTipBorderRadius": 3,
 "playbackBarHeadShadowVerticalLength": 0,
 "displayTooltipInTouchScreens": true,
 "progressBarBorderColor": "#0066FF",
 "progressBackgroundColorDirection": "vertical",
 "progressBorderColor": "#FFFFFF",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "minWidth": 100,
 "borderSize": 0,
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "class": "ViewerArea",
 "playbackBarBottom": 5,
 "toolTipShadowSpread": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "height": "100%",
 "toolTipOpacity": 0.5,
 "playbackBarHeight": 10,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 6,
 "toolTipShadowBlurRadius": 3,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipTextShadowColor": "#000000",
 "playbackBarRight": 0,
 "toolTipFontSize": 13,
 "toolTipTextShadowBlurRadius": 3,
 "toolTipFontWeight": "normal",
 "playbackBarProgressBorderSize": 0,
 "shadow": false,
 "toolTipPaddingBottom": 7,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderRadius": 0,
 "progressBarBorderSize": 6,
 "toolTipShadowColor": "#333333",
 "paddingTop": 0,
 "playbackBarBorderRadius": 0,
 "playbackBarHeadBorderRadius": 0,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipShadowOpacity": 0,
 "paddingRight": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "transitionDuration": 500,
 "top": 0,
 "toolTipTextShadowOpacity": 0,
 "playbackBarBorderSize": 0,
 "toolTipFontFamily": "Georgia",
 "propagateClick": true,
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "vrPointerSelectionColor": "#FF6600",
 "vrPointerSelectionTime": 2000,
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "progressBarBackgroundColorDirection": "vertical",
 "playbackBarHeadShadow": true,
 "progressBottom": 55,
 "toolTipBackgroundColor": "#000000",
 "toolTipFontColor": "#FFFFFF",
 "progressHeight": 6,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "data": {
  "name": "Main Viewer"
 },
 "vrPointerColor": "#FFFFFF",
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7
},
{
 "scrollBarMargin": 2,
 "children": [
  "this.Container_EF8F8BD8_E386_8E02_41E5_FC5C5513733A",
  "this.Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE"
 ],
 "id": "Container_EF8F8BD8_E386_8E03_41E3_4CF7CC1F4D8E",
 "width": 115.05,
 "data": {
  "name": "--SETTINGS"
 },
 "scrollBarWidth": 10,
 "right": "0%",
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "0%",
 "verticalAlign": "top",
 "propagateClick": true,
 "height": 641,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "gap": 10,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "scrollBarMargin": 2,
 "children": [
  "this.Label_0DD14F09_1744_0507_41AA_D8475423214A",
  "this.Label_0DD1AF09_1744_0507_41B4_9F5A60B503B2"
 ],
 "id": "Container_0DD1BF09_1744_0507_41B3_29434E440055",
 "left": 30,
 "width": 573,
 "data": {
  "name": "--STICKER"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "top": 15,
 "verticalAlign": "top",
 "propagateClick": true,
 "height": 133,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "gap": 10,
 "scrollBarOpacity": 0.5,
 "visible": false,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "scrollBarMargin": 2,
 "children": [
  "this.Image_1B99DD00_16C4_0505_41B3_51F09727447A",
  "this.Container_1B99BD00_16C4_0505_41A4_A3C2452B0288",
  "this.IconButton_1B9ADD00_16C4_0505_41B4_B043CA1AA270"
 ],
 "id": "Container_1B9AAD00_16C4_0505_41B5_6F4AE0747E48",
 "left": "0%",
 "data": {
  "name": "--MENU"
 },
 "scrollBarWidth": 10,
 "right": "0%",
 "backgroundOpacity": 0.64,
 "backgroundImageUrl": "skin/Container_1B9AAD00_16C4_0505_41B5_6F4AE0747E48.png",
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "propagateClick": true,
 "bottom": 0,
 "verticalAlign": "top",
 "height": 118,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "gap": 10,
 "scrollBarOpacity": 0.5,
 "visible": false,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "creationPolicy": "inAdvance",
 "horizontalAlign": "left"
},
{
 "scrollBarMargin": 2,
 "children": [
  "this.Container_062A782F_1140_E20B_41AF_B3E5DE341773",
  "this.Container_062A9830_1140_E215_41A7_5F2BBE5C20E4"
 ],
 "id": "Container_062AB830_1140_E215_41AF_6C9D65345420",
 "left": "0%",
 "data": {
  "name": "--INFO photo"
 },
 "scrollBarWidth": 10,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "0%",
 "bottom": "0%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "propagateClick": true,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, false, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarOpacity": 0.5,
 "visible": false,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "creationPolicy": "inAdvance",
 "horizontalAlign": "left"
},
{
 "scrollBarMargin": 2,
 "children": [
  "this.Container_23F7B7B7_0C0A_6293_4197_F931EEC6FA48",
  "this.Container_23F097B8_0C0A_629D_4176_D87C90BA32B6"
 ],
 "id": "Container_23F0F7B8_0C0A_629D_418A_F171085EFBF8",
 "left": "0%",
 "data": {
  "name": "--INFO photoalbum"
 },
 "scrollBarWidth": 10,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "0%",
 "bottom": "0%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "propagateClick": true,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_23F0F7B8_0C0A_629D_418A_F171085EFBF8, false, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarOpacity": 0.5,
 "visible": false,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "creationPolicy": "inAdvance",
 "horizontalAlign": "left"
},
{
 "scrollBarMargin": 2,
 "children": [
  "this.Container_39A197B1_0C06_62AF_419A_D15E4DDD2528"
 ],
 "id": "Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15",
 "left": "0%",
 "data": {
  "name": "--PANORAMA LIST"
 },
 "scrollBarWidth": 10,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "0%",
 "bottom": "0%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "propagateClick": true,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15, false, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarOpacity": 0.5,
 "visible": false,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "creationPolicy": "inAdvance",
 "horizontalAlign": "left"
},
{
 "scrollBarMargin": 2,
 "children": [
  "this.Container_221C1648_0C06_E5FD_4180_8A2E8B66315E",
  "this.Container_221B3648_0C06_E5FD_4199_FCE031AE003B"
 ],
 "id": "Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7",
 "left": "0%",
 "data": {
  "name": "--LOCATION"
 },
 "scrollBarWidth": 10,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "0%",
 "bottom": "0%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "propagateClick": true,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7, false, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarOpacity": 0.5,
 "visible": false,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "creationPolicy": "inAdvance",
 "horizontalAlign": "left"
},
{
 "scrollBarMargin": 2,
 "children": [
  "this.Container_2F8A6686_0D4F_6B71_4174_A02FE43588D3"
 ],
 "id": "Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41",
 "left": "0%",
 "data": {
  "name": "--FLOORPLAN"
 },
 "scrollBarWidth": 10,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "0%",
 "bottom": "0%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "propagateClick": true,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41, false, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarOpacity": 0.5,
 "visible": false,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "creationPolicy": "inAdvance",
 "horizontalAlign": "left"
},
{
 "scrollBarMargin": 2,
 "children": [
  "this.Container_28215A13_0D5D_5B97_4198_A7CA735E9E0A"
 ],
 "id": "Container_2820BA13_0D5D_5B97_4192_AABC38F6F169",
 "left": "0%",
 "data": {
  "name": "--PHOTOALBUM + text"
 },
 "scrollBarWidth": 10,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "0%",
 "bottom": "0%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "propagateClick": true,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_2820BA13_0D5D_5B97_4192_AABC38F6F169, true, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarOpacity": 0.5,
 "visible": false,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "creationPolicy": "inAdvance",
 "horizontalAlign": "left"
},
{
 "scrollBarMargin": 2,
 "children": [
  "this.Container_2A193C4C_0D3B_DFF0_4161_A2CD128EF536"
 ],
 "id": "Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E",
 "left": "0%",
 "data": {
  "name": "--PHOTOALBUM"
 },
 "scrollBarWidth": 10,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "0%",
 "bottom": "0%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "propagateClick": true,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E, false, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarOpacity": 0.5,
 "visible": false,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "creationPolicy": "inAdvance",
 "horizontalAlign": "left"
},
{
 "scrollBarMargin": 2,
 "children": [
  "this.Container_06C5DBA5_1140_A63F_41AD_1D83A33F1255",
  "this.Container_06C43BA5_1140_A63F_41A1_96DC8F4CAD2F"
 ],
 "id": "Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC",
 "left": "0%",
 "data": {
  "name": "--REALTOR"
 },
 "scrollBarWidth": 10,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "0%",
 "bottom": "0%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "propagateClick": true,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "scrollBarColor": "#04A3E1",
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC, false, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarOpacity": 0.5,
 "visible": false,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "creationPolicy": "inAdvance",
 "horizontalAlign": "left"
},
{
 "maxWidth": 58,
 "id": "IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D",
 "maxHeight": 58,
 "width": 58,
 "backgroundOpacity": 0,
 "transparencyActive": true,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "pressedIconURL": "skin/IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D_pressed.png",
 "minHeight": 1,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 58,
 "iconURL": "skin/IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D.png",
 "mode": "toggle",
 "minWidth": 1,
 "borderSize": 0,
 "class": "IconButton",
 "data": {
  "name": "IconButton MUTE"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "maxWidth": 58,
 "id": "IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0",
 "maxHeight": 58,
 "width": 58,
 "backgroundOpacity": 0,
 "transparencyActive": true,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "pressedIconURL": "skin/IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0_pressed.png",
 "minHeight": 1,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 58,
 "iconURL": "skin/IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0.png",
 "mode": "toggle",
 "minWidth": 1,
 "borderSize": 0,
 "class": "IconButton",
 "data": {
  "name": "IconButton FULLSCREEN"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 7.98,
   "yaw": -144.75,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -23.17
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431A5C55_4D56_B045_41CC_44A4FFFAC766",
   "pitch": -23.17,
   "yaw": -144.75,
   "distance": 100,
   "hfov": 7.98
  }
 ],
 "id": "overlay_2D679940_3816_2C7A_41C8_F2C723598B0D",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF, this.camera_FAF11E1F_F410_C014_41E9_628AC34EA467); this.mainPlayList.set('selectedIndex', 6)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 7.83,
   "yaw": 45.46,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -25.6
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431B9C55_4D56_B045_41D1_3776D94B2107",
   "pitch": -25.6,
   "yaw": 45.46,
   "distance": 100,
   "hfov": 7.83
  }
 ],
 "id": "overlay_2E14B1AA_381A_3C0E_419E_411FDA3701AB",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_269F2632_2897_7539_41C0_B5C658969E9C, this.camera_FAE2FE2B_F410_C03C_41ED_451F1E58D9E4); this.mainPlayList.set('selectedIndex', 11)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.35,
   "yaw": 31.11,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -15.99
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431DCC5F_4D56_B045_41A8_E08011CA8431",
   "pitch": -15.99,
   "yaw": 31.11,
   "distance": 100,
   "hfov": 8.35
  }
 ],
 "id": "overlay_27A0A609_3836_240A_41AB_EF8D3EED9FEE",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 20)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.19,
   "yaw": 59.18,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -19.35
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431D2C5F_4D56_B045_41C1_30F1AD5C0B74",
   "pitch": -19.35,
   "yaw": 59.18,
   "distance": 50,
   "hfov": 8.19
  }
 ],
 "id": "overlay_18FFF57C_3836_640A_41C8_DDB2D98FD0C8",
 "data": {
  "label": "Arrow 02a Right-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_269201DB_2896_CF6F_41A7_14503FADDAA8, this.camera_F9891CFA_F410_C01D_41E5_1A04248B3E50); this.mainPlayList.set('selectedIndex', 24)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_1_HS_2_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 6.82,
   "yaw": -59.77,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -38.21
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4302AC5F_4D56_B045_41CB_0A6E46EDB333",
   "pitch": -38.21,
   "yaw": -59.77,
   "distance": 100,
   "hfov": 6.82
  }
 ],
 "id": "overlay_278976C0_3836_247A_41C2_3B0C4A67A8C9",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26F24DAA_2896_D728_41BD_23AF15C91790, this.camera_F9802CEF_F410_C033_41E5_F85D6121EE81); this.mainPlayList.set('selectedIndex', 23)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_1_HS_3_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 6.2,
   "yaw": 153.26,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -44.41
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43020C60_4D56_B07B_41C1_CCE4E5E17B9B",
   "pitch": -44.41,
   "yaw": 153.26,
   "distance": 100,
   "hfov": 6.2
  }
 ],
 "id": "overlay_189FCAFF_3836_EC06_4192_17CBE85DF2E2",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_2554576B_2896_B328_41BF_FD80CFF00F46, this.camera_F9987CE5_F410_C037_41D1_3168365C9B54); this.mainPlayList.set('selectedIndex', 22)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 9.06,
   "yaw": -101.62,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -39.2
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431FBC5D_4D56_B045_41CE_7CBD699582E0",
   "pitch": -39.2,
   "yaw": -101.62,
   "distance": 50,
   "hfov": 9.06
  }
 ],
 "id": "overlay_1E061CFE_383E_6406_41BF_F45F7BAF37AF",
 "data": {
  "label": "Arrow 02b Left-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_269201DB_2896_CF6F_41A7_14503FADDAA8, this.camera_FAFCACAF_F410_C032_41EB_4F3AE2D8173B); this.mainPlayList.set('selectedIndex', 24)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.16,
   "yaw": 28.51,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -19.98
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431F1C5D_4D56_B045_41CE_B0478052482F",
   "pitch": -19.98,
   "yaw": 28.51,
   "distance": 50,
   "hfov": 8.16
  }
 ],
 "id": "overlay_1C9EF2D3_383E_5C1E_41B4_844FDDA7A1CC",
 "data": {
  "label": "Arrow 02c Right-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1, this.camera_FAF05CA4_F410_C035_41DC_BAABE0D83B3D); this.mainPlayList.set('selectedIndex', 18)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_1_HS_0_0_0_map.gif",
      "width": 29,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.91,
   "yaw": -92.45,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -21.14
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43140C54_4D56_B05B_41B6_D87F44623CA0",
   "pitch": -21.14,
   "yaw": -92.45,
   "distance": 100,
   "hfov": 8.91
  }
 ],
 "id": "overlay_2C851F93_3816_241E_41BD_20093D5678DF",
 "data": {
  "label": "Arrow 01b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 8)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 7.52,
   "yaw": -104.17,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -30.05
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43147C54_4D56_B05B_41CF_09F6F698C547",
   "pitch": -30.05,
   "yaw": -104.17,
   "distance": 50,
   "hfov": 7.52
  }
 ],
 "id": "overlay_2DF29F28_3816_240A_41C1_CCAD0097EEA1",
 "data": {
  "label": "Arrow 02a Left"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26E65F77_2892_D338_41AF_F4663A4FF807, this.camera_07D87AF4_387E_6C1A_41C7_E28A694E6A74)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 10.98,
   "yaw": 118.58,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -31.28
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4303DC60_4D56_B07B_41C7_85CB2403C6FA",
   "pitch": -31.28,
   "yaw": 118.58,
   "distance": 100,
   "hfov": 10.98
  }
 ],
 "id": "overlay_1A60C95B_383B_EC0E_41BF_C2321CFD8BFB",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_25476501_2891_74DB_4192_1CFE322BD079, this.camera_FABABDF5_F410_C017_41E3_F63C8C4C0DDF); this.mainPlayList.set('selectedIndex', 21)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.11,
   "yaw": 56.23,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -20.97
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431BFC56_4D56_B047_41CB_D38375F1602F",
   "pitch": -20.97,
   "yaw": 56.23,
   "distance": 50,
   "hfov": 8.11
  }
 ],
 "id": "overlay_2EEFA38B_381A_5C0E_41A2_F5DD5506E8E7",
 "data": {
  "label": "Arrow 02a Right-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26FDD753_2897_5378_41B7_9619EA432C06, this.camera_F9BD0D11_F410_C1EF_41D1_F7947A6BE409); this.mainPlayList.set('selectedIndex', 12)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 7.41,
   "yaw": -54.91,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -31.39
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431B5C56_4D56_B047_41D2_51D7A7F91F52",
   "pitch": -31.39,
   "yaw": -54.91,
   "distance": 50,
   "hfov": 7.41
  }
 ],
 "id": "overlay_2F228949_381E_2C0A_41C8_9E55C770ABFC",
 "data": {
  "label": "Arrow 02c Left-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3, this.camera_F9B67D06_F410_C1F5_41ED_7D0F4587C23A); this.mainPlayList.set('selectedIndex', 10)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.04,
   "yaw": -143.31,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -22.19
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431FCC5E_4D56_B047_41C8_AD61064A5A5B",
   "pitch": -22.19,
   "yaw": -143.31,
   "distance": 100,
   "hfov": 8.04
  }
 ],
 "id": "overlay_256CE479_382E_640A_4185_8344979ADC87",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB, this.camera_FA733DC0_F410_C06D_41CE_5029002C4EB0); this.mainPlayList.set('selectedIndex', 16)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.35,
   "yaw": 36.78,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -15.81
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431F3C5E_4D56_B047_41BB_8822E1B2369D",
   "pitch": -15.81,
   "yaw": 36.78,
   "distance": 50,
   "hfov": 8.35
  }
 ],
 "id": "overlay_11B81A48_383A_2C0A_41B2_183AFF3A2740",
 "data": {
  "label": "Arrow 02b Right-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1, this.camera_FA5ADDAB_F410_C033_41E0_DE93AFF46F52); this.mainPlayList.set('selectedIndex', 18)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_1_HS_2_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.53,
   "yaw": 28.33,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -10.6
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431CBC5E_4D56_B047_41BC_CFF969FDEE55",
   "pitch": -10.6,
   "yaw": 28.33,
   "distance": 50,
   "hfov": 8.53
  }
 ],
 "id": "overlay_1DFD34CE_383A_2406_41B7_762DFE2856D7",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98, this.camera_FA47ADB6_F410_C014_41C3_6604546A36A9); this.mainPlayList.set('selectedIndex', 20)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.5,
   "yaw": -20.01,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -11.64
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4316FC52_4D56_B05F_41C9_5846F2319AB5",
   "pitch": -11.64,
   "yaw": -20.01,
   "distance": 50,
   "hfov": 8.5
  }
 ],
 "id": "overlay_12D8E570_3836_241A_419C_C3AC74600BB7",
 "data": {
  "label": "Arrow 02a Left-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2, this.camera_FA6CEDD5_F410_C017_41C1_89E001F6EC04); this.mainPlayList.set('selectedIndex', 3)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.53,
   "yaw": 1.42,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -10.66
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43163C53_4D56_B05D_41CF_B255B50FCB2B",
   "pitch": -10.66,
   "yaw": 1.42,
   "distance": 50,
   "hfov": 8.53
  }
 ],
 "id": "overlay_1FF51571_3835_E41A_41B0_9AF7DCB95E7C",
 "data": {
  "label": "Arrow 02a Right-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E, this.camera_FA9E0DE0_F410_C02D_41D5_384DE36681F6); this.mainPlayList.set('selectedIndex', 1)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_1_HS_2_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.59,
   "yaw": -9.53,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -8.58
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43167C53_4D56_B05D_419F_92E0B4D27854",
   "pitch": -8.58,
   "yaw": -9.53,
   "distance": 100,
   "hfov": 8.59
  }
 ],
 "id": "overlay_11F46063_382A_7C3E_41C5_3AB2A64B65CE",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_257C6FEF_2893_5328_4172_E0D92D05E20E, this.camera_FA88DDEA_F410_C03D_41E1_FC19BDF8AD3A); this.mainPlayList.set('selectedIndex', 4)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.03,
   "yaw": -79.45,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -22.36
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43141C54_4D56_B05B_4189_41FED4FAD9E6",
   "pitch": -22.36,
   "yaw": -79.45,
   "distance": 100,
   "hfov": 8.03
  }
 ],
 "id": "overlay_121884FC_382F_E40A_41B3_788C19F20D55",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_257C6FEF_2893_5328_4172_E0D92D05E20E, this.camera_FA22AD96_F410_C015_418B_13BD0EAA13CD); this.mainPlayList.set('selectedIndex', 4)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 7.66,
   "yaw": -1.3,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -28.03
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4317DC53_4D56_B05D_41C0_24B4A8814E81",
   "pitch": -28.03,
   "yaw": -1.3,
   "distance": 100,
   "hfov": 7.66
  }
 ],
 "id": "overlay_110B8476_382A_2406_41C7_A3627122A64B",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 4)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 7.58,
   "yaw": 8.88,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -29.13
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43171C53_4D56_B05D_41BC_17DAA3C5A988",
   "pitch": -29.13,
   "yaw": 8.88,
   "distance": 50,
   "hfov": 7.58
  }
 ],
 "id": "overlay_14227294_382A_5C1A_41C0_F38B7035FE0C",
 "data": {
  "label": "Arrow 02a Right"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5, this.camera_FAED9E37_F410_C014_41E8_B942E999C537); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_1_HS_4_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 9.02,
   "yaw": 141.3,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -19.11
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43108C4B_4D56_B04D_41BC_4B4DBB7FA279",
   "pitch": -19.11,
   "yaw": 141.3,
   "distance": 100,
   "hfov": 9.02
  }
 ],
 "id": "overlay_4B8530DD_475B_C911_41AD_E2E73D1E1372",
 "data": {
  "label": "Arrow 01c"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26E65F77_2892_D338_41AF_F4663A4FF807, this.camera_071D7A5A_387E_6C0E_41C8_3AA7B35072B2)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_1_HS_5_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 9.34,
   "yaw": -8.63,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -12.05
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4310FC4C_4D56_B04B_41BD_D159EC2B6456",
   "pitch": -12.05,
   "yaw": -8.63,
   "distance": 100,
   "hfov": 9.34
  }
 ],
 "id": "overlay_4B8560DD_475B_C911_41D1_6EA1E464E6BE",
 "data": {
  "label": "Arrow 01c"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E, this.camera_FA7DDDCA_F410_C07D_41E0_953B60BE3211); this.mainPlayList.set('selectedIndex', 1)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 7.98,
   "yaw": 140.06,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -23.17
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4315BC55_4D56_B045_41D3_2D14E41062C0",
   "pitch": -23.17,
   "yaw": 140.06,
   "distance": 100,
   "hfov": 7.98
  }
 ],
 "id": "overlay_15D66C52_3816_241E_41A2_2ED1FB4586BC",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 7.69,
   "yaw": -21.45,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -27.68
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4315FC55_4D56_B045_41C4_82E4BC19B5AE",
   "pitch": -27.68,
   "yaw": -21.45,
   "distance": 100,
   "hfov": 7.69
  }
 ],
 "id": "overlay_16DB0FC9_3815_E40A_4190_3D58A7561737",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 10)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_1_HS_2_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 5.52,
   "yaw": -147.07,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -50.54
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43155C55_4D56_B045_41C9_B7D0D7E8F8E5",
   "pitch": -50.54,
   "yaw": -147.07,
   "distance": 100,
   "hfov": 5.52
  }
 ],
 "id": "overlay_086C97D5_386A_641A_41B8_BD281544DF56",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 9)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 11.06,
   "yaw": -19.14,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -15.23
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4319DC57_4D56_B045_41C8_1E8D5C1EBB5C",
   "pitch": -15.23,
   "yaw": -19.14,
   "distance": 100,
   "hfov": 11.06
  }
 ],
 "id": "overlay_21A2FC79_3816_240A_41C5_9ABC807393C8",
 "data": {
  "label": "Arrow 02b Right-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB, this.camera_FAA55E00_F410_C3ED_41CF_74FE39780454); this.mainPlayList.set('selectedIndex', 16)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.81,
   "yaw": -127.5,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -28.95
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43193C57_4D56_B045_41C1_E606D8D1F790",
   "pitch": -28.95,
   "yaw": -127.5,
   "distance": 100,
   "hfov": 8.81
  }
 ],
 "id": "overlay_22B64E87_3816_2406_41C7_A6CD38B33ADA",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26FDD753_2897_5378_41B7_9619EA432C06, this.camera_FAD73E0A_F410_C3FC_41C4_E554091B4BA3); this.mainPlayList.set('selectedIndex', 12)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.12,
   "yaw": 15.37,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -49.51
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43146C54_4D56_B05B_41B0_B8378EB679DC",
   "pitch": -49.51,
   "yaw": 15.37,
   "distance": 50,
   "hfov": 8.12
  }
 ],
 "id": "overlay_25210D8C_37F6_640A_41C5_D23A644FD354",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 9)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 9.15,
   "yaw": 140.49,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -16.74
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4315CC54_4D56_B05B_4169_4D00F7A2F328",
   "pitch": -16.74,
   "yaw": 140.49,
   "distance": 100,
   "hfov": 9.15
  }
 ],
 "id": "overlay_260B9FF6_37F6_6406_41AC_EF2F3A9B4A23",
 "data": {
  "label": "Arrow 01b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3, this.camera_FAC61E14_F410_C014_41CB_5F2D5F5D2BA5); this.mainPlayList.set('selectedIndex', 10)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_1_HS_2_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 7.4,
   "yaw": -67.9,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -39.26
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43149C54_4D56_B05B_4196_965000D9FEE5",
   "pitch": -39.26,
   "yaw": -67.9,
   "distance": 100,
   "hfov": 7.4
  }
 ],
 "id": "overlay_25C99C2F_37F6_2406_41C1_92E15F1592EB",
 "data": {
  "label": "Arrow 01b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 7)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.42,
   "yaw": -159.22,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -14.02
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43177C53_4D56_B05D_41C3_C6CC44E0C7DA",
   "pitch": -14.02,
   "yaw": -159.22,
   "distance": 100,
   "hfov": 8.42
  }
 ],
 "id": "overlay_11BFE8C0_382E_6C7A_41A5_4A9E4AFDE0C9",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5, this.camera_F9AA0D1B_F410_C013_41C4_DF1C8D55B4A1); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.55,
   "yaw": 30.82,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -10.2
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4314AC53_4D56_B05D_41C7_6CE1BFB95A2E",
   "pitch": -10.2,
   "yaw": 30.82,
   "distance": 100,
   "hfov": 8.55
  }
 ],
 "id": "overlay_125BAA80_382E_2CFA_41BC_1F92ACE7FFA4",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB, this.camera_F9D13D25_F410_C037_41D6_711E7DF1AE7B); this.mainPlayList.set('selectedIndex', 5)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 10.96,
   "yaw": 66.19,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -38.51
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43027C60_4D56_B07B_41D1_6BC54EB105B3",
   "pitch": -38.51,
   "yaw": 66.19,
   "distance": 50,
   "hfov": 10.96
  }
 ],
 "id": "overlay_1B137E45_383A_247A_41AC_43164E1F87C6",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_25476501_2891_74DB_4192_1CFE322BD079, this.camera_F9976CDA_F410_C01D_41EB_F0F3E7E478E9); this.mainPlayList.set('selectedIndex', 21)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 7.42,
   "yaw": 123.44,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -31.27
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431E9C57_4D56_B040_41BF_9C6D24B314C5",
   "pitch": -31.27,
   "yaw": 123.44,
   "distance": 50,
   "hfov": 7.42
  }
 ],
 "id": "overlay_2697FEB2_382A_641E_41CB_FA680E2BD5F3",
 "data": {
  "label": "Arrow 02b Right-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26D15EC9_2897_D568_41B8_31EF1FC59755, this.camera_F9FE1D53_F410_C013_41C3_8C9C7D563507); this.mainPlayList.set('selectedIndex', 13)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.17,
   "yaw": 8.54,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -19.81
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431EFC5C_4D56_B04B_41D1_40B842050A63",
   "pitch": -19.81,
   "yaw": 8.54,
   "distance": 100,
   "hfov": 8.17
  }
 ],
 "id": "overlay_25288F38_382A_640A_41C8_E290925351ED",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 15)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_1_HS_2_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.24,
   "yaw": -112.91,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -18.3
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431E4C5D_4D56_B045_41D2_4E055B8FB861",
   "pitch": -18.3,
   "yaw": -112.91,
   "distance": 100,
   "hfov": 8.24
  }
 ],
 "id": "overlay_24282238_382E_5C0A_41C0_0494038C2513",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F, this.camera_F9F01D45_F410_C077_41DF_34543CA448D4); this.mainPlayList.set('selectedIndex', 19)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 9.24,
   "yaw": 152.74,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -27.51
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43033C60_4D56_B07B_41D2_E753CBC11172",
   "pitch": -27.51,
   "yaw": 152.74,
   "distance": 100,
   "hfov": 9.24
  }
 ],
 "id": "overlay_19A72C80_3836_24FA_41AB_1BE44F93A6FC",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_25476501_2891_74DB_4192_1CFE322BD079, this.camera_FB0E6E4F_F410_C073_41A4_B456D5ECE9DE); this.mainPlayList.set('selectedIndex', 21)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.1,
   "yaw": -30.82,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -21.08
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4300CC61_4D56_B07D_41CF_1FF4A1C9AA15",
   "pitch": -21.08,
   "yaw": -30.82,
   "distance": 100,
   "hfov": 8.1
  }
 ],
 "id": "overlay_1B18D6B6_383A_2406_41C4_14321521C133",
 "data": {
  "label": "Arrow 02c"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26F527D7_2896_F367_41BC_804C6E646518, this.camera_FB1F7E43_F410_C073_41E6_D64684A8B430); this.mainPlayList.set('selectedIndex', 17)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.21,
   "yaw": -71.7,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -18.94
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4318BC56_4D56_B047_41B2_348F4A5DCB1C",
   "pitch": -18.94,
   "yaw": -71.7,
   "distance": 100,
   "hfov": 8.21
  }
 ],
 "id": "overlay_2FCF1729_381E_240A_41C3_C780D348DFAB",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_269F2632_2897_7539_41C0_B5C658969E9C, this.camera_FA0A7D80_F410_C0ED_41E6_FB07FF63F470); this.mainPlayList.set('selectedIndex', 11)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.3,
   "yaw": 79.1,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -17.03
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43180C56_4D56_B047_41C6_35351B0F132A",
   "pitch": -17.03,
   "yaw": 79.1,
   "distance": 50,
   "hfov": 8.3
  }
 ],
 "id": "overlay_21259E78_381A_640A_41B5_73386CAB70F0",
 "data": {
  "label": "Arrow 02b Right-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26D15EC9_2897_D568_41B8_31EF1FC59755, this.camera_FA377D8B_F410_C0F3_41E7_68B31CBDF2E5); this.mainPlayList.set('selectedIndex', 13)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_1_HS_2_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.65,
   "yaw": 150.88,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -4.82
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43185C56_4D56_B047_41C9_F4789CEF270B",
   "pitch": -4.82,
   "yaw": 150.88,
   "distance": 100,
   "hfov": 8.65
  }
 ],
 "id": "overlay_20B854AE_381A_6406_41BD_1C2C897C96E2",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 15)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.25,
   "yaw": -119.8,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -18.07
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431F7C5D_4D56_B045_41D0_F281FA1BB2DD",
   "pitch": -18.07,
   "yaw": -119.8,
   "distance": 100,
   "hfov": 8.25
  }
 ],
 "id": "overlay_1CDAE077_383D_DC06_41AC_6497754D90CD",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26F527D7_2896_F367_41BC_804C6E646518, this.camera_F9C57D3B_F410_C013_41B1_7CDD9C608D5D); this.mainPlayList.set('selectedIndex', 17)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.12,
   "yaw": -10.98,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -20.8
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431C0C5E_4D56_B047_41BB_D6084E85E88C",
   "pitch": -20.8,
   "yaw": -10.98,
   "distance": 100,
   "hfov": 8.12
  }
 ],
 "id": "overlay_1FF4D2DA_383A_DC0E_41C7_EEFB60C4BB06",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F, this.camera_F9DE4D30_F410_C02D_41D1_3629BC38A79A); this.mainPlayList.set('selectedIndex', 19)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.18,
   "yaw": -115.57,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -19.58
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4311FC52_4D56_B05F_41CD_5EC42EAD7D31",
   "pitch": -19.58,
   "yaw": -115.57,
   "distance": 100,
   "hfov": 8.18
  }
 ],
 "id": "overlay_1F390538_3836_240A_41B1_A3A33016190D",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_4B8290DC_475B_C917_41D1_0520E111F4FE, this.camera_F9E5AD5F_F410_C013_41E0_BC3E41C6EDCB); this.mainPlayList.set('selectedIndex', 0)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.43,
   "yaw": 54.56,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -13.79
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43113C52_4D56_B05F_41BC_A107259D06D3",
   "pitch": -13.79,
   "yaw": 54.56,
   "distance": 100,
   "hfov": 8.43
  }
 ],
 "id": "overlay_1FD97542_3836_647E_41B8_62BF894D7E8F",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5, this.camera_FA195D75_F410_C017_41E7_D5F5DF325A08); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_1_HS_2_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.57,
   "yaw": 94.26,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -9.45
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_43168C52_4D56_B05F_41CE_875D2EFC9176",
   "pitch": -9.45,
   "yaw": 94.26,
   "distance": 50,
   "hfov": 8.57
  }
 ],
 "id": "overlay_15CA7AF4_3816_6C1A_41C0_4BCCCF9B4CC9",
 "data": {
  "label": "Arrow 02a Right-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 11)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "maxWidth": 58,
 "id": "IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96",
 "maxHeight": 58,
 "width": 58,
 "backgroundOpacity": 0,
 "transparencyActive": true,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "pressedIconURL": "skin/IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96_pressed.png",
 "minHeight": 1,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 58,
 "iconURL": "skin/IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96.png",
 "mode": "toggle",
 "minWidth": 1,
 "borderSize": 0,
 "class": "IconButton",
 "data": {
  "name": "IconButton HS "
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "maxWidth": 58,
 "id": "IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB",
 "maxHeight": 58,
 "width": 58,
 "backgroundOpacity": 0,
 "transparencyActive": true,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "rollOverIconURL": "skin/IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB_rollover.png",
 "minHeight": 1,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 58,
 "iconURL": "skin/IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB.png",
 "mode": "push",
 "minWidth": 1,
 "borderSize": 0,
 "class": "IconButton",
 "data": {
  "name": "IconButton VR"
 },
 "visible": false,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "maxWidth": 49,
 "id": "IconButton_1B9ADD00_16C4_0505_41B4_B043CA1AA270",
 "maxHeight": 37,
 "width": 100,
 "right": 30,
 "backgroundOpacity": 0,
 "transparencyActive": true,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "rollOverIconURL": "skin/IconButton_1B9ADD00_16C4_0505_41B4_B043CA1AA270_rollover.png",
 "minHeight": 1,
 "paddingBottom": 0,
 "propagateClick": true,
 "bottom": 8,
 "verticalAlign": "middle",
 "height": 75,
 "iconURL": "skin/IconButton_1B9ADD00_16C4_0505_41B4_B043CA1AA270.png",
 "pressedIconURL": "skin/IconButton_1B9ADD00_16C4_0505_41B4_B043CA1AA270_pressed.png",
 "mode": "push",
 "minWidth": 1,
 "borderSize": 0,
 "class": "IconButton",
 "data": {
  "name": "IconButton VR"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "maxWidth": 58,
 "id": "IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A",
 "maxHeight": 58,
 "width": 58,
 "backgroundOpacity": 0,
 "transparencyActive": true,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "pressedIconURL": "skin/IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A_pressed.png",
 "minHeight": 1,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 58,
 "iconURL": "skin/IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A.png",
 "mode": "toggle",
 "minWidth": 1,
 "borderSize": 0,
 "class": "IconButton",
 "data": {
  "name": "IconButton GYRO"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 8.35,
   "yaw": 40.9,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -15.87
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431C2C5F_4D56_B045_41CC_B8DDEEC5D6E2",
   "pitch": -15.87,
   "yaw": 40.9,
   "distance": 100,
   "hfov": 8.35
  }
 ],
 "id": "overlay_25DC43E2_382A_5C3E_41CA_ED144E38E603",
 "data": {
  "label": "Arrow 02b"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_1_HS_1_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 7.98,
   "yaw": -150.77,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -23.28
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431C6C5F_4D56_B045_41D0_852671FDE2C4",
   "pitch": -23.28,
   "yaw": -150.77,
   "distance": 100,
   "hfov": 7.98
  }
 ],
 "id": "overlay_1951805A_382A_7C0E_41C6_78CDCC3FEED6",
 "data": {
  "label": "Arrow 02a"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F, this.camera_FA2F7DA1_F410_C02F_4196_86CDDEEE1D10); this.mainPlayList.set('selectedIndex', 19)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "enabledInCardboard": true,
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_1_HS_0_0_0_map.gif",
      "width": 26,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "hfov": 9.46,
   "yaw": -6.57,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -10.08
  }
 ],
 "useHandCursor": true,
 "rollOverDisplay": false,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_431AEC55_4D56_B045_41A8_649F743D4AB8",
   "pitch": -10.08,
   "yaw": -6.57,
   "distance": 100,
   "hfov": 9.46
  }
 ],
 "id": "overlay_23FC8AB0_37EA_6C1A_41C0_A6E239853DFB",
 "data": {
  "label": "Arrow 02a Right-Up"
 },
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 7)",
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "data": {
  "name": "button menu sup"
 },
 "children": [
  "this.IconButton_EF8F8BD8_E386_8E02_41D6_310FF1964329"
 ],
 "id": "Container_EF8F8BD8_E386_8E02_41E5_FC5C5513733A",
 "width": 110,
 "scrollBarWidth": 10,
 "right": "0%",
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "top": "0%",
 "verticalAlign": "middle",
 "propagateClick": true,
 "height": 110,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "center"
},
{
 "data": {
  "name": "-button set"
 },
 "children": [
  "this.IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB",
  "this.IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A",
  "this.IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D",
  "this.IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96",
  "this.IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0",
  "this.IconButton_EE5807F6_E3BE_860E_41E7_431DDDA54BAC",
  "this.IconButton_EED5213F_E3B9_7A7D_41D8_1B642C004521"
 ],
 "id": "Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE",
 "scrollBarWidth": 10,
 "right": "0%",
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "91.304%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": true,
 "bottom": "0%",
 "verticalAlign": "top",
 "height": "85.959%",
 "minWidth": 1,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "gap": 3,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "visible": false,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "center"
},
{
 "fontFamily": "Bebas Neue Bold",
 "fontWeight": "bold",
 "data": {
  "name": "text 1"
 },
 "id": "Label_0DD14F09_1744_0507_41AA_D8475423214A",
 "left": 0,
 "width": 454,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "text": "LOREM IPSUM",
 "paddingLeft": 0,
 "textShadowBlurRadius": 10,
 "minHeight": 1,
 "paddingBottom": 0,
 "top": 5,
 "verticalAlign": "top",
 "propagateClick": true,
 "height": 86,
 "minWidth": 1,
 "borderSize": 0,
 "textShadowVerticalLength": 0,
 "textShadowHorizontalLength": 0,
 "class": "Label",
 "textShadowOpacity": 1,
 "fontColor": "#FFFFFF",
 "fontStyle": "normal",
 "fontSize": 90,
 "textDecoration": "none",
 "horizontalAlign": "left",
 "paddingTop": 0,
 "textShadowColor": "#000000",
 "shadow": false
},
{
 "fontFamily": "Bebas Neue Book",
 "fontWeight": "normal",
 "data": {
  "name": "text 2"
 },
 "id": "Label_0DD1AF09_1744_0507_41B4_9F5A60B503B2",
 "left": 0,
 "width": 388,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "text": "dolor sit amet, consectetur ",
 "paddingLeft": 0,
 "textShadowBlurRadius": 10,
 "minHeight": 1,
 "paddingBottom": 0,
 "propagateClick": true,
 "bottom": 0,
 "verticalAlign": "top",
 "height": 46,
 "minWidth": 1,
 "borderSize": 0,
 "textShadowVerticalLength": 0,
 "textShadowHorizontalLength": 0,
 "class": "Label",
 "textShadowOpacity": 1,
 "fontColor": "#FFFFFF",
 "fontStyle": "normal",
 "fontSize": 41,
 "textDecoration": "none",
 "horizontalAlign": "left",
 "paddingTop": 0,
 "textShadowColor": "#000000",
 "shadow": false
},
{
 "maxWidth": 3000,
 "id": "Image_1B99DD00_16C4_0505_41B3_51F09727447A",
 "left": "0%",
 "maxHeight": 2,
 "right": "0%",
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "url": "skin/Image_1B99DD00_16C4_0505_41B3_51F09727447A.png",
 "propagateClick": true,
 "bottom": 53,
 "verticalAlign": "middle",
 "height": 2,
 "minWidth": 1,
 "borderSize": 0,
 "class": "Image",
 "data": {
  "name": "white line"
 },
 "scaleMode": "fit_outside",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "shadow": false
},
{
 "scrollBarMargin": 2,
 "children": [
  "this.Button_1B998D00_16C4_0505_41AD_67CAA4AAEFE0",
  "this.Button_1B999D00_16C4_0505_41AB_D0C2E7857448",
  "this.Button_1B9A6D00_16C4_0505_4197_F2108627CC98",
  "this.Button_1B9A4D00_16C4_0505_4193_E0EA69B0CBB0",
  "this.Button_1B9A5D00_16C4_0505_41B0_D18F25F377C4",
  "this.Button_1B9A3D00_16C4_0505_41B2_6830155B7D52"
 ],
 "id": "Container_1B99BD00_16C4_0505_41A4_A3C2452B0288",
 "left": "0%",
 "width": 1199,
 "data": {
  "name": "-button set container"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 30,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": true,
 "bottom": "0%",
 "verticalAlign": "middle",
 "height": 51,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "gap": 3,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "shadowBlurRadius": 25,
 "data": {
  "name": "Global"
 },
 "shadowSpread": 1,
 "id": "Container_062A782F_1140_E20B_41AF_B3E5DE341773",
 "left": "10%",
 "shadowColor": "#000000",
 "right": "10%",
 "backgroundOpacity": 1,
 "children": [
  "this.Container_062A682F_1140_E20B_41B0_3071FCBF3DC9",
  "this.Container_062A082F_1140_E20A_4193_DF1A4391DC79"
 ],
 "scrollBarWidth": 10,
 "paddingRight": 0,
 "borderRadius": 0,
 "shadowOpacity": 0.3,
 "paddingLeft": 0,
 "shadowHorizontalLength": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "5%",
 "bottom": "5%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "propagateClick": false,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "shadow": true,
 "contentOpaque": false,
 "paddingTop": 0,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "Container X global"
 },
 "children": [
  "this.IconButton_062A8830_1140_E215_419D_3439F16CCB3E"
 ],
 "id": "Container_062A9830_1140_E215_41A7_5F2BBE5C20E4",
 "left": "10%",
 "scrollBarWidth": 10,
 "right": "10%",
 "backgroundOpacity": 0,
 "paddingRight": 20,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "propagateClick": false,
 "bottom": "80%",
 "verticalAlign": "top",
 "top": "5%",
 "minWidth": 1,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 20,
 "shadow": false,
 "horizontalAlign": "right"
},
{
 "shadowBlurRadius": 25,
 "data": {
  "name": "Global"
 },
 "shadowSpread": 1,
 "id": "Container_23F7B7B7_0C0A_6293_4197_F931EEC6FA48",
 "left": "10%",
 "shadowColor": "#000000",
 "right": "10%",
 "backgroundOpacity": 1,
 "children": [
  "this.Container_23F797B7_0C0A_6293_41A7_EC89DBCDB93F",
  "this.Container_23F027B7_0C0A_6293_418E_075FCFAA8A19"
 ],
 "scrollBarWidth": 10,
 "paddingRight": 0,
 "borderRadius": 0,
 "shadowOpacity": 0.3,
 "paddingLeft": 0,
 "shadowHorizontalLength": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "5%",
 "bottom": "5%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "propagateClick": false,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "shadow": true,
 "contentOpaque": false,
 "paddingTop": 0,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "Container X global"
 },
 "children": [
  "this.IconButton_23F087B8_0C0A_629D_4194_6F34C6CBE1DA"
 ],
 "id": "Container_23F097B8_0C0A_629D_4176_D87C90BA32B6",
 "left": "10%",
 "scrollBarWidth": 10,
 "right": "10%",
 "backgroundOpacity": 0,
 "paddingRight": 20,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "propagateClick": false,
 "bottom": "80%",
 "verticalAlign": "top",
 "top": "5%",
 "minWidth": 1,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 20,
 "shadow": false,
 "horizontalAlign": "right"
},
{
 "shadowBlurRadius": 25,
 "data": {
  "name": "Global"
 },
 "shadowSpread": 1,
 "id": "Container_39A197B1_0C06_62AF_419A_D15E4DDD2528",
 "left": "15%",
 "shadowColor": "#000000",
 "right": "15%",
 "backgroundOpacity": 1,
 "children": [
  "this.Container_3A67552A_0C3A_67BD_4195_ECE46CCB34EA",
  "this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0"
 ],
 "scrollBarWidth": 10,
 "paddingRight": 0,
 "borderRadius": 0,
 "shadowOpacity": 0.3,
 "paddingLeft": 0,
 "shadowHorizontalLength": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "top": "7%",
 "bottom": "7%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "propagateClick": false,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "shadow": true,
 "contentOpaque": false,
 "paddingTop": 0,
 "horizontalAlign": "center"
},
{
 "shadowBlurRadius": 25,
 "data": {
  "name": "Global"
 },
 "shadowSpread": 1,
 "id": "Container_221C1648_0C06_E5FD_4180_8A2E8B66315E",
 "left": "10%",
 "shadowColor": "#000000",
 "right": "10%",
 "backgroundOpacity": 1,
 "children": [
  "this.Container_221C0648_0C06_E5FD_4193_12BCE1D6DD6B",
  "this.Container_221C9648_0C06_E5FD_41A1_A79DE53B3031"
 ],
 "scrollBarWidth": 10,
 "paddingRight": 0,
 "borderRadius": 0,
 "shadowOpacity": 0.3,
 "paddingLeft": 0,
 "shadowHorizontalLength": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "5%",
 "bottom": "5%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "propagateClick": false,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "shadow": true,
 "contentOpaque": false,
 "paddingTop": 0,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "Container X global"
 },
 "children": [
  "this.IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF"
 ],
 "id": "Container_221B3648_0C06_E5FD_4199_FCE031AE003B",
 "left": "10%",
 "scrollBarWidth": 10,
 "right": "10%",
 "backgroundOpacity": 0,
 "paddingRight": 20,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "propagateClick": false,
 "bottom": "80%",
 "verticalAlign": "top",
 "top": "5%",
 "minWidth": 1,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 20,
 "shadow": false,
 "horizontalAlign": "right"
},
{
 "shadowBlurRadius": 25,
 "data": {
  "name": "Global"
 },
 "shadowSpread": 1,
 "id": "Container_2F8A6686_0D4F_6B71_4174_A02FE43588D3",
 "left": "15%",
 "shadowColor": "#000000",
 "right": "15%",
 "backgroundOpacity": 1,
 "children": [
  "this.Container_2F8A7686_0D4F_6B71_41A9_1A894413085C",
  "this.MapViewer"
 ],
 "scrollBarWidth": 10,
 "paddingRight": 0,
 "borderRadius": 0,
 "shadowOpacity": 0.3,
 "paddingLeft": 0,
 "shadowHorizontalLength": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "top": "7%",
 "bottom": "7%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "propagateClick": false,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "shadow": true,
 "contentOpaque": false,
 "paddingTop": 0,
 "horizontalAlign": "center"
},
{
 "shadowBlurRadius": 25,
 "data": {
  "name": "Global"
 },
 "shadowSpread": 1,
 "id": "Container_28215A13_0D5D_5B97_4198_A7CA735E9E0A",
 "left": "15%",
 "shadowColor": "#000000",
 "right": "15%",
 "backgroundOpacity": 1,
 "children": [
  "this.Container_28214A13_0D5D_5B97_4193_B631E1496339",
  "this.Container_2B0BF61C_0D5B_2B90_4179_632488B1209E"
 ],
 "scrollBarWidth": 10,
 "paddingRight": 0,
 "borderRadius": 0,
 "shadowOpacity": 0.3,
 "paddingLeft": 0,
 "shadowHorizontalLength": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "top": "7%",
 "bottom": "7%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "propagateClick": false,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "shadow": true,
 "contentOpaque": false,
 "paddingTop": 0,
 "horizontalAlign": "center"
},
{
 "shadowBlurRadius": 25,
 "data": {
  "name": "Global"
 },
 "shadowSpread": 1,
 "id": "Container_2A193C4C_0D3B_DFF0_4161_A2CD128EF536",
 "left": "15%",
 "shadowColor": "#000000",
 "right": "15%",
 "backgroundOpacity": 1,
 "children": [
  "this.Container_2A19EC4C_0D3B_DFF0_414D_37145C22C5BC"
 ],
 "scrollBarWidth": 10,
 "paddingRight": 0,
 "borderRadius": 0,
 "shadowOpacity": 0.3,
 "paddingLeft": 0,
 "shadowHorizontalLength": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "top": "7%",
 "bottom": "7%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "propagateClick": false,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "shadow": true,
 "contentOpaque": false,
 "paddingTop": 0,
 "horizontalAlign": "center"
},
{
 "shadowBlurRadius": 25,
 "data": {
  "name": "Global"
 },
 "shadowSpread": 1,
 "id": "Container_06C5DBA5_1140_A63F_41AD_1D83A33F1255",
 "left": "10%",
 "shadowColor": "#000000",
 "right": "10%",
 "backgroundOpacity": 1,
 "children": [
  "this.Container_06C5ABA5_1140_A63F_41A9_850CF958D0DB",
  "this.Container_06C58BA5_1140_A63F_419D_EC83F94F8C54"
 ],
 "scrollBarWidth": 10,
 "paddingRight": 0,
 "borderRadius": 0,
 "shadowOpacity": 0.3,
 "paddingLeft": 0,
 "shadowHorizontalLength": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "top": "5%",
 "bottom": "5%",
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "propagateClick": false,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "shadow": true,
 "contentOpaque": false,
 "paddingTop": 0,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "Container X global"
 },
 "children": [
  "this.IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81"
 ],
 "id": "Container_06C43BA5_1140_A63F_41A1_96DC8F4CAD2F",
 "left": "10%",
 "scrollBarWidth": 10,
 "right": "10%",
 "backgroundOpacity": 0,
 "paddingRight": 20,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "propagateClick": false,
 "bottom": "80%",
 "verticalAlign": "top",
 "top": "5%",
 "minWidth": 1,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 20,
 "shadow": false,
 "horizontalAlign": "right"
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431A5C55_4D56_B045_41CC_44A4FFFAC766",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431B9C55_4D56_B045_41D1_3776D94B2107",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26E01DA0_2897_57D8_41B7_0AA18FBC41D3_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431DCC5F_4D56_B045_41A8_E08011CA8431",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431D2C5F_4D56_B045_41C1_30F1AD5C0B74",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4302AC5F_4D56_B045_41CB_0A6E46EDB333",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_1_HS_2_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43020C60_4D56_B07B_41C1_CCE4E5E17B9B",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_25476501_2891_74DB_4192_1CFE322BD079_1_HS_3_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431FBC5D_4D56_B045_41CE_7CBD699582E0",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431F1C5D_4D56_B045_41CE_B0478052482F",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26F527D7_2896_F367_41BC_804C6E646518_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 9,
 "rowCount": 3,
 "frameDuration": 62,
 "colCount": 3,
 "id": "AnimatedImageResource_43140C54_4D56_B05B_41B6_D87F44623CA0",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_1_HS_0_0.png",
   "width": 330,
   "class": "ImageResourceLevel",
   "height": 180
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43147C54_4D56_B05B_41CF_09F6F698C547",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26C0C1BE_2892_CF29_418D_B372BEF72EBD_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4303DC60_4D56_B07B_41C7_85CB2403C6FA",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26F24DAA_2896_D728_41BD_23AF15C91790_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431BFC56_4D56_B047_41CB_D38375F1602F",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431B5C56_4D56_B047_41D2_51D7A7F91F52",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_269F2632_2897_7539_41C0_B5C658969E9C_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431FCC5E_4D56_B047_41C8_AD61064A5A5B",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431F3C5E_4D56_B047_41BB_8822E1B2369D",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431CBC5E_4D56_B047_41BC_CFF969FDEE55",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26C3B2B0_2891_CD38_41C1_1A4582BAE07F_1_HS_2_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4316FC52_4D56_B05F_41C9_5846F2319AB5",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43163C53_4D56_B05D_41CF_B255B50FCB2B",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43167C53_4D56_B05D_419F_92E0B4D27854",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_252DB7F9_2893_D328_41C1_6DCAB2650BC5_1_HS_2_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43141C54_4D56_B05B_4189_41FED4FAD9E6",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26B15C10_2892_B4F9_41A0_B0A5B48B98FB_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4317DC53_4D56_B05D_41C0_24B4A8814E81",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43171C53_4D56_B05D_41BC_17DAA3C5A988",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_2525689D_2893_7DE8_41B1_4639C91B9ED2_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43108C4B_4D56_B04D_41BC_4B4DBB7FA279",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_1_HS_4_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4310FC4C_4D56_B04B_41BD_D159EC2B6456",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_4B8290DC_475B_C917_41D1_0520E111F4FE_1_HS_5_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4315BC55_4D56_B045_41D3_2D14E41062C0",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4315FC55_4D56_B045_41C4_82E4BC19B5AE",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43155C55_4D56_B045_41C9_B7D0D7E8F8E5",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26D20AC8_2896_BD69_41B6_03C7CAF019FC_1_HS_2_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4319DC57_4D56_B045_41C8_1E8D5C1EBB5C",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43193C57_4D56_B045_41C1_E606D8D1F790",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26D15EC9_2897_D568_41B8_31EF1FC59755_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43146C54_4D56_B05B_41B0_B8378EB679DC",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4315CC54_4D56_B05B_4169_4D00F7A2F328",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43149C54_4D56_B05B_4196_965000D9FEE5",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26B5A7F2_2892_D339_41B3_A3A4B9801EBF_1_HS_2_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43177C53_4D56_B05D_41C3_C6CC44E0C7DA",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4314AC53_4D56_B05D_41C7_6CE1BFB95A2E",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_257C6FEF_2893_5328_4172_E0D92D05E20E_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43027C60_4D56_B07B_41D1_6BC54EB105B3",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_2554576B_2896_B328_41BF_FD80CFF00F46_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431E9C57_4D56_B040_41BF_9C6D24B314C5",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431EFC5C_4D56_B04B_41D1_40B842050A63",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431E4C5D_4D56_B045_41D2_4E055B8FB861",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26B8DFDF_2896_D368_41B7_6A3AE2F6D2FB_1_HS_2_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43033C60_4D56_B07B_41D2_E753CBC11172",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4300CC61_4D56_B07D_41CF_1FF4A1C9AA15",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_269201DB_2896_CF6F_41A7_14503FADDAA8_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4318BC56_4D56_B047_41B2_348F4A5DCB1C",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43180C56_4D56_B047_41C6_35351B0F132A",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43185C56_4D56_B047_41C9_F4789CEF270B",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26FDD753_2897_5378_41B7_9619EA432C06_1_HS_2_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431F7C5D_4D56_B045_41D0_F281FA1BB2DD",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431C0C5E_4D56_B047_41BB_D6084E85E88C",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26E6F11B_2891_4CE8_419C_2B7B86B9AEC1_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_4311FC52_4D56_B05F_41CD_5EC42EAD7D31",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43113C52_4D56_B05F_41BC_A107259D06D3",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_43168C52_4D56_B05F_41CE_875D2EFC9176",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26A5DC19_2893_F4E8_41B6_9E4EEA82799E_1_HS_2_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431C2C5F_4D56_B045_41CC_B8DDEEC5D6E2",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431C6C5F_4D56_B045_41D0_852671FDE2C4",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26F070A7_2891_4D27_41A0_91B0E9C8CE98_1_HS_1_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "frameCount": 24,
 "rowCount": 6,
 "frameDuration": 41,
 "colCount": 4,
 "id": "AnimatedImageResource_431AEC55_4D56_B045_41A8_649F743D4AB8",
 "class": "AnimatedImageResource",
 "levels": [
  {
   "url": "media/panorama_26FD8F91_2893_D3FB_41BE_9DEE269BB555_1_HS_0_0.png",
   "width": 400,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ]
},
{
 "maxWidth": 60,
 "id": "IconButton_EF8F8BD8_E386_8E02_41D6_310FF1964329",
 "maxHeight": 60,
 "width": 60,
 "backgroundOpacity": 0,
 "transparencyActive": true,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "pressedIconURL": "skin/IconButton_EF8F8BD8_E386_8E02_41D6_310FF1964329_pressed.png",
 "minHeight": 1,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 60,
 "iconURL": "skin/IconButton_EF8F8BD8_E386_8E02_41D6_310FF1964329.png",
 "mode": "toggle",
 "minWidth": 1,
 "borderSize": 0,
 "click": "if(!this.Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE.get('visible')){ this.setComponentVisibility(this.Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE, true, 0, null, null, false) } else { this.setComponentVisibility(this.Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE, false, 0, null, null, false) }",
 "class": "IconButton",
 "data": {
  "name": "image button menu"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "maxWidth": 58,
 "id": "IconButton_EE5807F6_E3BE_860E_41E7_431DDDA54BAC",
 "maxHeight": 58,
 "width": 58,
 "backgroundOpacity": 0,
 "transparencyActive": true,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "rollOverIconURL": "skin/IconButton_EE5807F6_E3BE_860E_41E7_431DDDA54BAC_rollover.png",
 "minHeight": 1,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 58,
 "iconURL": "skin/IconButton_EE5807F6_E3BE_860E_41E7_431DDDA54BAC.png",
 "mode": "push",
 "minWidth": 1,
 "borderSize": 0,
 "click": "this.shareTwitter(window.location.href)",
 "class": "IconButton",
 "data": {
  "name": "IconButton TWITTER"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "maxWidth": 58,
 "id": "IconButton_EED5213F_E3B9_7A7D_41D8_1B642C004521",
 "maxHeight": 58,
 "width": 58,
 "backgroundOpacity": 0,
 "transparencyActive": true,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "rollOverIconURL": "skin/IconButton_EED5213F_E3B9_7A7D_41D8_1B642C004521_rollover.png",
 "minHeight": 1,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 58,
 "iconURL": "skin/IconButton_EED5213F_E3B9_7A7D_41D8_1B642C004521.png",
 "mode": "push",
 "minWidth": 1,
 "borderSize": 0,
 "click": "this.shareFacebook(window.location.href)",
 "class": "IconButton",
 "data": {
  "name": "IconButton FB"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "shadowBlurRadius": 15,
 "data": {
  "name": "Button house info"
 },
 "shadowSpread": 1,
 "id": "Button_1B998D00_16C4_0505_41AD_67CAA4AAEFE0",
 "rollOverBackgroundOpacity": 0.8,
 "width": 120,
 "iconBeforeLabel": true,
 "fontFamily": "Montserrat",
 "backgroundOpacity": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "shadowColor": "#000000",
 "paddingRight": 0,
 "borderRadius": 0,
 "fontWeight": "bold",
 "paddingLeft": 0,
 "iconHeight": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 40,
 "borderColor": "#000000",
 "pressedBackgroundOpacity": 1,
 "mode": "push",
 "backgroundColor": [
  "#000000"
 ],
 "minWidth": 1,
 "borderSize": 0,
 "label": "HOUSE INFO",
 "rollOverBackgroundColorRatios": [
  0.01
 ],
 "class": "Button",
 "backgroundColorRatios": [
  0
 ],
 "layout": "horizontal",
 "iconWidth": 0,
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, true, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "rollOverShadow": false,
 "fontColor": "#FFFFFF",
 "fontStyle": "normal",
 "fontSize": 12,
 "textDecoration": "none",
 "gap": 5,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "shadowBlurRadius": 15,
 "data": {
  "name": "Button panorama list"
 },
 "shadowSpread": 1,
 "id": "Button_1B999D00_16C4_0505_41AB_D0C2E7857448",
 "rollOverBackgroundOpacity": 0.8,
 "width": 130,
 "iconBeforeLabel": true,
 "fontFamily": "Montserrat",
 "backgroundOpacity": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "shadowColor": "#000000",
 "paddingRight": 0,
 "borderRadius": 0,
 "fontWeight": "bold",
 "paddingLeft": 0,
 "iconHeight": 32,
 "minHeight": 1,
 "paddingBottom": 0,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 40,
 "borderColor": "#000000",
 "pressedBackgroundOpacity": 1,
 "mode": "push",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "minWidth": 1,
 "borderSize": 0,
 "label": "PANORAMA LIST",
 "rollOverBackgroundColorRatios": [
  0
 ],
 "class": "Button",
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "iconWidth": 32,
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15, true, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 5,
 "fontColor": "#FFFFFF",
 "fontStyle": "normal",
 "fontSize": 12,
 "textDecoration": "none",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "shadowBlurRadius": 15,
 "data": {
  "name": "Button location"
 },
 "shadowSpread": 1,
 "id": "Button_1B9A6D00_16C4_0505_4197_F2108627CC98",
 "rollOverBackgroundOpacity": 0.8,
 "width": 90,
 "iconBeforeLabel": true,
 "fontFamily": "Montserrat",
 "backgroundOpacity": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "shadowColor": "#000000",
 "paddingRight": 0,
 "borderRadius": 0,
 "fontWeight": "bold",
 "paddingLeft": 0,
 "iconHeight": 32,
 "minHeight": 1,
 "paddingBottom": 0,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 40,
 "borderColor": "#000000",
 "pressedBackgroundOpacity": 1,
 "mode": "push",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "minWidth": 1,
 "borderSize": 0,
 "label": "LOCATION",
 "rollOverBackgroundColorRatios": [
  0
 ],
 "class": "Button",
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "iconWidth": 32,
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7, true, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 5,
 "fontColor": "#FFFFFF",
 "fontStyle": "normal",
 "fontSize": 12,
 "textDecoration": "none",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "shadowBlurRadius": 15,
 "data": {
  "name": "Button floorplan"
 },
 "shadowSpread": 1,
 "id": "Button_1B9A4D00_16C4_0505_4193_E0EA69B0CBB0",
 "rollOverBackgroundOpacity": 0.8,
 "width": 103,
 "iconBeforeLabel": true,
 "fontFamily": "Montserrat",
 "backgroundOpacity": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "shadowColor": "#000000",
 "paddingRight": 0,
 "borderRadius": 0,
 "fontWeight": "bold",
 "paddingLeft": 0,
 "iconHeight": 32,
 "minHeight": 1,
 "paddingBottom": 0,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 40,
 "borderColor": "#000000",
 "pressedBackgroundOpacity": 1,
 "mode": "push",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "minWidth": 1,
 "borderSize": 0,
 "label": "FLOORPLAN",
 "rollOverBackgroundColorRatios": [
  0
 ],
 "class": "Button",
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "iconWidth": 32,
 "click": "this.setComponentVisibility(this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41, true, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 5,
 "fontColor": "#FFFFFF",
 "fontStyle": "normal",
 "fontSize": 12,
 "textDecoration": "none",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "shadowBlurRadius": 15,
 "data": {
  "name": "Button photoalbum"
 },
 "shadowSpread": 1,
 "id": "Button_1B9A5D00_16C4_0505_41B0_D18F25F377C4",
 "rollOverBackgroundOpacity": 0.8,
 "width": 112,
 "iconBeforeLabel": true,
 "fontFamily": "Montserrat",
 "backgroundOpacity": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "shadowColor": "#000000",
 "paddingRight": 0,
 "borderRadius": 0,
 "fontWeight": "bold",
 "paddingLeft": 0,
 "iconHeight": 32,
 "minHeight": 1,
 "paddingBottom": 0,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 40,
 "borderColor": "#000000",
 "pressedBackgroundOpacity": 1,
 "mode": "push",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "minWidth": 1,
 "borderSize": 0,
 "label": "PHOTOALBUM",
 "rollOverBackgroundColorRatios": [
  0
 ],
 "class": "Button",
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "iconWidth": 32,
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E, true, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 5,
 "fontColor": "#FFFFFF",
 "fontStyle": "normal",
 "fontSize": 12,
 "textDecoration": "none",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "shadowBlurRadius": 15,
 "data": {
  "name": "Button realtor"
 },
 "shadowSpread": 1,
 "id": "Button_1B9A3D00_16C4_0505_41B2_6830155B7D52",
 "rollOverBackgroundOpacity": 0.8,
 "width": 90,
 "iconBeforeLabel": true,
 "fontFamily": "Montserrat",
 "backgroundOpacity": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "shadowColor": "#000000",
 "paddingRight": 0,
 "borderRadius": 0,
 "fontWeight": "bold",
 "paddingLeft": 0,
 "iconHeight": 32,
 "minHeight": 1,
 "paddingBottom": 0,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "rollOverBackgroundColor": [
  "#04A3E1"
 ],
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 40,
 "borderColor": "#000000",
 "pressedBackgroundOpacity": 1,
 "mode": "push",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "minWidth": 1,
 "borderSize": 0,
 "label": "REALTOR",
 "rollOverBackgroundColorRatios": [
  0
 ],
 "class": "Button",
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "iconWidth": 32,
 "click": "this.setComponentVisibility(this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC, true, 0, null, null, false)",
 "backgroundColorDirection": "vertical",
 "gap": 5,
 "fontColor": "#FFFFFF",
 "fontStyle": "normal",
 "fontSize": 12,
 "textDecoration": "none",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "data": {
  "name": "-left"
 },
 "children": [
  "this.Image_062A182F_1140_E20B_41B0_9CB8FFD6AA5A"
 ],
 "id": "Container_062A682F_1140_E20B_41B0_3071FCBF3DC9",
 "scrollBarWidth": 10,
 "backgroundOpacity": 1,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "85%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "center"
},
{
 "data": {
  "name": "-right"
 },
 "children": [
  "this.Container_062A3830_1140_E215_4195_1698933FE51C",
  "this.Container_062A2830_1140_E215_41AA_EB25B7BD381C",
  "this.Container_062AE830_1140_E215_4180_196ED689F4BD"
 ],
 "id": "Container_062A082F_1140_E20A_4193_DF1A4391DC79",
 "scrollBarWidth": 10,
 "backgroundOpacity": 1,
 "paddingRight": 50,
 "borderRadius": 0,
 "paddingLeft": 50,
 "width": "50%",
 "minHeight": 1,
 "paddingBottom": 20,
 "overflow": "visible",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "minWidth": 460,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#0069A3",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 0,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.51,
 "contentOpaque": false,
 "paddingTop": 20,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "maxWidth": 60,
 "id": "IconButton_062A8830_1140_E215_419D_3439F16CCB3E",
 "maxHeight": 60,
 "backgroundOpacity": 0,
 "transparencyActive": false,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "25%",
 "pressedIconURL": "skin/IconButton_062A8830_1140_E215_419D_3439F16CCB3E_pressed.jpg",
 "minHeight": 50,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": "75%",
 "iconURL": "skin/IconButton_062A8830_1140_E215_419D_3439F16CCB3E.jpg",
 "rollOverIconURL": "skin/IconButton_062A8830_1140_E215_419D_3439F16CCB3E_rollover.jpg",
 "mode": "push",
 "minWidth": 50,
 "borderSize": 0,
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, false, 0, null, null, false)",
 "class": "IconButton",
 "data": {
  "name": "X"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "data": {
  "name": "-left"
 },
 "children": [
  "this.ViewerAreaLabeled_23F787B7_0C0A_6293_419A_B4B58B92DAFC",
  "this.Container_23F7F7B7_0C0A_6293_4195_D6240EBAFDC0"
 ],
 "id": "Container_23F797B7_0C0A_6293_41A7_EC89DBCDB93F",
 "scrollBarWidth": 10,
 "backgroundOpacity": 1,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "85%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "center"
},
{
 "data": {
  "name": "-right"
 },
 "children": [
  "this.Container_23F017B8_0C0A_629D_41A5_DE420F5F9331",
  "this.Container_23F007B8_0C0A_629D_41A3_034CF0D91203",
  "this.Container_23F047B8_0C0A_629D_415D_F05EF8619564"
 ],
 "id": "Container_23F027B7_0C0A_6293_418E_075FCFAA8A19",
 "scrollBarWidth": 10,
 "backgroundOpacity": 1,
 "paddingRight": 50,
 "borderRadius": 0,
 "paddingLeft": 50,
 "width": "50%",
 "minHeight": 1,
 "paddingBottom": 20,
 "overflow": "visible",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "minWidth": 460,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#0069A3",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 0,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.51,
 "contentOpaque": false,
 "paddingTop": 20,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "maxWidth": 60,
 "id": "IconButton_23F087B8_0C0A_629D_4194_6F34C6CBE1DA",
 "maxHeight": 60,
 "backgroundOpacity": 0,
 "transparencyActive": false,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "25%",
 "pressedIconURL": "skin/IconButton_23F087B8_0C0A_629D_4194_6F34C6CBE1DA_pressed.jpg",
 "minHeight": 50,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": "75%",
 "iconURL": "skin/IconButton_23F087B8_0C0A_629D_4194_6F34C6CBE1DA.jpg",
 "rollOverIconURL": "skin/IconButton_23F087B8_0C0A_629D_4194_6F34C6CBE1DA_rollover.jpg",
 "mode": "push",
 "minWidth": 50,
 "borderSize": 0,
 "click": "this.setComponentVisibility(this.Container_23F0F7B8_0C0A_629D_418A_F171085EFBF8, false, 0, null, null, false)",
 "class": "IconButton",
 "data": {
  "name": "X"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "data": {
  "name": "header"
 },
 "children": [
  "this.HTMLText_3918BF37_0C06_E393_41A1_17CF0ADBAB12",
  "this.IconButton_38922473_0C06_2593_4199_C585853A1AB3"
 ],
 "id": "Container_3A67552A_0C3A_67BD_4195_ECE46CCB34EA",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "height": 140,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "rollOverItemThumbnailShadow": true,
 "itemMinWidth": 50,
 "itemLabelFontSize": 14,
 "id": "ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0",
 "itemThumbnailScaleMode": "fit_outside",
 "scrollBarWidth": 10,
 "itemLabelGap": 7,
 "selectedItemLabelFontWeight": "bold",
 "width": "100%",
 "borderRadius": 5,
 "paddingLeft": 70,
 "rollOverItemThumbnailShadowBlurRadius": 0,
 "minHeight": 1,
 "paddingBottom": 70,
 "itemLabelFontColor": "#666666",
 "playList": "this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist",
 "verticalAlign": "middle",
 "backgroundColor": [
  "#000000"
 ],
 "itemOpacity": 1,
 "itemBackgroundColorDirection": "vertical",
 "selectedItemLabelFontColor": "#04A3E1",
 "backgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "borderSize": 0,
 "class": "ThumbnailGrid",
 "height": "100%",
 "scrollBarColor": "#04A3E1",
 "scrollBarVisible": "rollOver",
 "itemMode": "normal",
 "itemLabelFontStyle": "normal",
 "scrollBarOpacity": 0.5,
 "itemThumbnailHeight": 125,
 "itemLabelHorizontalAlign": "center",
 "gap": 26,
 "itemMaxWidth": 1000,
 "itemPaddingBottom": 3,
 "rollOverItemThumbnailShadowColor": "#04A3E1",
 "itemMaxHeight": 1000,
 "itemLabelFontFamily": "Montserrat",
 "itemThumbnailWidth": 220,
 "itemBorderRadius": 0,
 "paddingTop": 10,
 "shadow": false,
 "itemHorizontalAlign": "center",
 "selectedItemThumbnailShadowBlurRadius": 16,
 "rollOverItemLabelFontColor": "#04A3E1",
 "rollOverItemThumbnailShadowHorizontalLength": 8,
 "itemLabelPosition": "bottom",
 "itemPaddingLeft": 3,
 "selectedItemThumbnailShadow": true,
 "itemThumbnailShadow": false,
 "rollOverItemThumbnailShadowVerticalLength": 0,
 "backgroundOpacity": 0.05,
 "itemBackgroundOpacity": 0,
 "itemThumbnailBorderRadius": 0,
 "selectedItemThumbnailShadowHorizontalLength": 0,
 "paddingRight": 70,
 "itemWidth": 220,
 "propagateClick": false,
 "itemBackgroundColor": [],
 "itemPaddingTop": 3,
 "itemBackgroundColorRatios": [],
 "selectedItemThumbnailShadowVerticalLength": 0,
 "itemThumbnailOpacity": 1,
 "itemMinHeight": 50,
 "backgroundColorDirection": "vertical",
 "itemPaddingRight": 3,
 "itemLabelTextDecoration": "none",
 "itemLabelFontWeight": "normal",
 "scrollBarMargin": 2,
 "horizontalAlign": "center",
 "itemHeight": 156,
 "itemVerticalAlign": "top",
 "data": {
  "name": "ThumbnailList"
 }
},
{
 "data": {
  "name": "-left"
 },
 "children": [
  "this.WebFrame_22F9EEFF_0C1A_2293_4165_411D4444EFEA"
 ],
 "id": "Container_221C0648_0C06_E5FD_4193_12BCE1D6DD6B",
 "scrollBarWidth": 10,
 "backgroundOpacity": 1,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "85%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "center"
},
{
 "data": {
  "name": "-right"
 },
 "children": [
  "this.Container_221C8648_0C06_E5FD_41A0_8247B2B7DEB0",
  "this.Container_221B7648_0C06_E5FD_418B_12E57BBFD8EC",
  "this.Container_221B4648_0C06_E5FD_4194_30EDC4E7D1B6"
 ],
 "id": "Container_221C9648_0C06_E5FD_41A1_A79DE53B3031",
 "scrollBarWidth": 10,
 "backgroundOpacity": 1,
 "paddingRight": 50,
 "borderRadius": 0,
 "paddingLeft": 50,
 "width": "15%",
 "minHeight": 1,
 "paddingBottom": 20,
 "overflow": "visible",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "minWidth": 400,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#0069A3",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 0,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.51,
 "contentOpaque": false,
 "paddingTop": 20,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "maxWidth": 60,
 "id": "IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF",
 "maxHeight": 60,
 "backgroundOpacity": 0,
 "transparencyActive": false,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "25%",
 "pressedIconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF_pressed.jpg",
 "minHeight": 50,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": "75%",
 "iconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF.jpg",
 "rollOverIconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF_rollover.jpg",
 "mode": "push",
 "minWidth": 50,
 "borderSize": 0,
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7, false, 0, null, null, false)",
 "class": "IconButton",
 "data": {
  "name": "X"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "data": {
  "name": "header"
 },
 "children": [
  "this.HTMLText_2F8A4686_0D4F_6B71_4183_10C1696E2923",
  "this.IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E"
 ],
 "id": "Container_2F8A7686_0D4F_6B71_41A9_1A894413085C",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "height": 140,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "progressBorderSize": 0,
 "id": "MapViewer",
 "toolTipPaddingRight": 6,
 "playbackBarBorderColor": "#FFFFFF",
 "toolTipBorderSize": 1,
 "progressBorderRadius": 0,
 "toolTipPaddingTop": 4,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "transitionMode": "blending",
 "toolTipPaddingLeft": 6,
 "width": "100%",
 "borderRadius": 0,
 "toolTipDisplayTime": 600,
 "paddingLeft": 0,
 "playbackBarLeft": 0,
 "progressBackgroundColorRatios": [
  0.01
 ],
 "minHeight": 1,
 "paddingBottom": 0,
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "toolTipBorderRadius": 3,
 "playbackBarHeadShadowVerticalLength": 0,
 "displayTooltipInTouchScreens": true,
 "progressBarBorderColor": "#0066FF",
 "progressBackgroundColorDirection": "vertical",
 "progressBorderColor": "#FFFFFF",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "borderSize": 0,
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "class": "ViewerArea",
 "playbackBarBottom": 0,
 "toolTipShadowSpread": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "height": "100%",
 "toolTipOpacity": 1,
 "playbackBarHeight": 10,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 6,
 "toolTipShadowBlurRadius": 3,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipTextShadowColor": "#000000",
 "playbackBarRight": 0,
 "toolTipFontSize": 12,
 "toolTipTextShadowBlurRadius": 3,
 "toolTipFontWeight": "normal",
 "playbackBarProgressBorderSize": 0,
 "shadow": false,
 "toolTipPaddingBottom": 4,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderRadius": 0,
 "progressBarBorderSize": 6,
 "toolTipShadowColor": "#333333",
 "paddingTop": 0,
 "playbackBarBorderRadius": 0,
 "playbackBarHeadBorderRadius": 0,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipShadowOpacity": 1,
 "paddingRight": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "transitionDuration": 500,
 "propagateClick": false,
 "toolTipTextShadowOpacity": 0,
 "playbackBarBorderSize": 0,
 "toolTipFontFamily": "Arial",
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "vrPointerSelectionTime": 2000,
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "toolTipShadowHorizontalLength": 0,
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipShadowVerticalLength": 0,
 "playbackBarHeadShadow": true,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontColor": "#606060",
 "progressHeight": 6,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "data": {
  "name": "Floor Plan"
 },
 "vrPointerColor": "#FFFFFF",
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7
},
{
 "data": {
  "name": "header"
 },
 "children": [
  "this.HTMLText_28217A13_0D5D_5B97_419A_F894ECABEB04",
  "this.IconButton_28216A13_0D5D_5B97_41A9_2CAB10DB6CA3"
 ],
 "id": "Container_28214A13_0D5D_5B97_4193_B631E1496339",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "height": 140,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "Container photo"
 },
 "children": [
  "this.ViewerAreaLabeled_281D2361_0D5F_E9B0_41A1_A1F237F85FD7",
  "this.IconButton_2BE71718_0D55_6990_41A5_73D31D902E1D",
  "this.IconButton_28BF3E40_0D4B_DBF0_41A3_D5D2941E6E14"
 ],
 "id": "Container_2B0BF61C_0D5B_2B90_4179_632488B1209E",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "Container photo"
 },
 "children": [
  "this.ViewerAreaLabeled_2A198C4C_0D3B_DFF0_419F_C9A785406D9C",
  "this.IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482",
  "this.IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510",
  "this.IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1"
 ],
 "id": "Container_2A19EC4C_0D3B_DFF0_414D_37145C22C5BC",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "visible",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "-left"
 },
 "children": [
  "this.Image_06C5BBA5_1140_A63F_41A7_E6D01D4CC397"
 ],
 "id": "Container_06C5ABA5_1140_A63F_41A9_850CF958D0DB",
 "scrollBarWidth": 10,
 "backgroundOpacity": 1,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "55%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "center"
},
{
 "data": {
  "name": "-right"
 },
 "children": [
  "this.Container_06C59BA5_1140_A63F_41B1_4B41E3B7D98D",
  "this.Container_06C46BA5_1140_A63F_4151_B5A20B4EA86A",
  "this.Container_06C42BA5_1140_A63F_4195_037A0687532F"
 ],
 "id": "Container_06C58BA5_1140_A63F_419D_EC83F94F8C54",
 "scrollBarWidth": 10,
 "backgroundOpacity": 1,
 "paddingRight": 60,
 "borderRadius": 0,
 "paddingLeft": 60,
 "width": "45%",
 "minHeight": 1,
 "paddingBottom": 20,
 "overflow": "visible",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "minWidth": 460,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#0069A3",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 0,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.51,
 "contentOpaque": false,
 "paddingTop": 20,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "maxWidth": 60,
 "id": "IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81",
 "maxHeight": 60,
 "backgroundOpacity": 0,
 "transparencyActive": false,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "25%",
 "pressedIconURL": "skin/IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81_pressed.jpg",
 "minHeight": 50,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": "75%",
 "iconURL": "skin/IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81.jpg",
 "rollOverIconURL": "skin/IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81_rollover.jpg",
 "mode": "push",
 "minWidth": 50,
 "borderSize": 0,
 "click": "this.setComponentVisibility(this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC, false, 0, null, null, false)",
 "class": "IconButton",
 "data": {
  "name": "X"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "maxWidth": 2000,
 "id": "Image_062A182F_1140_E20B_41B0_9CB8FFD6AA5A",
 "left": "0%",
 "maxHeight": 1000,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 0,
 "url": "skin/Image_062A182F_1140_E20B_41B0_9CB8FFD6AA5A.jpg",
 "propagateClick": false,
 "verticalAlign": "middle",
 "top": "0%",
 "height": "100%",
 "minWidth": 1,
 "borderSize": 0,
 "class": "Image",
 "data": {
  "name": "Image"
 },
 "scaleMode": "fit_outside",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "shadow": false
},
{
 "data": {
  "name": "Container space"
 },
 "id": "Container_062A3830_1140_E215_4195_1698933FE51C",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 0,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "height": 60,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 0,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 20,
 "shadow": false,
 "horizontalAlign": "right"
},
{
 "data": {
  "name": "Container text"
 },
 "children": [
  "this.HTMLText_062AD830_1140_E215_41B0_321699661E7F",
  "this.Button_062AF830_1140_E215_418D_D2FC11B12C47"
 ],
 "id": "Container_062A2830_1140_E215_41AA_EB25B7BD381C",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 520,
 "paddingBottom": 30,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "minWidth": 100,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#E73B2C",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.79,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "Container space"
 },
 "id": "Container_062AE830_1140_E215_4180_196ED689F4BD",
 "width": 370,
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "height": 40,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "progressBorderSize": 0,
 "id": "ViewerAreaLabeled_23F787B7_0C0A_6293_419A_B4B58B92DAFC",
 "left": 0,
 "toolTipPaddingRight": 6,
 "playbackBarBorderColor": "#FFFFFF",
 "toolTipBorderSize": 1,
 "progressBorderRadius": 0,
 "right": 0,
 "toolTipPaddingTop": 4,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "transitionMode": "blending",
 "toolTipPaddingLeft": 6,
 "borderRadius": 0,
 "toolTipDisplayTime": 600,
 "paddingLeft": 0,
 "playbackBarLeft": 0,
 "progressBackgroundColorRatios": [
  0.01
 ],
 "minHeight": 1,
 "paddingBottom": 0,
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "toolTipBorderRadius": 3,
 "progressBackgroundColorDirection": "vertical",
 "playbackBarHeadShadowVerticalLength": 0,
 "displayTooltipInTouchScreens": true,
 "progressBarBorderColor": "#0066FF",
 "playbackBarHeadHeight": 15,
 "progressBorderColor": "#FFFFFF",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "borderSize": 0,
 "toolTipBorderColor": "#767676",
 "class": "ViewerArea",
 "playbackBarBottom": 0,
 "toolTipShadowSpread": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipOpacity": 1,
 "playbackBarHeight": 10,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 6,
 "toolTipShadowBlurRadius": 3,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipTextShadowColor": "#000000",
 "playbackBarRight": 0,
 "toolTipFontSize": 12,
 "toolTipTextShadowBlurRadius": 3,
 "toolTipFontWeight": "normal",
 "playbackBarProgressBorderSize": 0,
 "shadow": false,
 "toolTipPaddingBottom": 4,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderRadius": 0,
 "progressBarBorderSize": 6,
 "toolTipShadowColor": "#333333",
 "paddingTop": 0,
 "playbackBarBorderRadius": 0,
 "playbackBarHeadBorderRadius": 0,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipShadowOpacity": 1,
 "paddingRight": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "transitionDuration": 500,
 "top": 0,
 "toolTipTextShadowOpacity": 0,
 "playbackBarBorderSize": 0,
 "bottom": 0,
 "toolTipFontFamily": "Arial",
 "propagateClick": false,
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "vrPointerSelectionColor": "#FF6600",
 "vrPointerSelectionTime": 2000,
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "toolTipShadowHorizontalLength": 0,
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipShadowVerticalLength": 0,
 "playbackBarHeadShadow": true,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontColor": "#606060",
 "progressHeight": 6,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "data": {
  "name": "Viewer info 1"
 },
 "vrPointerColor": "#FFFFFF",
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7
},
{
 "data": {
  "name": "Container arrows"
 },
 "children": [
  "this.IconButton_23F7E7B7_0C0A_6293_419F_D3D84EB3AFBD",
  "this.Container_23F7D7B7_0C0A_6293_4195_312C9CAEABE4",
  "this.IconButton_23F037B7_0C0A_6293_41A2_C1707EE666E4"
 ],
 "id": "Container_23F7F7B7_0C0A_6293_4195_D6240EBAFDC0",
 "left": "0%",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "middle",
 "top": "0%",
 "height": "100%",
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "Container space"
 },
 "id": "Container_23F017B8_0C0A_629D_41A5_DE420F5F9331",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 0,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "height": 60,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 0,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 20,
 "shadow": false,
 "horizontalAlign": "right"
},
{
 "data": {
  "name": "Container text"
 },
 "children": [
  "this.HTMLText_23F067B8_0C0A_629D_41A9_1A1C797BB055",
  "this.Button_23F057B8_0C0A_629D_41A2_CD6BDCDB0145"
 ],
 "id": "Container_23F007B8_0C0A_629D_41A3_034CF0D91203",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 520,
 "paddingBottom": 30,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "minWidth": 100,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#E73B2C",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.79,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "Container space"
 },
 "id": "Container_23F047B8_0C0A_629D_415D_F05EF8619564",
 "width": 370,
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "height": 40,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "HTMLText54192"
 },
 "id": "HTMLText_3918BF37_0C06_E393_41A1_17CF0ADBAB12",
 "left": "0%",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 80,
 "width": "77.115%",
 "minHeight": 100,
 "paddingBottom": 0,
 "propagateClick": false,
 "top": "0%",
 "height": "100%",
 "minWidth": 1,
 "borderSize": 0,
 "class": "HTMLText",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:4.96vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:4.96vh;font-family:'Bebas Neue Bold';\">Panorama list:</SPAN></SPAN></DIV></div>",
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "paddingTop": 0,
 "shadow": false
},
{
 "maxWidth": 60,
 "id": "IconButton_38922473_0C06_2593_4199_C585853A1AB3",
 "maxHeight": 60,
 "right": 20,
 "backgroundOpacity": 0,
 "transparencyActive": false,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "rollOverIconURL": "skin/IconButton_38922473_0C06_2593_4199_C585853A1AB3_rollover.jpg",
 "minHeight": 50,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "top",
 "top": 20,
 "iconURL": "skin/IconButton_38922473_0C06_2593_4199_C585853A1AB3.jpg",
 "pressedIconURL": "skin/IconButton_38922473_0C06_2593_4199_C585853A1AB3_pressed.jpg",
 "mode": "push",
 "height": "36.14%",
 "minWidth": 50,
 "borderSize": 0,
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15, false, 0, null, null, false)",
 "class": "IconButton",
 "data": {
  "name": "IconButton X"
 },
 "horizontalAlign": "right",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "id": "WebFrame_22F9EEFF_0C1A_2293_4165_411D4444EFEA",
 "left": "0%",
 "insetBorder": false,
 "right": "0%",
 "backgroundOpacity": 1,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14377.55330038866!2d-73.99492968084243!3d40.75084469078082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9f775f259%3A0x999668d0d7c3fd7d!2s400+5th+Ave%2C+New+York%2C+NY+10018!5e0!3m2!1ses!2sus!4v1467271743182\" width=\"600\" height=\"450\" frameborder=\"0\" style=\"border:0\" allowfullscreen>",
 "top": "0%",
 "bottom": "0%",
 "backgroundColorRatios": [
  0
 ],
 "backgroundColor": [
  "#FFFFFF"
 ],
 "propagateClick": false,
 "minWidth": 1,
 "borderSize": 0,
 "class": "WebFrame",
 "backgroundColorDirection": "vertical",
 "data": {
  "name": "WebFrame48191"
 },
 "scrollEnabled": true,
 "paddingTop": 0,
 "shadow": false
},
{
 "data": {
  "name": "Container space"
 },
 "id": "Container_221C8648_0C06_E5FD_41A0_8247B2B7DEB0",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 0,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "height": 60,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 0,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 20,
 "shadow": false,
 "horizontalAlign": "right"
},
{
 "data": {
  "name": "Container text"
 },
 "children": [
  "this.HTMLText_221B6648_0C06_E5FD_41A0_77851DC2C548",
  "this.Button_221B5648_0C06_E5FD_4198_40C786948FF0"
 ],
 "id": "Container_221B7648_0C06_E5FD_418B_12E57BBFD8EC",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 520,
 "paddingBottom": 30,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "minWidth": 100,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#E73B2C",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.79,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "Container space"
 },
 "id": "Container_221B4648_0C06_E5FD_4194_30EDC4E7D1B6",
 "width": 370,
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "height": 40,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "HTMLText54192"
 },
 "id": "HTMLText_2F8A4686_0D4F_6B71_4183_10C1696E2923",
 "left": "0%",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 80,
 "width": "77.115%",
 "minHeight": 100,
 "paddingBottom": 0,
 "propagateClick": false,
 "top": "0%",
 "height": "100%",
 "minWidth": 1,
 "borderSize": 0,
 "class": "HTMLText",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:4.96vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:4.96vh;font-family:'Bebas Neue Bold';\">FLOORPLAN:</SPAN></SPAN></DIV></div>",
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "paddingTop": 0,
 "shadow": false
},
{
 "maxWidth": 60,
 "id": "IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E",
 "maxHeight": 60,
 "right": 20,
 "backgroundOpacity": 0,
 "transparencyActive": false,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "rollOverIconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E_rollover.jpg",
 "minHeight": 50,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "top",
 "top": 20,
 "iconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E.jpg",
 "pressedIconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E_pressed.jpg",
 "mode": "push",
 "height": "36.14%",
 "minWidth": 50,
 "borderSize": 0,
 "click": "this.setComponentVisibility(this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41, false, 0, null, null, false)",
 "class": "IconButton",
 "data": {
  "name": "IconButton X"
 },
 "horizontalAlign": "right",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "data": {
  "name": "HTMLText54192"
 },
 "id": "HTMLText_28217A13_0D5D_5B97_419A_F894ECABEB04",
 "left": "0%",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 80,
 "width": "77.115%",
 "minHeight": 100,
 "paddingBottom": 0,
 "propagateClick": false,
 "top": "0%",
 "height": "100%",
 "minWidth": 1,
 "borderSize": 0,
 "class": "HTMLText",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:4.96vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:4.96vh;font-family:'Bebas Neue Bold';\">PHOTOALBUM:</SPAN></SPAN></DIV></div>",
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "paddingTop": 0,
 "shadow": false
},
{
 "maxWidth": 60,
 "id": "IconButton_28216A13_0D5D_5B97_41A9_2CAB10DB6CA3",
 "maxHeight": 60,
 "right": 20,
 "backgroundOpacity": 0,
 "transparencyActive": false,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "rollOverIconURL": "skin/IconButton_28216A13_0D5D_5B97_41A9_2CAB10DB6CA3_rollover.jpg",
 "minHeight": 50,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "top",
 "top": 20,
 "iconURL": "skin/IconButton_28216A13_0D5D_5B97_41A9_2CAB10DB6CA3.jpg",
 "pressedIconURL": "skin/IconButton_28216A13_0D5D_5B97_41A9_2CAB10DB6CA3_pressed.jpg",
 "mode": "push",
 "height": "36.14%",
 "minWidth": 50,
 "borderSize": 0,
 "click": "this.setComponentVisibility(this.Container_2820BA13_0D5D_5B97_4192_AABC38F6F169, false, 0, null, null, false)",
 "class": "IconButton",
 "data": {
  "name": "IconButton X"
 },
 "horizontalAlign": "right",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "progressBorderSize": 0,
 "id": "ViewerAreaLabeled_281D2361_0D5F_E9B0_41A1_A1F237F85FD7",
 "left": "0%",
 "toolTipPaddingRight": 6,
 "playbackBarBorderColor": "#FFFFFF",
 "toolTipBorderSize": 1,
 "progressBorderRadius": 0,
 "toolTipPaddingTop": 4,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "transitionMode": "blending",
 "toolTipPaddingLeft": 6,
 "width": "100%",
 "borderRadius": 0,
 "toolTipDisplayTime": 600,
 "paddingLeft": 0,
 "playbackBarLeft": 0,
 "progressBackgroundColorRatios": [
  0.01
 ],
 "minHeight": 1,
 "paddingBottom": 0,
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "toolTipBorderRadius": 3,
 "playbackBarHeadShadowVerticalLength": 0,
 "displayTooltipInTouchScreens": true,
 "progressBarBorderColor": "#0066FF",
 "progressBackgroundColorDirection": "vertical",
 "progressBorderColor": "#FFFFFF",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "borderSize": 0,
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "class": "ViewerArea",
 "playbackBarBottom": 0,
 "toolTipShadowSpread": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "height": "100%",
 "toolTipOpacity": 1,
 "playbackBarHeight": 10,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 6,
 "toolTipShadowBlurRadius": 3,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipTextShadowColor": "#000000",
 "playbackBarRight": 0,
 "toolTipFontSize": 12,
 "toolTipTextShadowBlurRadius": 3,
 "toolTipFontWeight": "normal",
 "playbackBarProgressBorderSize": 0,
 "shadow": false,
 "toolTipPaddingBottom": 4,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderRadius": 0,
 "progressBarBorderSize": 6,
 "toolTipShadowColor": "#333333",
 "paddingTop": 0,
 "playbackBarBorderRadius": 0,
 "playbackBarHeadBorderRadius": 0,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipShadowOpacity": 1,
 "paddingRight": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "transitionDuration": 500,
 "top": "0%",
 "toolTipTextShadowOpacity": 0,
 "playbackBarBorderSize": 0,
 "toolTipFontFamily": "Arial",
 "propagateClick": false,
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "vrPointerSelectionColor": "#FF6600",
 "vrPointerSelectionTime": 2000,
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "toolTipShadowHorizontalLength": 0,
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipShadowVerticalLength": 0,
 "playbackBarHeadShadow": true,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontColor": "#606060",
 "progressHeight": 6,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "data": {
  "name": "Viewer photoalbum + text 1"
 },
 "vrPointerColor": "#FFFFFF",
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7
},
{
 "maxWidth": 60,
 "id": "IconButton_2BE71718_0D55_6990_41A5_73D31D902E1D",
 "left": 10,
 "maxHeight": 60,
 "backgroundOpacity": 0,
 "transparencyActive": false,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "14.22%",
 "rollOverIconURL": "skin/IconButton_2BE71718_0D55_6990_41A5_73D31D902E1D_rollover.png",
 "paddingBottom": 0,
 "propagateClick": false,
 "bottom": "20%",
 "verticalAlign": "middle",
 "top": "20%",
 "minHeight": 50,
 "pressedIconURL": "skin/IconButton_2BE71718_0D55_6990_41A5_73D31D902E1D_pressed.png",
 "mode": "push",
 "minWidth": 50,
 "borderSize": 0,
 "class": "IconButton",
 "iconURL": "skin/IconButton_2BE71718_0D55_6990_41A5_73D31D902E1D.png",
 "data": {
  "name": "IconButton <"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "maxWidth": 60,
 "id": "IconButton_28BF3E40_0D4B_DBF0_41A3_D5D2941E6E14",
 "maxHeight": 60,
 "right": 10,
 "backgroundOpacity": 0,
 "transparencyActive": false,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "14.22%",
 "rollOverIconURL": "skin/IconButton_28BF3E40_0D4B_DBF0_41A3_D5D2941E6E14_rollover.png",
 "paddingBottom": 0,
 "propagateClick": false,
 "bottom": "20%",
 "verticalAlign": "middle",
 "top": "20%",
 "minHeight": 50,
 "pressedIconURL": "skin/IconButton_28BF3E40_0D4B_DBF0_41A3_D5D2941E6E14_pressed.png",
 "mode": "push",
 "minWidth": 50,
 "borderSize": 0,
 "class": "IconButton",
 "iconURL": "skin/IconButton_28BF3E40_0D4B_DBF0_41A3_D5D2941E6E14.png",
 "data": {
  "name": "IconButton >"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "progressBorderSize": 0,
 "id": "ViewerAreaLabeled_2A198C4C_0D3B_DFF0_419F_C9A785406D9C",
 "left": "0%",
 "toolTipPaddingRight": 6,
 "playbackBarBorderColor": "#FFFFFF",
 "toolTipBorderSize": 1,
 "progressBorderRadius": 0,
 "toolTipPaddingTop": 4,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "transitionMode": "blending",
 "toolTipPaddingLeft": 6,
 "width": "100%",
 "borderRadius": 0,
 "toolTipDisplayTime": 600,
 "paddingLeft": 0,
 "playbackBarLeft": 0,
 "progressBackgroundColorRatios": [
  0.01
 ],
 "minHeight": 1,
 "paddingBottom": 0,
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "toolTipBorderRadius": 3,
 "playbackBarHeadShadowVerticalLength": 0,
 "displayTooltipInTouchScreens": true,
 "progressBarBorderColor": "#0066FF",
 "progressBackgroundColorDirection": "vertical",
 "progressBorderColor": "#FFFFFF",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "borderSize": 0,
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "class": "ViewerArea",
 "playbackBarBottom": 0,
 "toolTipShadowSpread": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "height": "100%",
 "toolTipOpacity": 1,
 "playbackBarHeight": 10,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 6,
 "toolTipShadowBlurRadius": 3,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipTextShadowColor": "#000000",
 "playbackBarRight": 0,
 "toolTipFontSize": 12,
 "toolTipTextShadowBlurRadius": 3,
 "toolTipFontWeight": "normal",
 "playbackBarProgressBorderSize": 0,
 "shadow": false,
 "toolTipPaddingBottom": 4,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderRadius": 0,
 "progressBarBorderSize": 6,
 "toolTipShadowColor": "#333333",
 "paddingTop": 0,
 "playbackBarBorderRadius": 0,
 "playbackBarHeadBorderRadius": 0,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipShadowOpacity": 1,
 "paddingRight": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "transitionDuration": 500,
 "top": "0%",
 "toolTipTextShadowOpacity": 0,
 "playbackBarBorderSize": 0,
 "toolTipFontFamily": "Arial",
 "propagateClick": false,
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "vrPointerSelectionColor": "#FF6600",
 "vrPointerSelectionTime": 2000,
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "toolTipShadowHorizontalLength": 0,
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipShadowVerticalLength": 0,
 "playbackBarHeadShadow": true,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontColor": "#606060",
 "progressHeight": 6,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "data": {
  "name": "Viewer photoalbum 1"
 },
 "vrPointerColor": "#FFFFFF",
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7
},
{
 "maxWidth": 60,
 "id": "IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482",
 "left": 10,
 "maxHeight": 60,
 "backgroundOpacity": 0,
 "transparencyActive": false,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "14.22%",
 "rollOverIconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_rollover.png",
 "paddingBottom": 0,
 "propagateClick": false,
 "bottom": "20%",
 "verticalAlign": "middle",
 "top": "20%",
 "minHeight": 50,
 "pressedIconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_pressed.png",
 "mode": "push",
 "minWidth": 50,
 "borderSize": 0,
 "class": "IconButton",
 "iconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482.png",
 "data": {
  "name": "IconButton <"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "maxWidth": 60,
 "id": "IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510",
 "maxHeight": 60,
 "right": 10,
 "backgroundOpacity": 0,
 "transparencyActive": false,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "14.22%",
 "rollOverIconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_rollover.png",
 "paddingBottom": 0,
 "propagateClick": false,
 "bottom": "20%",
 "verticalAlign": "middle",
 "top": "20%",
 "minHeight": 50,
 "pressedIconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_pressed.png",
 "mode": "push",
 "minWidth": 50,
 "borderSize": 0,
 "class": "IconButton",
 "iconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510.png",
 "data": {
  "name": "IconButton >"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "maxWidth": 60,
 "id": "IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1",
 "maxHeight": 60,
 "right": 20,
 "backgroundOpacity": 0,
 "transparencyActive": false,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "10%",
 "rollOverIconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1_rollover.jpg",
 "minHeight": 50,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "top",
 "top": 20,
 "iconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1.jpg",
 "pressedIconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1_pressed.jpg",
 "mode": "push",
 "height": "10%",
 "minWidth": 50,
 "borderSize": 0,
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E, false, 0, null, null, false)",
 "class": "IconButton",
 "data": {
  "name": "IconButton X"
 },
 "horizontalAlign": "right",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "maxWidth": 2000,
 "id": "Image_06C5BBA5_1140_A63F_41A7_E6D01D4CC397",
 "left": "0%",
 "maxHeight": 1000,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 0,
 "url": "skin/Image_06C5BBA5_1140_A63F_41A7_E6D01D4CC397.jpg",
 "propagateClick": false,
 "verticalAlign": "bottom",
 "top": "0%",
 "height": "100%",
 "minWidth": 1,
 "borderSize": 0,
 "class": "Image",
 "data": {
  "name": "Image"
 },
 "scaleMode": "fit_outside",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "shadow": false
},
{
 "data": {
  "name": "Container space"
 },
 "id": "Container_06C59BA5_1140_A63F_41B1_4B41E3B7D98D",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 0,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "height": 60,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 0,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 20,
 "shadow": false,
 "horizontalAlign": "right"
},
{
 "data": {
  "name": "Container text"
 },
 "children": [
  "this.HTMLText_0B42C466_11C0_623D_4193_9FAB57A5AC33",
  "this.Container_0D9BF47A_11C0_E215_41A4_A63C8527FF9C"
 ],
 "id": "Container_06C46BA5_1140_A63F_4151_B5A20B4EA86A",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 520,
 "paddingBottom": 30,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "minWidth": 100,
 "borderSize": 0,
 "layout": "vertical",
 "class": "Container",
 "height": "100%",
 "scrollBarColor": "#E73B2C",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.79,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "Container space"
 },
 "id": "Container_06C42BA5_1140_A63F_4195_037A0687532F",
 "width": 370,
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColorRatios": [
  0,
  1
 ],
 "height": 40,
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "data": {
  "name": "HTMLText"
 },
 "id": "HTMLText_062AD830_1140_E215_41B0_321699661E7F",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "paddingRight": 10,
 "borderRadius": 0,
 "paddingLeft": 10,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 20,
 "propagateClick": false,
 "height": "100%",
 "minWidth": 1,
 "borderSize": 0,
 "class": "HTMLText",
 "scrollBarColor": "#04A3E1",
 "scrollBarVisible": "rollOver",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:7.61vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.62vh;font-family:'Bebas Neue Bold';\">Lorem ipsum</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.62vh;font-family:'Bebas Neue Bold';\">dolor sit amet</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:3.2vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:3.2vh;font-family:'Bebas Neue Bold';\">consectetur adipiscing elit. Morbi bibendum pharetra lorem, accumsan san nulla.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:0.77vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\">Mauris aliquet neque quis libero consequat vestibulum. Donec lacinia consequat dolor viverra sagittis. Praesent consequat porttitor risus, eu condimentum nunc. Proin et velit ac sapien luctus efficitur egestas ac augue. Nunc dictum, augue eget eleifend interdum, quam libero imperdiet lectus, vel scelerisque turpis lectus vel ligula. Duis a porta sem. Maecenas sollicitudin nunc id risus fringilla, a pharetra orci iaculis. Aliquam turpis ligula, tincidunt sit amet consequat ac, imperdiet non dolor.</SPAN></DIV><p STYLE=\"margin:0; line-height:0.77vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\">Integer gravida dui quis euismod placerat. Maecenas quis accumsan ipsum. Aliquam gravida velit at dolor mollis, quis luctus mauris vulputate. Proin condimentum id nunc sed sollicitudin.</SPAN></DIV><p STYLE=\"margin:0; line-height:2.43vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:2.43vh;font-family:'Bebas Neue Bold';\"><B>Donec feugiat:</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Nisl nec mi sollicitudin facilisis </SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Nam sed faucibus est.</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Ut eget lorem sed leo.</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Sollicitudin tempor sit amet non urna. </SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Aliquam feugiat mauris sit amet.</SPAN></DIV><p STYLE=\"margin:0; line-height:2.43vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:2.43vh;font-family:'Bebas Neue Bold';\"><B>lorem ipsum:</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:3.31vh;font-family:'Bebas Neue Bold';\"><B>$150,000</B></SPAN></SPAN></DIV></div>",
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "paddingTop": 0,
 "shadow": false
},
{
 "shadowBlurRadius": 6,
 "data": {
  "name": "Button"
 },
 "shadowSpread": 1,
 "id": "Button_062AF830_1140_E215_418D_D2FC11B12C47",
 "rollOverBackgroundOpacity": 1,
 "iconBeforeLabel": true,
 "fontFamily": "Bebas Neue Bold",
 "backgroundOpacity": 0.7,
 "pressedBackgroundColorRatios": [
  0
 ],
 "shadowColor": "#000000",
 "paddingRight": 0,
 "borderRadius": 0,
 "fontWeight": "normal",
 "paddingLeft": 0,
 "iconHeight": 32,
 "minHeight": 1,
 "paddingBottom": 0,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#04A3E1"
 ],
 "borderColor": "#000000",
 "pressedBackgroundOpacity": 1,
 "width": "46%",
 "mode": "push",
 "backgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "borderSize": 0,
 "label": "lorem ipsum",
 "class": "Button",
 "height": "9%",
 "layout": "horizontal",
 "iconWidth": 32,
 "backgroundColorDirection": "vertical",
 "gap": 5,
 "fontColor": "#FFFFFF",
 "fontStyle": "normal",
 "fontSize": "3vh",
 "textDecoration": "none",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "maxWidth": 150,
 "id": "IconButton_23F7E7B7_0C0A_6293_419F_D3D84EB3AFBD",
 "maxHeight": 150,
 "backgroundOpacity": 0,
 "transparencyActive": true,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "12%",
 "pressedIconURL": "skin/IconButton_23F7E7B7_0C0A_6293_419F_D3D84EB3AFBD_pressed.png",
 "minHeight": 70,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": "8%",
 "iconURL": "skin/IconButton_23F7E7B7_0C0A_6293_419F_D3D84EB3AFBD.png",
 "rollOverIconURL": "skin/IconButton_23F7E7B7_0C0A_6293_419F_D3D84EB3AFBD_rollover.png",
 "mode": "push",
 "minWidth": 70,
 "borderSize": 0,
 "class": "IconButton",
 "data": {
  "name": "IconButton <"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "data": {
  "name": "Container separator"
 },
 "id": "Container_23F7D7B7_0C0A_6293_4195_312C9CAEABE4",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "80%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "height": "30%",
 "minWidth": 1,
 "borderSize": 0,
 "layout": "absolute",
 "class": "Container",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "maxWidth": 150,
 "id": "IconButton_23F037B7_0C0A_6293_41A2_C1707EE666E4",
 "maxHeight": 150,
 "backgroundOpacity": 0,
 "transparencyActive": true,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "12%",
 "pressedIconURL": "skin/IconButton_23F037B7_0C0A_6293_41A2_C1707EE666E4_pressed.png",
 "minHeight": 70,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": "8%",
 "iconURL": "skin/IconButton_23F037B7_0C0A_6293_41A2_C1707EE666E4.png",
 "rollOverIconURL": "skin/IconButton_23F037B7_0C0A_6293_41A2_C1707EE666E4_rollover.png",
 "mode": "push",
 "minWidth": 70,
 "borderSize": 0,
 "class": "IconButton",
 "data": {
  "name": "IconButton >"
 },
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "data": {
  "name": "HTMLText"
 },
 "id": "HTMLText_23F067B8_0C0A_629D_41A9_1A1C797BB055",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "paddingRight": 10,
 "borderRadius": 0,
 "paddingLeft": 10,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 20,
 "propagateClick": false,
 "height": "100%",
 "minWidth": 1,
 "borderSize": 0,
 "class": "HTMLText",
 "scrollBarColor": "#04A3E1",
 "scrollBarVisible": "rollOver",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:7.61vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.62vh;font-family:'Bebas Neue Bold';\">Lorem ipsum</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.62vh;font-family:'Bebas Neue Bold';\">dolor sit amet</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:3.2vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:3.2vh;font-family:'Bebas Neue Bold';\">consectetur adipiscing elit. Morbi bibendum pharetra lorem, accumsan san nulla.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:0.77vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\">Mauris aliquet neque quis libero consequat vestibulum. Donec lacinia consequat dolor viverra sagittis. Praesent consequat porttitor risus, eu condimentum nunc. Proin et velit ac sapien luctus efficitur egestas ac augue. Nunc dictum, augue eget eleifend interdum, quam libero imperdiet lectus, vel scelerisque turpis lectus vel ligula. Duis a porta sem. Maecenas sollicitudin nunc id risus fringilla, a pharetra orci iaculis. Aliquam turpis ligula, tincidunt sit amet consequat ac, imperdiet non dolor.</SPAN></DIV><p STYLE=\"margin:0; line-height:0.77vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\">Integer gravida dui quis euismod placerat. Maecenas quis accumsan ipsum. Aliquam gravida velit at dolor mollis, quis luctus mauris vulputate. Proin condimentum id nunc sed sollicitudin.</SPAN></DIV><p STYLE=\"margin:0; line-height:2.43vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:2.43vh;font-family:'Bebas Neue Bold';\"><B>Donec feugiat:</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Nisl nec mi sollicitudin facilisis </SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Nam sed faucibus est.</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Ut eget lorem sed leo.</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Sollicitudin tempor sit amet non urna. </SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Aliquam feugiat mauris sit amet.</SPAN></DIV></div>",
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "paddingTop": 0,
 "shadow": false
},
{
 "shadowBlurRadius": 6,
 "data": {
  "name": "Button"
 },
 "shadowSpread": 1,
 "id": "Button_23F057B8_0C0A_629D_41A2_CD6BDCDB0145",
 "rollOverBackgroundOpacity": 1,
 "iconBeforeLabel": true,
 "fontFamily": "Bebas Neue Bold",
 "backgroundOpacity": 0.7,
 "pressedBackgroundColorRatios": [
  0
 ],
 "shadowColor": "#000000",
 "paddingRight": 0,
 "borderRadius": 0,
 "fontWeight": "normal",
 "paddingLeft": 0,
 "iconHeight": 32,
 "minHeight": 1,
 "paddingBottom": 0,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#04A3E1"
 ],
 "borderColor": "#000000",
 "pressedBackgroundOpacity": 1,
 "width": "46%",
 "mode": "push",
 "backgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "borderSize": 0,
 "label": "lorem ipsum",
 "class": "Button",
 "height": "9%",
 "layout": "horizontal",
 "iconWidth": 32,
 "backgroundColorDirection": "vertical",
 "gap": 5,
 "fontColor": "#FFFFFF",
 "fontStyle": "normal",
 "fontSize": "3vh",
 "textDecoration": "none",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "data": {
  "name": "HTMLText"
 },
 "id": "HTMLText_221B6648_0C06_E5FD_41A0_77851DC2C548",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "paddingRight": 10,
 "borderRadius": 0,
 "paddingLeft": 10,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 20,
 "propagateClick": false,
 "height": "100%",
 "minWidth": 1,
 "borderSize": 0,
 "class": "HTMLText",
 "scrollBarColor": "#04A3E1",
 "scrollBarVisible": "rollOver",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:7.61vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.62vh;font-family:'Bebas Neue Bold';\">location</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.54vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:3.2vh;font-family:'Bebas Neue Bold';\">address line 1</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:3.2vh;font-family:'Bebas Neue Bold';\">address line 2</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:4.96vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\">Mauris aliquet neque quis libero consequat vestibulum. Donec lacinia consequat dolor viverra sagittis. Praesent consequat porttitor risus, eu condimentum nunc. Proin et velit ac sapien luctus efficitur egestas ac augue. Nunc dictum, augue eget eleifend interdum, quam libero imperdiet lectus, vel scelerisque turpis lectus vel ligula. Duis a porta sem. Maecenas sollicitudin nunc id risus fringilla, a pharetra orci iaculis. Aliquam turpis ligula, tincidunt sit amet consequat ac.</SPAN></DIV></div>",
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "paddingTop": 0,
 "shadow": false
},
{
 "shadowBlurRadius": 6,
 "data": {
  "name": "Button"
 },
 "shadowSpread": 1,
 "id": "Button_221B5648_0C06_E5FD_4198_40C786948FF0",
 "rollOverBackgroundOpacity": 1,
 "width": 207,
 "iconBeforeLabel": true,
 "fontFamily": "Bebas Neue Bold",
 "backgroundOpacity": 0.7,
 "pressedBackgroundColorRatios": [
  0
 ],
 "shadowColor": "#000000",
 "paddingRight": 0,
 "borderRadius": 0,
 "fontWeight": "normal",
 "paddingLeft": 0,
 "iconHeight": 32,
 "minHeight": 1,
 "paddingBottom": 0,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColorRatios": [
  0
 ],
 "borderColor": "#000000",
 "pressedBackgroundOpacity": 1,
 "mode": "push",
 "height": 59,
 "minWidth": 1,
 "borderSize": 0,
 "label": "lorem ipsum",
 "class": "Button",
 "backgroundColor": [
  "#04A3E1"
 ],
 "layout": "horizontal",
 "iconWidth": 32,
 "backgroundColorDirection": "vertical",
 "gap": 5,
 "fontColor": "#FFFFFF",
 "fontStyle": "normal",
 "fontSize": 34,
 "textDecoration": "none",
 "visible": false,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "cursor": "hand",
 "shadow": false
},
{
 "data": {
  "name": "HTMLText18899"
 },
 "id": "HTMLText_0B42C466_11C0_623D_4193_9FAB57A5AC33",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 10,
 "propagateClick": false,
 "height": "45%",
 "minWidth": 1,
 "borderSize": 0,
 "class": "HTMLText",
 "scrollBarColor": "#04A3E1",
 "scrollBarVisible": "rollOver",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:7.61vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:5.84vh;font-family:'Bebas Neue Bold';\">real estate agent</SPAN></SPAN></DIV></div>",
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "paddingTop": 0,
 "shadow": false
},
{
 "data": {
  "name": "- content"
 },
 "children": [
  "this.Image_0B48D65D_11C0_6E0F_41A2_4D6F373BABA0",
  "this.HTMLText_0B4B0DC1_11C0_6277_41A4_201A5BB3F7AE"
 ],
 "id": "Container_0D9BF47A_11C0_E215_41A4_A63C8527FF9C",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0.3,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "100%",
 "minHeight": 1,
 "paddingBottom": 0,
 "overflow": "scroll",
 "propagateClick": false,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "minWidth": 1,
 "borderSize": 0,
 "layout": "horizontal",
 "class": "Container",
 "height": "80%",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "gap": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "contentOpaque": false,
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
},
{
 "maxWidth": 200,
 "id": "Image_0B48D65D_11C0_6E0F_41A2_4D6F373BABA0",
 "maxHeight": 200,
 "backgroundOpacity": 0,
 "paddingRight": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "width": "25%",
 "minHeight": 1,
 "paddingBottom": 0,
 "url": "skin/Image_0B48D65D_11C0_6E0F_41A2_4D6F373BABA0.jpg",
 "propagateClick": false,
 "verticalAlign": "top",
 "height": "100%",
 "minWidth": 1,
 "borderSize": 0,
 "class": "Image",
 "data": {
  "name": "agent photo"
 },
 "scaleMode": "fit_inside",
 "horizontalAlign": "left",
 "paddingTop": 0,
 "shadow": false
},
{
 "data": {
  "name": "HTMLText19460"
 },
 "id": "HTMLText_0B4B0DC1_11C0_6277_41A4_201A5BB3F7AE",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "paddingRight": 10,
 "borderRadius": 0,
 "paddingLeft": 10,
 "width": "75%",
 "minHeight": 1,
 "paddingBottom": 10,
 "propagateClick": false,
 "height": "100%",
 "minWidth": 1,
 "borderSize": 0,
 "class": "HTMLText",
 "scrollBarColor": "#04A3E1",
 "scrollBarVisible": "rollOver",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#04a3e1;font-size:3.2vh;font-family:'Bebas Neue Bold';\">john doe</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.54vh;font-family:'Bebas Neue Bold';\">licensed real estate salesperson</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.54vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#999999;font-size:1.54vh;font-family:'Bebas Neue Bold';\">Tlf.: +11 111 111 111</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#999999;font-size:1.54vh;font-family:'Bebas Neue Bold';\">jhondoe@realestate.com</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#999999;font-size:1.54vh;font-family:'Bebas Neue Bold';\">www.loremipsum.com</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:0.77vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><p STYLE=\"margin:0; line-height:0.77vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><p STYLE=\"margin:0; line-height:0.77vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:0.77vh;font-family:Arial, Helvetica, sans-serif;\">Mauris aliquet neque quis libero consequat vestibulum. Donec lacinia consequat dolor viverra sagittis. Praesent consequat porttitor risus, eu condimentum nunc. Proin et velit ac sapien luctus efficitur egestas ac augue. Nunc dictum, augue eget eleifend interdum, quam libero imperdiet lectus, vel scelerisque turpis lectus vel ligula. Duis a porta sem. Maecenas sollicitudin nunc id risus fringilla, a pharetra orci iaculis. Aliquam turpis ligula, tincidunt sit amet consequat ac, imperdiet non dolor.</SPAN></DIV></div>",
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "paddingTop": 0,
 "shadow": false
}],
 "minWidth": 20,
 "borderSize": 0,
 "layout": "absolute",
 "mobileMipmappingEnabled": false,
 "class": "Player",
 "height": "100%",
 "scrollBarColor": "#000000",
 "scrollBarVisible": "rollOver",
 "vrPolyfillScale": 0.5,
 "backgroundPreloadEnabled": true,
 "gap": 10,
 "mouseWheelEnabled": true,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "defaultVRPointer": "laser",
 "contentOpaque": false,
 "buttonToggleFullscreen": "this.IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0",
 "paddingTop": 0,
 "shadow": false,
 "horizontalAlign": "left"
};

    
    function HistoryData(playList) {
        this.playList = playList;
        this.list = [];
        this.pointer = -1;
    }

    HistoryData.prototype.add = function(index){
        if(this.pointer < this.list.length && this.list[this.pointer] == index) {
            return;
        }
        ++this.pointer;
        this.list.splice(this.pointer, this.list.length - this.pointer, index);
    };

    HistoryData.prototype.back = function(){
        if(!this.canBack()) return;
        this.playList.set('selectedIndex', this.list[--this.pointer]);
    };

    HistoryData.prototype.forward = function(){
        if(!this.canForward()) return;
        this.playList.set('selectedIndex', this.list[++this.pointer]);
    };

    HistoryData.prototype.canBack = function(){
        return this.pointer > 0;
    };

    HistoryData.prototype.canForward = function(){
        return this.pointer >= 0 && this.pointer < this.list.length-1;
    };
    //

    if(script.data == undefined)
        script.data = {};
    script.data["history"] = {};    //playListID -> HistoryData

    TDV.PlayerAPI.defineScript(script);
})();
