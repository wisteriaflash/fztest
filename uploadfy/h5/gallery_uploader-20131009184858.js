(function() {
    SM.namespace('Uploader');
    
    var Dom                             = YAHOO.util.Dom,
        Event                           = YAHOO.util.Event,
        Lang                            = YAHOO.lang;
    
    var NUMBER_OF_SIMULTANEOUS_UPLOADS  = 3,
        FILE_STATUS_NOTSTARTED          = 1,
        FILE_STATUS_DUPLICATE           = 2,
        FILE_STATUS_INPROGRESS          = 3,
        FILE_STATUS_COMPLETE            = 4,
        FILE_STATUS_ERROR               = 5,
        FILE_STATUS_RETRY               = 6,
        VALID_IMAGE_EXTENSIONS          = 'jpg,jpeg,gif,png',
        VALID_VIDEO_EXTENSIONS          = 'mpg,mpeg,avi,mp4,wmv,mov,m4v,mts,3gp',
        DUPLICATES_ACTION_SKIP          = 1,
        DUPLICATES_ACTION_ALLOW         = 2,
        DUPLICATES_ACTION_REPLACE       = 3,
        UPLOAD_INFO_URL                 = 'http://' + SM.hostConfig.uploadHost + '/rpc/upload.mg',
        UPLOAD_RAW_URL                  = 'http://' + SM.hostConfig.uploadHost + '/photos/xmlrawadd.mg',
        FILE_ROW_ID                     = 'uploadFileRow',
        FILE_NAME_ID                    = 'uploadFileName',
        FILE_SIZE_ID                    = 'uploadFileSize',
        FILE_STATUS_ID                  = 'uploadFileStatus',
        STATUS_ICON_ID                  = 'uploadStatusIcon',
        FILE_INPUT_DROP_ID              = 'uploadFileInputDrop',
        DELETE_ICON_ID                  = 'uploadFileDelete',
        PROGRESS_CONTAINER_ID           = 'progressContainer',
        PROGRESS_BAR_ID                 = 'progressBar',
        COIN_SOUND_ID                   = 'coinSound',
        ONEUP_SOUND_ID                  = 'oneUpSound',
        POWERUP_SOUND_ID                = 'powerUpSound',
        POWERDOWN_SOUND_ID              = 'powerDownSound',
        KONAMI_CODE                     = '38,38,40,40,37,39,37,39,66,65',
        POWERUP_COOKIE                  = 'uploaderPowerUp';
    
    var STATUS_ICON_CLASS_ALERT         = 'alert',
        STATUS_ICON_CLASS_ERROR         = 'error',
        STATUS_ICON_CLASS_QUEUE         = 'queue',
        STATUS_ICON_CLASS_SPINNER       = 'spinner',
        STATUS_ICON_CLASS_COMPLETE      = 'complete',
        DELETE_ICON_CLASS               = 'delete-icon',
        DELETE_ICON_CLASS_INPROGRESS    = 'delete-icon-inprogress',
        PROGRESS_BAR_CLASS              = 'progress-bar';
    
    var TEXT_DUPLICATE_FILE             = 'We have this file already. Replace or allow duplicates.',
        TEXT_DUPLICATE_FILES            = 'We see several files just like it. Try allowing duplicates.',
        TEXT_FILE_TOO_LARGE             = 'File too large',
        TEXT_FILE_WRONG_TYPE            = 'Wrong file type',
        TEXT_UPLOAD_FAILED              = 'Upload failed',
        TEXT_FILE_READY                 = 'Ready for upload',
        TEXT_FILE_VAULT                 = 'Ready for upload to SmugVault',
        TEXT_UPLOAD_COMPLETE            = '',
        TEXT_UPLOAD_VERIFY              = 'Verifying upload',
        TEXT_UPLOADS_IN_PROGRESS_MSG    = 'uploads-in-progress',
        
        MSG_UPLOAD_STATUS               = 'upload-status';
        
    var ERROR_CODE_INVALIDLOGIN   = 1,
        ERROR_CODE_SYSTEMERROR    = 5,
        ERROR_CODE_CORRUPT        = 60,
        ERROR_CODE_INCOMPLETE     = 61,
        ERROR_CODE_NOFILE         = 62,
        ERROR_CODE_MAXALBUMCOUNT  = 63,
        ERROR_CODE_UNKNOWNFILETYPE = 64,
        ERROR_CODE_VIDEONOTALLOWED = 65,
        ERROR_CODE_SERVICEUNAVAIL = 98,
        ERROR_CODE_READONLY       = 99;
    
    SM.Uploader.HtmlUploader = function(config) {
        this._init(config);
    };
    
    SM.Uploader.HtmlUploader.prototype = {
        _config:                {},
        _albumId:               0,
        _panel:                 null,
        _dropContainer:         null,
        _dropInputContainer:    null,
        _totalNumberOfFiles:    0,
        _fileInputForm:         null,
        _fileInput:             null,
        _uploadsInProcess:      0,
        _files:                 {},
        _fileStatuses:          {},
        _fileRetries:           {},
        _fileDuplicates:        {},
        _fileAborts:            {},
        _xhrRequests:           {},
        _paused:                false,
        _uploadFilesCalled:     false,
        _pauseButton:           null,
        _browseButton:          null,
        _duplicateButton:       null,
        _scrollbar:             null,
        _galleryImageData:      {},
        _duplicatesAction:      DUPLICATES_ACTION_SKIP,
        _maxImageSize:          (50*1024*1024),
        _maxVideoSize:          (3*1024*1024*1024),
        _ready:                 false,
        _chrome:                false,
        _safari:                false,
        _hasFileAPI:            false,
        _totalItemsInList:      0,
        _totalCompleted:        0,
        _totalWarnings:         0,
        _completedIndexies:     {},
        _warningIndexies:       {},
        _showFileProgress:      true,
        _uploadStarted:         false,
        _soundEffects:          false,
        _coins:                 0,
        _konamiKeys:            [],
        _oneUpSound:            null,
        _powerUpSound:          null,
        _powerDownSound:        null,
        _soundsInitialized:     false,
        _hasSmugVault:          false,
        _sessionId:             '',
        _retryDialog:           null,
        _stopDialog:            null,
        _isStopped:             false,
        
        _defaultConfig:     {
            uploadRawUrl:         UPLOAD_RAW_URL,
            uploadInfoUrl:        UPLOAD_INFO_URL,
            allowedExtensions:    '',
            panelId:              '',
            dropContainerId:      '',
            dropInputContainerId: '',
            formId:               '',
            fileInputId:          '',
            pauseButtonId:        '',
            browseButtonId:       '',
            duplicateButtonId:    '',
            albumId:              '',
            scrollbar:            false,
            completedContainerId: '',
            totalContainerId:     '',
            warningContainerId:   '',
            statusContainerId:    '',
            progressContainerId:  '',
            progressBarId:        '',
            statusMessageId:      '',
            statusPrefixId:       '',
            hasSmugVault:         false,
            sessionId:            ''
        },
        
        /**
         * Initializes the Dom elements and adds the event handlers.
         */
        _init: function(config) {
            var powerUpCookie         = SM.util.getCookie(POWERUP_COOKIE);
            this._config              = Lang.merge(this._defaultConfig, config);
            this._chrome              = (YAHOO.env.ua.webkit >= 534.6 && navigator.userAgent.indexOf('Chrome') > -1);
            this._firefox             = (YAHOO.env.ua.gecko > 0 && navigator.userAgent.indexOf('Firefox') > -1);
            this._safari              = (YAHOO.env.ua.webkit >= 533 && navigator.userAgent.indexOf('Safari') > -1);
            this._oldSafari           = (YAHOO.env.ua.webkit < 533 && navigator.userAgent.indexOf('Safari') > -1);
            this._panel               = Dom.get(this._config.panelId);
            this._dropContainer       = Dom.get(this._config.dropContainerId);
            this._dropInputContainer  = Dom.get(this._config.dropInputContainerId);
            this._fileInputForm       = Dom.get(this._config.formId);
            this._fileInput           = Dom.get(this._config.fileInputId);
            this._pauseButton         = Dom.get(this._config.pauseButtonId);
            this._browseButton        = new YAHOO.widget.Button(this._config.browseButtonId);
            this._duplicateButton     = new YAHOO.widget.Button(this._config.duplicateButtonId, {type: 'menu'});
            this._albumId             = this._config.albumId;
            this._completedContainer  = Dom.get(this._config.completedContainerId);
            this._totalContainer      = Dom.get(this._config.totalContainerId);
            this._warningContainer    = Dom.get(this._config.warningContainerId);
            this._statusContainer     = Dom.get(this._config.statusContainerId);
            this._progressContainer   = Dom.get(this._config.progressContainerId);
            this._progressBar         = Dom.get(this._config.progressBarId);
            this._statusMessage       = Dom.get(this._config.statusMessageId);
            this._statusMessagePrefix = Dom.get(this._config.statusPrefixId);
            this._hasSmugVault        = this._config.hasSmugVault;
            this._sessionId           = this._config.sessionId;
            
            if(this._firefox && YAHOO.env.ua.gecko < 4) {
                this._showFileProgress = false;
            }
            
            try {
                var tempFileReader = new FileReader();
                
                this._hasFileAPI = true;
                tempFileReader = null;
            } catch(err) { }
            
            this._duplicateButton.set('menu', [
                {text: 'Skip Duplicates', value: DUPLICATES_ACTION_SKIP, selected: true, onclick: {fn: this._handleDuplicateMenuClick, obj: {'button': this._duplicateButton, 'that': this}}},
                {text: 'Allow Duplicates', value: DUPLICATES_ACTION_ALLOW, onclick: {fn: this._handleDuplicateMenuClick, obj: {'button': this._duplicateButton, 'that': this}}},
                {text: 'Replace Duplicates', value: DUPLICATES_ACTION_REPLACE, onclick: {fn: this._handleDuplicateMenuClick, obj: {'button': this._duplicateButton, 'that': this}}}
            ]);
            
            this._duplicateButton.set('label', 'Skip Duplicates');
            
            if(!this._hasFileAPI && !this._safari && !this._chrome) {
                this._addInputFileDrop();
            } else {
                Event.addListener(this._dropContainer, 'dragenter', function(e, args) {
                    var panel = args.panel;
                    
                    if(!Dom.hasClass(panel, 'file-dragenter')) {
                        Dom.addClass(panel, 'file-dragenter');
                    }
                    
                    Event.preventDefault(e);
                }, {panel: this._panel});
                
                Event.addListener(this._dropContainer, 'dragleave', function(e, args) {
                    var panel = args.panel;
                    
                    Dom.removeClass(panel, 'file-dragenter');
                    
                    Event.preventDefault(e);
                }, {panel: this._panel});
                
                Event.addListener(this._dropContainer, 'dragover', function(e) {
                    Event.preventDefault(e);
                });
                
                Event.addListener(this._dropContainer, 'drop', this._handleFileDrop, {'that': this});
            }
            
            if(this._config.scrollbar) {
                try {
                    this._scrollbar = new SM.widget.Scrollbar(this._dropContainer);
                } catch(err) {
                    this._config.scrollbar = false;
                }
            }
            
            Event.addListener(this._fileInput, 'change', this._handleFileBrowse, {'that': this});
            Event.addListener(window, 'message', this._handleWindowMessage, {'that': this});
            Event.addListener(this._pauseButton, 'click', this._handlePauseClick, {'that': this});
            Event.addListener(window, 'keydown', this._handleKeyDown, {'that': this});
            
            this._soundEffects = (!Lang.isUndefined(powerUpCookie) && !Lang.isNull(powerUpCookie) && powerUpCookie == 'true');
            
            this._loadUploaderData();
            
            if(this._soundEffects) {
                this._initSounds();
            }
        },
        
        _initSounds: function() {
            if(!this._soundsInitialized) {
                this._oneUpSound     = document.createElement('audio');
                this._powerUpSound   = document.createElement('audio');
                this._powerDownSound = document.createElement('audio');
                
                this._oneUpSound.id = ONEUP_SOUND_ID;
                this._oneUpSound.src = SM.hostConfig.httpPrefix+SM.hostConfig.cdnHost+'/img/skins/smugmug/uploader/one-up.m4a';
                
                this._powerUpSound.id = POWERUP_SOUND_ID;
                this._powerUpSound.src = SM.hostConfig.httpPrefix+SM.hostConfig.cdnHost+'/img/skins/smugmug/uploader/power-up.m4a';
                
                this._powerDownSound.id = POWERDOWN_SOUND_ID;
                this._powerDownSound.src = SM.hostConfig.httpPrefix+SM.hostConfig.cdnHost+'/img/skins/smugmug/uploader/power-down.m4a';
                
                document.body.appendChild(this._oneUpSound);
                document.body.appendChild(this._powerUpSound);
                document.body.appendChild(this._powerDownSound);
                
                this._soundsInitialized = true;
            }
        },
        
        _handleKeyDown: function(event, obj) {
            var that = obj.that;
            
            Event.preventDefault(event);
            
            that._konamiKeys.push(event.keyCode);
            
            if(that._konamiKeys.toString().indexOf(KONAMI_CODE) >= 0 ) {
                Event.removeListener(window, 'keyup');
                
                that._konamiKeys = [];
                that._soundEffects = that._soundEffects? false : true;
                
                if(that._soundEffects) {
                    that._initSounds();
                    that._playPowerUpSound();
                    
                    SM.util.setCookie(POWERUP_COOKIE, 'true', 365);
                } else {
                    SM.util.setCookie(POWERUP_COOKIE, 'false', 365);
                    that._playPowerDownSound();
                }
            }
        },
        
        _handleWindowMessage: function(event, obj) {
            var that = obj.that;
            
            switch(event.data) {
                case TEXT_UPLOADS_IN_PROGRESS_MSG:
                    event.source.postMessage((that._uploadsInProcess > 0), event.origin);
                    break;
                case MSG_UPLOAD_STATUS:
                    event.source.postMessage({
                        activeUploads: that._uploadsInProcess,
                        completedUploads: that._totalCompleted
                    } , event.origin);
                    break;
            }
        },

        /**
         * Pauses the uploads after the last active upload is complete.
         */
        _pauseUpload: function() {
            this._paused = true;
            
            this._abortAllUploads();
        },
        
        /**
         * Resumes the uploads.
         */
        _resumeUpload: function() {
            this._paused = false;
            this._uploadFiles();
        },
        
        _playCoinSound: function(index) {
            if(this._soundEffects) {
                var coinSound = Dom.get(COIN_SOUND_ID+index);
                
                if(coinSound) {
                    coinSound.play();
                }
                
                this._coins++;
                
                if(this._coins >= 100) {
                    if(this._oneUpSound) {
                        this._oneUpSound.play();
                    }
                    
                    this._coins = 0;
                }
            }
        },
        
        _playPowerUpSound: function(index) {
            if(this._soundEffects) {
                if(this._powerUpSound) {
                    this._powerUpSound.play();
                }
            }
        },
        
        _playPowerDownSound: function() {
            if(this._powerDownSound) {
                this._powerDownSound.play();
            }
        },
        
        _handleUploadProgress: function(event, obj) {
            var that        = obj.that,
                index       = obj.index;
            
            if(event.lengthComputable) {
                that._setProgress(index, event.loaded, event.total);
            }
            
            that._playCoinSound(index);
        },
        
        _handleUploadLoaded: function(event, obj) {
            var that        = obj.that,
                index       = obj.index,
                progressBar = Dom.get(PROGRESS_BAR_ID+index);
            
            if(event.lengthComputable) {
                that._setProgress(index, event.loaded, event.total);
            }
            
            that._playCoinSound(index);
        },
        
        /**
         * Handles the ready state change of an upload XHR.
         */
        _handleUploadStateChange: function (event, obj) {
            var that = obj.that;
            var index = obj.index;
            
            if(this.readyState !== 0 && this.readyState !== 1 && YAHOO.lang.isNumber(this.status) === true) {
                if(this.status >= 500) {
                    that._handleFailedUpload(index, null);
                    return;
                }
            }
            
            switch(this.readyState) {
                case 0: //unsent
                    break;
                case 1: //opened
                    break;
                case 2: //headers received
                    break;
                case 3: //loading
                    break;
                case 4: //done
                    if(this.responseText.length > 0) {
                        var response = Lang.JSON.parse(this.responseText);
                        
                        switch(response.stat) {
                            case 'ok':
                                that._handleCompletedUpload(index, response);
                                break;
                            case 'fail':
                                that._handleFailedUpload(index, response);
                                break;
                            default:
                                that._handleFailedUpload(index, {
                                    code: ERROR_CODE_INCOMPLETE,
                                    message: ''
                                });
                                break;
                        }
                    } else {
                        that._handleFailedUpload(index, {
                            code: ERROR_CODE_INCOMPLETE,
                            message: ''
                        });
                    }
                    
                    Event.removeListener(this, 'readystatechange');
                    Event.removeListener(this, 'progress');
                    Event.removeListener(this, 'load');
                    
                    that._xhrRequests[index] = null;
                    
                    break;
            }
            
            /*
            if(that._paused === true && this.readyState !== 4) {
                Event.removeListener(this, 'readystatechange');
                Event.removeListener(this, 'progress');
                Event.removeListener(this, 'load');
                    
                that._abortUpload(index);
                
                return;
            }
            */
        },
        
        /**
         * Handles a failed file upload
         */
        _handleFailedUpload: function(index, response) {
            var removeFile = true;
            var type = '';
            var message = '';
            
            if(response) {
                switch(parseInt(response.code)) {
                    case ERROR_CODE_SYSTEMERROR:
                    case ERROR_CODE_CORRUPT:
                    case ERROR_CODE_INCOMPLETE:
                    case ERROR_CODE_NOFILE:
                        var retries = this._fileRetries[index];
                        
                        this._fileRetries[index] = retries+1;
                        removeFile = false;
                        
                        if(YAHOO.lang.isUndefined(this._fileAborts[index]) === false && this._fileAborts[index] === true) {
                            this._fileAborts[index] = false;
                            this._setStatus(index, 'Upload paused...', STATUS_ICON_CLASS_ALERT);
                            this._fileStatuses[index] = FILE_STATUS_NOTSTARTED;
                        } else {
                            if(retries < 1) { // if we haven't yet retried, immediately retry
                                this._setStatus(index, 'Upload failed... Retrying', STATUS_ICON_CLASS_ALERT);
                                this._fileStatuses[index] = FILE_STATUS_NOTSTARTED;
                                
                            } else { // if we have already retried before, queue it up for retry later
                                this._setStatus(index, 'Upload failed...', STATUS_ICON_CLASS_ALERT);
                                this._fileStatuses[index] = FILE_STATUS_RETRY;
                            }
                        }

                        break;
                    case ERROR_CODE_INVALIDLOGIN:
                    case ERROR_CODE_MAXALBUMCOUNT:
                        this._setStatus(index, TEXT_UPLOAD_FAILED, STATUS_ICON_CLASS_ERROR);
                        this._stopAll(response.message);
                        this._isStopped = true;
                        
                        removeFile = true;
                        break;
                    case ERROR_CODE_SERVICEUNAVAIL:
                    case ERROR_CODE_READONLY:
                        this._setStatus(index, 'Upload failed...', STATUS_ICON_CLASS_ALERT);
                            
                        this._fileRetries[index] = retries+1;
                        this._fileStatuses[index] = FILE_STATUS_NOTSTARTED;
                    
                        this._allowRetry(response.message);
                        
                        removeFile = false;
                        
                        this._isStopped = true;
                        break;
                    case ERROR_CODE_UNKNOWNFILETYPE:
                        this._setStatus(index, 'Unsupported File', STATUS_ICON_CLASS_ERROR);
                        removeFile = true;
                        break;
                    case ERROR_CODE_VIDEONOTALLOWED:
                        this._setStatus(index, 'We are sorry, but your account level does not support videos.', STATUS_ICON_CLASS_ERROR);
                        removeFile = true;
                        break;
                    default:
                        this._setStatus(index, TEXT_UPLOAD_FAILED, STATUS_ICON_CLASS_ERROR);
                        removeFile = true;
                        break;
                }
            } else {
                this._setStatus(index, TEXT_UPLOAD_FAILED, STATUS_ICON_CLASS_ERROR);
                removeFile = true;
            }
            
            if(removeFile) {
                this._fileStatuses[index] = FILE_STATUS_ERROR;
                this._removeFile(index);
                this._addWarningCountStatus(index);
            }
            
            if(this._showFileProgress) {
                this._resetProgress(index, 0, 0);
            }
            
            this._uploadsInProcess--;
            
            this._uploadFiles();
        },
        
        _abortUpload: function(index) {
            var xhr = this._xhrRequests[index];
            
            if(xhr) {
                this._fileAborts[index] = true;
                
                xhr.abort();
            }
        },
        
        _abortAllUploads: function() {
            var xhrs = this._xhrRequests,
                xhr  = null;
            
            for(var index in xhrs) {
                xhr = xhrs[index];
                
                if(xhr) {
                    this._fileAborts[index] = true;
                
                    xhr.abort();
                }
            }
        },
        
        /**
         * Removes a file from the appropriate lists
         */
        _removeFile: function(index) {
            delete this._files[index];
            delete this._fileRetries[index];
            delete this._fileDuplicates[index];
            delete this._fileAborts[index];
        },
        
        /**
         * Handles a completed upload
         */
        _handleCompletedUpload: function(index, response) {
            this._setStatus(index, TEXT_UPLOAD_COMPLETE, STATUS_ICON_CLASS_COMPLETE);
            this._dimItem(index);
            this._fileStatuses[index] = FILE_STATUS_COMPLETE;
            this._removeFile(index);
            this._uploadsInProcess--;
            this._addCompletedCountStatus(index);
            this._setProgress(-1, this._totalCompleted, this._totalItemsInList);
            
            Dom.addClass(Dom.get(FILE_ROW_ID+index), 'complete');
            
            if(this._showFileProgress) {
                this._resetProgress(index, 0, 0);
            }
            
            this._uploadFiles();
        },
        
        /**
         * Dims out an upload row
         */
        _dimItem: function(index) {
            var nameElement = Dom.get(FILE_NAME_ID+index);
            var sizeElement = Dom.get(FILE_SIZE_ID+index);
            
            var attributes = {
                opacity: {to: .5 }
            };
            
            var anim1 = new YAHOO.util.Anim(nameElement, attributes);
            var anim2 = new YAHOO.util.Anim(sizeElement, attributes);
            
            anim1.animate();
            anim2.animate();
        },
        
        _stopAll: function(message) {
            //this._files = {};
            //this._fileRetries = {};
            //this._fileDuplicates = {};
            
            //this._uploadsInProcess = 0;
            
            //Dom.addClass(this._statusContainer, 'complete');
            //this._statusMessagePrefix.innerHTML = 'Upload Stopped: ';
            //this._resetCountStatus();
            
            if(!this._stopDialog) {
                this._stopDialog = SM.util.notice('Uploading Problem', message, {nobuttons: true});
            }
            
            this._stopDialog.show();
        },
        
        _allowRetry: function(message) {
            if(!this._retryDialog) {
                var that = this;
                
                this._retryDialog = SM.util.ask('Uploading Problem', message, {
                    noText: 'No Thanks',
                    yesText: 'Yes Retry',
                    yes: function() {
                        that._retryDialog.hide();
                        
                        that._isStopped = false;
                        that._uploadFiles();
                    }
                });
            }
            
            this._retryDialog.show();
        },
        
        /**
         *
         */
        _uploadFiles: function() {
            var file =  null;
            var filesUploading = 0;
            var filesRemaining = -2; //Upload not even attempted
            var queuedRetries  = [];
            
            var notStarted = false;
            var duplicatesOk = false;
            
            if(this._uploadsInProcess < NUMBER_OF_SIMULTANEOUS_UPLOADS && !this._paused && !this._uploadFilesCalled && this._ready && !this._isStopped) {
                this._uploadFilesCalled = true;
                
                filesRemaining = -1; //No files to be processed
                
                for(var index in this._files) {
                    notStarted = (this._fileStatuses[index] == FILE_STATUS_NOTSTARTED);
                    duplicatesOk = (this._fileStatuses[index] == FILE_STATUS_DUPLICATE && (this._duplicatesAction == DUPLICATES_ACTION_ALLOW || (this._duplicatesAction == DUPLICATES_ACTION_REPLACE && this._fileDuplicates[index] && this._fileDuplicates[index] > 0)));
                    
                    if(filesRemaining == -1) {
                        filesRemaining = 0; //No valid files to be processed
                    }
                    
                    if(this._fileStatuses[index] == FILE_STATUS_RETRY) {
                        queuedRetries.push(index);
                    }
                    
                    if(this._fileStatuses[index] && (notStarted || duplicatesOk) && this._uploadsInProcess < NUMBER_OF_SIMULTANEOUS_UPLOADS && !this._paused) {
                        file = this._files[index];
                        this._uploadStarted = true;
                        this._uploadFile(file, index);
                        filesUploading++;
                        filesRemaining++;
                        
                        if(this._uploadsInProcess == NUMBER_OF_SIMULTANEOUS_UPLOADS) {
                            break;
                        }
                    }
                }
            }
            
            this._uploadFilesCalled = false;
            
            if(filesUploading > 0) {
                if(Dom.hasClass(this._statusContainer, 'idle')) {
                    Dom.removeClass(this._statusContainer, 'idle');
                }
                
                if(Dom.hasClass(this._statusContainer, 'complete')) {
                    Dom.removeClass(this._statusContainer, 'complete');
                    this._statusMessagePrefix.innerHTML = '';
                }
                //this._pauseButton.set('disabled', false);
            } else if(this._isStopped === true) {
                this._uploadStarted = false;
                Dom.addClass(this._statusContainer, 'complete');
                this._statusMessagePrefix.innerHTML = 'Upload Complete: ';
            } else if((filesRemaining == -1 || filesRemaining == 0) && this._uploadStarted && this._uploadsInProcess == 0) {
                //this._pauseButton.set('disabled', true);
                this._uploadStarted = false;
                Dom.addClass(this._statusContainer, 'complete');
                this._statusMessagePrefix.innerHTML = 'Upload Complete: ';
                this._playPowerUpSound(0);
                
                if(queuedRetries.length > 0) {
                    var that = this;
                    
                    var askDialog = SM.util.ask("Uploading Problem", "Sorry!  Some of your photos fell behind.  Attempt to rescue them?", {
                        noText: 'No Thanks',
                        yesText: 'Yes Retry',
                        yes: function() {
                            for(var i=0; i<queuedRetries.length; i++) {
                                that._fileStatuses[queuedRetries[i]] = FILE_STATUS_NOTSTARTED;
                            }
                            
                            askDialog.hide();
                            
                            that._uploadFiles();
                        }
                    });
                }
            }
        },
        
        /**
         *
         */
        _uploadFile: function(file, index) {
            var xhr = new XMLHttpRequest();
            var date = new Date();
            
            Event.addListener(xhr, 'readystatechange', this._handleUploadStateChange, {'index': index, 'that': this});
            
            if(xhr.upload && this._showFileProgress) {
                Event.addListener(xhr.upload, 'progress', this._handleUploadProgress, {'index': index, 'that': this});
                Event.addListener(xhr.upload, 'load', this._handleUploadLoaded, {'index': index, 'that': this});
            }
            
            this._uploadsInProcess++;
            this._fileStatuses[index] = FILE_STATUS_INPROGRESS;
            this._setStatus(index, 'Upload in progress', STATUS_ICON_CLASS_SPINNER);
            this._setProgress(-1, this._totalCompleted, this._totalItemsInList);
            
            xhr.open('PUT', this._config.uploadRawUrl, true);
            xhr.setRequestHeader('Content-Type', '');
            //xhr.setRequestHeader('Content-Length', file.size);
            xhr.setRequestHeader('X-Smug-ResponseType', 'JSON');
            xhr.setRequestHeader('X-Smug-AlbumID', this._albumId);
            xhr.setRequestHeader('X-Smug-FileName', file.name);
            xhr.setRequestHeader('X-Smug-Uploader', 'HTML5');
            
            // Error testing
            if(file.name.indexOf('smuploadfail_') > -1) {
                xhr.setRequestHeader('X-Smug-ErrorCode', file.name.split('.')[0].split('_')[1]);
            }
            
            if(this._fileRetries[index] > 0) {
                xhr.setRequestHeader('X-Smug-RetryCount', this._fileRetries[index]);
            }
            
            if(this._sessionId.length > 0) {
                xhr.setRequestHeader('X-Smug-SessionID', this._sessionId);
            }
            
            if(this._fileDuplicates[index] && this._fileDuplicates[index] > 0 && this._duplicatesAction == DUPLICATES_ACTION_REPLACE) {
                xhr.setRequestHeader('X-Smug-ImageID', this._fileDuplicates[index]);
            }

            if('getAsBinary' in file) {
                /*
                if((parseInt(file.size)/1048576) < 10) {
                    xhr.sendAsBinary(file.getAsBinary());
                } else {
                    xhr.send(file);
                }
                */
                
                xhr.sendAsBinary(file.getAsBinary());
            } else {
                xhr.send(file);
            }
            
            this._xhrRequests[index] = xhr;
        },
        
        /**
         *
         */
        _handleFileDrop: function (event, obj) {
            var dt = event.dataTransfer,
                files = dt.files,
                that = obj.that;
            
            Dom.removeClass(that._panel, 'file-dragenter');
            Dom.setStyle(that._config.duplicateButtonId, 'display', 'inline');
            //Dom.setStyle([that._config.pauseButtonId, that._config.duplicateButtonId], 'display', 'inline');
            
            Event.preventDefault(event);
            
            that._addFiles(files);
        },
        
        /**
         *
         */
        _handleFileBrowse: function(e, obj) {
            if(this.files) {
                var files = this.files;
                var that = obj.that;
                
                Dom.removeClass(that._panel, 'file-dragenter');
                Dom.setStyle(that._config.duplicateButtonId, 'display', 'inline');
                //Dom.setStyle([that._config.pauseButtonId, that._config.duplicateButtonId], 'display', 'inline');
                
                that._addFiles(files);
                
                that._fileInputForm.reset();
            }
        },
        
        /**
         *
         */
        _addFiles: function(files) {
            var count               = files.length,
                fileRow             = document.createDocumentFragment(),
                fileRowItems        = document.createDocumentFragment(),
                domElements         = [],
                validFileType       = false,
                validFileSize       = false,
                validFileTypeSize   = false,
                hasFileExtension    = false,
                fileTypeKnown       = false,
                filesQueued         = 0,
                file                = null,
                duplicateImageId    = 0,
                isDuplicate         = false,
                isMultipleDuplicate = false,
                statusMessage       = '',
                statusClass         = '',
                domElement          = null;
            
            if(count > 0) {
                Dom.removeClass(this._dropContainer, 'itemlist-empty');
            }
    
            for (var i = 0; i < count; i++) {
                file                = files[i];
                duplicateImageId    = this._isDuplicateFileName(file);
                isDuplicate         = (duplicateImageId > 0 || duplicateImageId == -1);
                isMultipleDuplicate = (duplicateImageId == -1);
                hasFileExtension    = this._hasFileExtension(file);
                validFileType       = this._validateFileType(file);
                validFileSize       = this._validateFileSize(file);
                fileTypeKnown       = (file.type != '' || hasFileExtension);
                
                validFileTypeSize   = ((validFileType && validFileSize) || (this._hasSmugVault && fileTypeKnown));
                
                domElements = [
                    document.createElement('li'),
                    document.createElement('p'),
                    document.createElement('p'),
                    document.createElement('p'),
                    document.createElement('img'),
                    document.createElement('img'),
                    document.createElement('div'),
                    document.createElement('div')
                ];
                
                domElement           = domElements[0];
                domElement.id        = FILE_ROW_ID+this._totalNumberOfFiles;
                domElement.className = 'item';
                
                /* File name */
                domElement           = domElements[1];
                domElement.id        = FILE_NAME_ID+this._totalNumberOfFiles;
                domElement.innerHTML = file.name;
                domElement.className = 'title';
                
                /* File size */
                domElement           = domElements[2];
                domElement.id        = FILE_SIZE_ID+this._totalNumberOfFiles;
                domElement.innerHTML = (parseInt(file.size)/1048576).toFixed(2) + 'MB';
                domElement.className = 'size';
                
                /* Status text */
                domElement           = domElements[3];
                domElement.id        = FILE_STATUS_ID+this._totalNumberOfFiles;
                domElement.className = 'status';
                
                if(validFileType || (!validFileType && this._hasSmugVault && fileTypeKnown)) {
                    if(validFileSize || (!validFileSize && this._hasSmugVault)) {
                        if(isDuplicate) {
                            statusMessage = isMultipleDuplicate? TEXT_DUPLICATE_FILES : TEXT_DUPLICATE_FILE;
                        } else {
                            if((!validFileType || !validFileSize) && this._hasSmugVault) {
                                statusMessage = TEXT_FILE_VAULT;
                            } else {
                                statusMessage = TEXT_FILE_READY;
                            }
                        }
                    } else {
                        statusMessage = TEXT_FILE_TOO_LARGE;
                    }
                } else {
                    statusMessage = TEXT_FILE_WRONG_TYPE;
                }
                
                domElement.innerHTML = statusMessage;
                
                /* Status icon */
                domElement     = domElements[4];
                domElement.id  = STATUS_ICON_ID+this._totalNumberOfFiles;
                domElement.src = SM.hostConfig.imgPrefix+'spacer.gif';
                
                if(validFileTypeSize) {
                    if(isDuplicate) {
                        statusClass = STATUS_ICON_CLASS_ALERT;
                    } else {
                        statusClass = STATUS_ICON_CLASS_QUEUE;
                    }
                } else {
                    statusClass = STATUS_ICON_CLASS_ERROR;
                    this._addWarningCountStatus(this._totalNumberOfFiles);
                }
                
                domElement.className = 'status-icon ' + statusClass;
                
                /* Delete icon */
                if(this._hasFileAPI || this._safari) {
                    domElement           = domElements[5];
                    domElement.id        = DELETE_ICON_ID+this._totalNumberOfFiles;
                    domElement.src       = SM.hostConfig.imgPrefix+'spacer.gif';
                    domElement.className = DELETE_ICON_CLASS;
                    Event.addListener(domElement, 'click', this._handleRemoveFile, {'that': this, 'index': this._totalNumberOfFiles});

                    domElements[0].appendChild(domElement);
                }
                
                /* Progress bar */
                if(this._showFileProgress) {
                    domElement           = domElements[6];
                    domElement.id        = PROGRESS_CONTAINER_ID+this._totalNumberOfFiles;
                    domElement.className = PROGRESS_BAR_CLASS+' hidden';
                    
                    domElements[7].id    = PROGRESS_BAR_ID+this._totalNumberOfFiles;
                    
                    domElement.appendChild(domElements[7]);
                }
                
                if(this._soundEffects) {
                    var coinSound    = document.createElement('audio');
                    var soundFrag    = document.createDocumentFragment();
                    
                    coinSound.id = COIN_SOUND_ID+this._totalNumberOfFiles;
                    coinSound.src = SM.hostConfig.httpPrefix+SM.hostConfig.cdnHost+'/img/skins/smugmug/uploader/coin.m4a';
                    
                    soundFrag.appendChild(coinSound);
                }
                
                domElement = null;
                
                fileRowItems.appendChild(domElements[4]);
                fileRowItems.appendChild(domElements[2]);
                fileRowItems.appendChild(domElements[6]);
                fileRowItems.appendChild(domElements[1]);
                fileRowItems.appendChild(domElements[3]);
                
                if(this._soundEffects) {
                    fileRowItems.appendChild(soundFrag);
                }
                
                domElements[0].appendChild(fileRowItems);
                
                fileRow.appendChild(domElements[0]);
                
                this._dropContainer.appendChild(fileRow);
                
                if(validFileTypeSize) {
                    this._files[this._totalNumberOfFiles] = file;
                    this._fileStatuses[this._totalNumberOfFiles] = isDuplicate? FILE_STATUS_DUPLICATE : FILE_STATUS_NOTSTARTED;
                    this._fileRetries[this._totalNumberOfFiles] = 0;
                    
                    if(isDuplicate && duplicateImageId > 0) {
                        this._fileDuplicates[this._totalNumberOfFiles] = duplicateImageId;
                        this._addWarningCountStatus(this._totalNumberOfFiles);
                    } else if(isDuplicate) {
                        this._addWarningCountStatus(this._totalNumberOfFiles);
                    }
                    
                    filesQueued++;
                }
                
                this._totalNumberOfFiles++;
                this._addTotalCountStatus();
            }
            
            if(filesQueued > 0) {
                this._uploadFiles();
            }
        },
        
        /**
         *
         */
        _handleRemoveFile: function(e, obj) {
            var index       = obj.index;
            var that        = obj.that;
            
            that._removeFileRow(index);
        },
        
        _removeFileRow: function(index) {
            Dom.setStyle(FILE_ROW_ID+index, 'display', 'none');
            
            this._fileStatuses[index] = FILE_STATUS_ERROR;
            this._removeFile(index);
            this._removeTotalCountStatus();
            
            if(this._completedIndexies[index] === true) {
                this._removeCompletedCountStatus(index);
            }
            
            if(this._warningIndexies[index] === true) {
                this._removeWarningCountStatus(index);
            }
            
            this._setProgress(-1, this._totalCompleted, this._totalItemsInList);
            
            if(this._totalItemsInList == 0) {
                Dom.addClass(this._dropContainer, 'itemlist-empty');
                
                if(Dom.hasClass(this._statusContainer, 'complete')) {
                    Dom.removeClass(this._statusContainer, 'complete');
                    this._statusMessagePrefix.innerHTML = '';
                }
                
                if(!Dom.hasClass(this._statusContainer, 'idle')) {
                    Dom.addClass(this._statusContainer, 'idle');
                }
            }
        },
        
        _setProgress: function(index, progress, total) {
            var progressContainer = (index == -1)? this._progressContainer : Dom.get(PROGRESS_CONTAINER_ID+index);
            var progressBar       = (index == -1)? this._progressBar : Dom.get(PROGRESS_BAR_ID+index);
            var percentage        = 0;
            
            if((progress > 0 && total > 0) || (index == -1 && total > 0)) {
                if(progress == total) {
                    percentage = 100;
                    
                    if(index == -1) {
                        this._resetProgress(-1, progress, total);
                    } else {
                        this._setStatusMessage(index, TEXT_UPLOAD_VERIFY);
                    }
                } else {
                    percentage = Math.ceil((progress/total)*100);
                }
                
                if(Dom.hasClass(progressContainer, 'hidden') && (index > -1 || (index == -1 && total > 1 && this._uploadsInProcess > 0))) {
                    Dom.removeClass(progressContainer, 'hidden');
                }
                
                if(percentage == 0 && index == -1) {
                    percentage = 1;
                }
                
                Dom.setStyle(progressBar, 'width', percentage + '%');
            }
        },
        
        _resetProgress: function(index, progress, total) {
            var progressContainer = (index == -1)? this._progressContainer : Dom.get(PROGRESS_CONTAINER_ID+index);
            var progressBar       = (index == -1)? this._progressBar : Dom.get(PROGRESS_BAR_ID+index);
            var percentage        = Math.ceil((progress/total)*100);
            
            Dom.addClass(progressContainer, 'hidden');
            Dom.setStyle(progressBar, 'width', percentage+'%');
        },
        
        /**
         *
         */
        _setStatus: function(index, message, type) {
            var img        = Dom.get(STATUS_ICON_ID+index);
            var deleteIcon = Dom.get(DELETE_ICON_ID+index);
            
            Dom.removeClass(img, STATUS_ICON_CLASS_ALERT);
            Dom.removeClass(img, STATUS_ICON_CLASS_QUEUE);
            Dom.removeClass(img, STATUS_ICON_CLASS_SPINNER);
            Dom.removeClass(img, STATUS_ICON_CLASS_COMPLETE);
            
            this._setStatusMessage(index, message);
            
            Dom.addClass(img, type);
            
            if(type == STATUS_ICON_CLASS_SPINNER) {
                Dom.addClass(deleteIcon, DELETE_ICON_CLASS_INPROGRESS);
            } else {
                Dom.removeClass(deleteIcon, DELETE_ICON_CLASS_INPROGRESS);
            }
        },
        
        _setStatusMessage: function(index, message) {
            var status = Dom.get(FILE_STATUS_ID+index);
            
            status.innerHTML = message;
        },
        
        _addCompletedCountStatus: function(index) {
            this._completedIndexies[index] = true;
            this._totalCompleted++;
            this._completedContainer.innerHTML = this._totalCompleted;
            
            if(this._warningIndexies[index] === true) {
                this._removeWarningCountStatus(index);
            }
        },
        
        _removeCompletedCountStatus: function(index) {
            if(this._totalCompleted-1 >= 0) {
                this._totalCompleted--;
            }
            
            delete this._completedIndexies[index];
            this._completedContainer.innerHTML = this._totalCompleted;
        },
        
        _addTotalCountStatus: function() {
            this._totalItemsInList++;
            this._totalContainer.innerHTML = this._totalItemsInList;
        },
        
        _removeTotalCountStatus: function() {
            if(this._totalItemsInList-1 >= 0) {
                this._totalItemsInList--;
            }
            
            this._totalContainer.innerHTML = this._totalItemsInList;
        },
        
        _addWarningCountStatus: function(index) {
            if(this._warningIndexies[index] !== true) {
                this._warningIndexies[index] = true;
                this._totalWarnings++;
                this._warningContainer.innerHTML = '(' + this._totalWarnings + ((this._totalWarnings > 1)? ' warnings' : ' warning') + ')';
            }            
        },
        
        _removeWarningCountStatus: function(index) {
            if(this._totalWarnings-1 >= 0) {
                this._totalWarnings--;
            }
            
            if(this._totalWarnings == 0) {
                this._warningContainer.innerHTML = '';
            } else {
                this._warningContainer.innerHTML = '(' + this._totalWarnings + ((this._totalWarnings > 1)? ' warnings' : ' warning') + ')';
            }
            
            delete this._warningIndexies[index];
        },
        
        _resetCountStatus: function() {
            this._completedContainer.innerHTML = '0';
            this._totalContainer.innerHTML = '0';
            this._warningContainer.innerHTML = '';
        },
        
        /**
         *
         */
        _validateFileType: function(file) {
            var fileName = file.name;
            var extension = fileName.substr(fileName.lastIndexOf('.')+1).toLowerCase();
        
            if(fileName.length == 0) {
                return false;
            }
            
            if(VALID_IMAGE_EXTENSIONS.indexOf(extension) > -1 || VALID_VIDEO_EXTENSIONS.indexOf(extension) > -1) {
                return true;
            }

            if (this._config.allowedExtensions.toLowerCase().indexOf(extension.toLowerCase()) > -1) {
                return true;
            }
            
            return false;
        },
        
        _hasFileExtension: function(file) {
            var fileName = file.name;
            
            return (fileName.lastIndexOf('.') > 0);
        },
        
        /**
         *
         */
        _validateFileSize: function(file) {
            var fileName = file.name;
            var extension = fileName.substr(fileName.lastIndexOf('.')+1).toLowerCase();
            
            if(VALID_IMAGE_EXTENSIONS.indexOf(extension) > -1) {
                return (file.size <= this._maxImageSize);
            } else if(VALID_VIDEO_EXTENSIONS.indexOf(extension) > -1) {
                return (file.size <= this._maxVideoSize);
            } else if(this._config.allowedExtensions.toLowerCase().indexOf(extension.toLowerCase()) > -1) {
                return true;
            } else {
                return false;
            }
        },
        
        /**
         *
         */
        _isDuplicateFileName: function(file) {
            var numberOfDuplicates = 0;
            var duplicateImageId = 0;
            
            for(var imageId in this._galleryImageData) {
                var image = this._galleryImageData[imageId];
                
                if(file.name == image.FileName) {
                    numberOfDuplicates++;
                    duplicateImageId = image.ImageID;
                }
            }
            
            if(numberOfDuplicates == 0) {
                return 0;
            } else if(numberOfDuplicates == 1) {
                return duplicateImageId;
            } else {
                return -1;
            }
        },
        
        /**
         *
         */
        _handlePauseClick: function(e, obj) {
            var that = obj.that;
            
            Event.preventDefault(e);
            
            if(that._paused) {
                Dom.removeClass(that._pauseButton, 'paused');
                that._resumeUpload();
            } else {
                Dom.addClass(that._pauseButton, 'paused');
                that._pauseUpload();
            }
        },
        
        /**
         *
         */
        _loadUploaderData: function() {
            if (this._config.uploadInfoUrl != null) {

                var postArray = [],
                    postData  = 'tool=getUploaderData',
                    that      = this;
                    
                var handleSuccess = function(response) {
                    try {
                        var returnedData       = Lang.JSON.parse(response.responseText);
                        that._galleryImageData = returnedData.imageData;
                        that._ready            = true;
                        
                        if(that._totalNumberOfFiles > 0) {
                            that._uploadFiles();
                        }
                    } catch(err) {
                        
                    }
                };
                
                var handleFailure = function(response) {
                    return;
                };
                
                var callback = {
                    'success':  handleSuccess,
                    'failure':  handleFailure,
                    'scope':    this
                };
                
                postArray.albumId = this._albumId;
                
                for(var i in postArray) {
                    postData += "&" + i + "=" + postArray[i];
                }

                var xhr = YAHOO.util.Connect.asyncRequest('POST', this._config.uploadInfoUrl, callback, postData);
            } else {
                //special case uploader, not in a gallery.
                this._galleryImageData = {};
                this._ready            = true;
            }
        },
        
        /**
         *
         */
        _handleDuplicateMenuClick: function(e, args, obj) {
            var button = obj.button;
            var that = obj.that;
            var text = this.cfg.getProperty('text');
            var value = this.value;
            
            button.set('label', text);
            button.set('selectedMenuItem', this);
            button.set('value', value);
            
            switch(value) {
                case DUPLICATES_ACTION_ALLOW:
                    that._duplicatesAction = DUPLICATES_ACTION_ALLOW;
                    break;
                case DUPLICATES_ACTION_REPLACE:
                    that._duplicatesAction = DUPLICATES_ACTION_REPLACE;
                    break;
                case DUPLICATES_ACTION_SKIP:
                default:
                    that._duplicatesAction = DUPLICATES_ACTION_SKIP;
                    break;
            }
            
            that._uploadFiles();
        },
        
        /**
         *
         */
        _clear: function() {
            this._files                   = {};
            this._fileStatuses            = {};
            this._fileRetries             = {};
            this._fileDuplicates          = {};
            
            this._totalNumberOfFiles      = 0;
            this._uploadsInProcess        = 0;
            
            this._dropContainer.innerHTML = '';
        },
        
        /**
         *
         */
        _addInputFileDrop: function() {
            var fileDropContainer = document.createElement('div');
            
            fileDropContainer.innerHTML = '<input type="file" id="' + FILE_INPUT_DROP_ID + '" class="file-drop" multiple="true">';
            
            this._dropInputContainer.appendChild(fileDropContainer);
            
            Event.addListener(FILE_INPUT_DROP_ID, 'change', this._handleFileBrowse, {'that': this});
        },
        
        hasUploadsInProgress: function() {
            return (this._uploadsInProcess > 0);
        }
    };
    
    SM.Uploader.JavaUploader = function(config) {
        this._init(config);
    };
    
    SM.Uploader.JavaUploader.prototype = {
        _config:                {},
        _albumId:               0,
        _container:             null,
        _uploaderEmbedHTML:     '',
        _failedMessage:         'Failed to load SmugMug Simple Uploader',
        _defaultConfig:         {
            albumId:        '',
            containerId:    '',
            cancelUrl:      ''
        },
        
        _init: function(config) {
            this._config    = Lang.merge(this._defaultConfig, config);
            this._albumId   = this._config.albumId;
            this._container = Dom.get(this._config.containerId);
            
            this.createEvent('render');
        },
        
        _getUploaderEmbedHTML: function(onComplete) {
            var postArray = [];
            var postData = 'tool=getUploaderEmbedHTML';
            var _onComplete = onComplete;
            var that = this;
                
            var handleSuccess = function(response) {
                try {
                    var returnedData = Lang.JSON.parse(response.responseText);
                    this._uploaderEmbedHTML = returnedData.uploaderEmbedHTML;
    
                    _onComplete(true, that);
                } catch(err) {
                    _onComplete(false, that);
                }
            };
            
            var handleFailure = function(response) {
                _onComplete(false, that);
                return;
            };
            
            var callback = {
                'success':  handleSuccess,
                'failure':  handleFailure,
                'scope':    this
            };
            
            postArray.albumId = this._albumId;
            postArray.cancelUrl = this._config.cancelUrl;
            
            for(var i in postArray) {
                postData += "&" + i + "=" + postArray[i];
            }
    
            var xhr = YAHOO.util.Connect.asyncRequest('POST', '/rpc/gallery.mg', callback, postData);
        },
        
        _render: function() {            
            if(this._uploaderEmbedHTML != '') {
                this._container.innerHTML = this._uploaderEmbedHTML;
                this.fireEvent('render');
            } else {
                this._getUploaderEmbedHTML(function(success, that) {
                    that._container.innerHTML = success? that._uploaderEmbedHTML : that._failedMessage;
                    that.fireEvent('render');
                });
            }
        },
        
        render: function() {
            this._render();
        },
        
        remove: function() {
            this._container.innerHTML = '';
        }
    };
    
    Lang.augmentProto(SM.Uploader.JavaUploader, YAHOO.util.EventProvider);

    SM.Uploader.FlashUploader = function(config) {
        this._init(config);
    };

    SM.Uploader.FlashUploader.prototype = {
        _config:                {},
        _sessionId:             0,
        _albumId:               0,
        _albumKey:              0,
        _hasSmugVault:          false,
        _container:             null,
        _failedMessage:         'Failed to laod SmugMug Flash Uploader',
        _imageLimit:            null,
        _videoLimit:            null,
        _vaultLimit:            null,
        _defaultConfig:         {
            albumId:        '',
            containerId:    ''
        },

        _init: function(config) {
            this._parseConfig(config); 

            this._container = Dom.get(this._config.containerId);

            this._container.innerHTML = '<div id="flashUploader"><p id="getflash">Holy HTTP, Batman! You need the latest version of Adobe Flash Player to upload photos and videos! <a href="http://www.adobe.com/go/getflashplayer">Get it here!</a></p></div>';
        },

        _parseConfig: function(config) {
            this._config    = Lang.merge(this._defaultConfig, config);
            this._albumId   = this._config.albumId;
            this._albumKey  = this._config.albumKey;
            this._sessionId = this._config.sessionId;
            this._hasSmugVault = this._config.hasSmugVault;
            this._imageLimit = this._config.imageLimit;
            this._videoLimit = this._config.videoLimit;
            this._vaultLimit = this._config.vaultLimit;
        },

        _render:function() {
            var isHtml5Compatible = false;
            var isSupportedSafari = (YAHOO.env.ua.webkit >= 533 && navigator.userAgent.indexOf('Safari') > -1);
            var isChrome = (YAHOO.env.ua.webkit > 534.6 && navigator.userAgent.indexOf('Chrome') > -1);

            try {
                var reader = new FileReader();
            
                reader = null;
                isHtml5Compatible = true;
            } catch(err) {
                if(isChrome || isSupportedSafari) {
                    isHtml5Compatible = true;
                } else {
                    isHtml5Compatible = false;
                }
            }

            var browserName = 'unidentified';

            if (YAHOO.env.ua.gecko > 0) {
                browserName = 'FireFox';
            } else if (YAHOO.env.ua.ie > 0) {
                browserName = 'Internet Explorer';
            } else if (YAHOO.env.ua.opera > 0) {
                browsersName = 'Opera';
            } else if (YAHOO.env.ua.webkit > 0) {
                if (isChrome) {
                    browserName = 'Chrome';
                } else {
                    browserName = 'Safari';
                }
            }

            var flashVars = {
                mainHost: SM.hostConfig.mainHost,
                cdnHost: SM.hostConfig.cdnHost,
                uploadURL: UPLOAD_RAW_URL,
                apiURL: 'http://' + SM.hostConfig.apiHost + '/',
                sessionId: this._sessionId,
                albumId: this._albumId,
                albumKey: this._albumKey,
                hasSmugVault: this._hasSmugVault,
                imageTypes: VALID_IMAGE_EXTENSIONS,
                videoTypes: VALID_VIDEO_EXTENSIONS,
                imageLimit: this._imageLimit,
                videoLimit: this._videoLimit,
                vaultLimit: this._vaultLimit,
                browser: browserName,
                modern: isHtml5Compatible,
                retryableErrors: '5,60,61,62',
                maintenanceErrors: '98,99'
            };

            var params = {wmode:"transparent",allowscriptaccess:"always"};

            var attributes = { };

            var swfPath = SM.hostConfig.imgPrefix + 'ria/FlashUploader/'+SM.appVersion.flashUploader+'.swf';

            swfobject.embedSWF(swfPath, 'flashUploader', '709', '400', '10.0.0', 'expressInstall.swf', flashVars, params, attributes);
        },

        render: function() {
            this._render();
        },

        remove: function() {
            this._container.innerHTML = '';
        },

        renderModal:function() {
            var postArray = [];
            var postData = 'tool=getFlashUploaderData';
            
            var handleSuccess = function(response) {
            
                try {
                    var returnedData = Lang.JSON.parse(response.responseText);
                    this._parseConfig(returnedData); 
                    this._render();
                } catch(err) {

                }
            };

            var handleFailure = function(response) {
                return;
            };
            
            var callback = {
                'success':  handleSuccess,
                'failure':  handleFailure,
                'scope':    this
            };
            
            postArray.albumId = this._albumId;
            
            for(var i in postArray) {
                postData += "&" + i + "=" + postArray[i];
            }
    
            var xhr = YAHOO.util.Connect.asyncRequest('POST', '/rpc/upload.mg', callback, postData);
        }

    };
    
    SM.Uploader.render = function(containerId, albumId) {
        var isHtml5Compatible = false;
        var isChrome          = (YAHOO.env.ua.webkit > 534.6 && navigator.userAgent.indexOf('Chrome') > -1);
        var isSupportedSafari = (YAHOO.env.ua.webkit >= 533 && navigator.userAgent.indexOf('Safari') > -1);
        var uploaderCookie    = null;
        var iFrameId          = Dom.generateId();
        var lastClickedHref  = '';
        
        function _handleMessage(event) {
            if(event.data === 'true' || event.data === true) {
                if(!confirm('You currently have uploads in progress.\n\nNavigating away from this page will cause your uploads to fail.\n\nAre you sure you want to navigate away from this page?')) {
                    return;
                }
            }
            
            document.location.href = lastClickedHref;
        }
        
        function _handleClick(event) {            
            var target       = event.target,
                targetParent = target.parentNode,
                frame        = document.getElementById(iFrameId).contentWindow;
            
            if((target.nodeName.toLowerCase() == 'a' && target.href != '' && target.target != '_blank') || (targetParent && targetParent.nodeName.toLowerCase() == 'a' && targetParent.href != '' && targetParent.target != '_blank')) {
                Event.preventDefault(event);
                
                lastClickedHref = targetParent.href || target.href;
                   
                frame.postMessage(TEXT_UPLOADS_IN_PROGRESS_MSG, 'http://'+SM.hostConfig.uploadHost);
            }
        }
        
        try {
            var reader = new FileReader();
            
            reader = null;
            isHtml5Compatible = true;
        } catch(err) {
            if(isChrome || isSupportedSafari) {
                isHtml5Compatible = true;
            } else {
                isHtml5Compatible = false;
            }
        }
        
        if(!YAHOO.lang.isUndefined(SM.util.getCookie('brandNewUploader'))) {
            uploaderCookie = SM.util.getCookie('brandNewUploader');
        }
        
        isHtml5Compatible = isHtml5Compatible && (!uploaderCookie || uploaderCookie == 'html5' || uploaderCookie == '');
        
        if(isHtml5Compatible) {
            var container = Dom.get(containerId);
            
            container.innerHTML = '<iframe id="' + iFrameId + '" name="'+iFrameId+'" src="http://' + SM.hostConfig.uploadHost + '/photos/html5addframe.mg?albumId=' + albumId + '" width="708" height="400" style="border: none;" scrolling="no" frameborder="0"></iframe>';
            
            Event.addListener(document.body, 'click', _handleClick);
            Event.addListener(window, 'message', _handleMessage);
        } else {
            /*
            FLASH UPLOADER FALLBACK
            */
           var _flashUploader = new SM.Uploader.FlashUploader({containerId: containerId, albumId: albumId}); 

           _flashUploader.renderModal();
            
            /*
            SIMPLE UPLOADER FALLBACK
            var javaUploader = new SM.Uploader.JavaUploader({containerId: containerId, albumId: albumId});

            javaUploader.render();
            */
        }
    };
}());
