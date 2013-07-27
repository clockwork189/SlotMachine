(function ($) {
    $.jFace = jFace = window.jFace = $jf = {
        init: function(settings) {
            $jf.settings     = $.extend({}, $jf.defaults, settings);
            $jf.w = $(window);
            $jf.b = $('body');
            $jf.d = $(document);
            $jf.page = $('#outer');
            $jf.place = $('#jf-place');
            $jf.wrap = $('<div id="jface"></div>');
            $jf.cursor.init.apply($jf.cursor,[]);
            $jf.console        = null;

            $jf.bD             = {};//body dimensions
            $jf.bS             = {};//body scrolls

            $jf.templates      = {};//templates storage

            $jf.templates.window='<div class="{JW_EXTRA_CLASSES}"><div class="jw-extra-l">'
            +'<div class="jw-hdr modal-header"><h3></h3>'
            +'<a href="javascript:;" class="close"></a></div>'
            +'<div class="jw-content modal-body">{JW_CONTENT}'
            +'</div><div class="jw-footer modal-footer empty"><div class="jw-footer-content"></div></div></div>'
            +'</div>';
			$jf.templates.windowSplit='<div class="jf-window modal modal-split">'
            +'<a href="javascript:;" class="close"></a>'
            +'<div class="jw-content">{JW_CONTENT}</div>'
            +'</div>';

            /*$jf.templates.growl = '<div class="jf-growl">'
            + '<div class="jf-growl-hdr"><h5></h5><a href="javascript:;" class="jf-growl-close">X</a></div>'
            + '<div class="jf-growl-content"></div>'
            + '</div>';*/

            //service stuff
            $jf.overlay     = $('<div id="jface-overlay" class="modal-backdrop hidden"></div>');
            $jf.loading     = $('<div id="jface-loading" class="hidden"><p></p><div><div></div></div></div>');
            $jf.loading.frame = 1;
            $jf.loading.timer = null;

            $jf.wait         = null;

            $jf.activeElements = {'form':null};

            if ( !$('#jface').length ) {

                try {
                    try {
                        $jf.place.replaceWith($jf.wrap);
                        $jf.b.prepend('<div id="jface-containment"></div>')
                    } catch(err) {
                        alert($jf.page.attr('id'));
                    }
                    $jf.wrap.append($jf.overlay);
                    $jf.overlay.shown = false;
                    $jf.w.data('overlay', $jf.overlay);
                    $jf.wrap.append($jf.loading);
                    $jf.loading.shown = false;
                } catch(err) {
                    alert('1');
                }
            }

            $jf.startTrackScreen();
        },

        templates: {
            //growl: '<div class="growl jGrowl"><div class="jGrowl-notification"><div id="growl-controls"></div><div class="growl-header">{GROWL_HEADER}</div><div class="growl-content">{GROWL_CONTENT}</div></div></div>',
            wait:''
        },

        startTrackScreen: function(){
            $jf.bD = $.getBodyDimensions();
            $jf.bS = $.getScrolls();
            $jf.w.bind('resize', function(){
                $jf.bD = $.getBodyDimensions();
            }).bind('scroll', function(){
                $jf.bS = $.getScrolls();
            });
        },

        toggleOverlay: function(options){
            if (!$jf.overlay.shown) {
                $jf.showOverlay(options);
            } else {
                $jf.hideOverlay(options);
            }
        },

        showOverlay: function(options){
            var o = $.extend({}, {}, options);
            if (!$jf.overlay.shown) {
                $jf.bD = $.getBodyDimensions();
                if (undefined!=o.zIndex) {
                    o.oldZIndex = $jf.overlay.css('z-index');
                    $jf.overlay.css('z-index', o.zIndex);
                }
                $jf.overlay.removeClass('hidden');
                $jf.overlay.data('jf.data', o);
                $jf.overlay.shown = true;
            }
        },

        hideOverlay: function(){
            if ($jf.overlay.shown) {
                $jf.overlay.addClass('hidden');
                var data = $jf.overlay.data('jf.data');
                if('undefined' != typeof data.oldZIndex) {
                    $jf.overlay.css('z-index', data.oldZIndex);
                }
                $jf.overlay.removeData('jf.data');
                $jf.overlay.shown = false;
            }
        },

        toggleLoading: function(msg){
            if (!$jf.loading.shown) {
                $jf.showLoading(msg);
            } else {
                $jf.hideLoading();
            }
        },

        showLoading: function(msg){
            clearInterval($jf.loading.timer);
            if (!$jf.loading.shown) {
                //$jf.bS = $.getScrolls();
                $jf.loading.removeClass('hidden');
                if(msg) {
                    $jf.loading.addClass('msg').find('p').html(msg);
                    $jf.loading.css({
                        marginTop: -$jf.loading.outerHeight()/2,
                        marginLeft: -$jf.loading.outerWidth()/2
                    });
                }
                $jf.loading.div = $jf.loading.find('div div');
                $jf.loading.timer = setInterval($jf.animateLoading, 66);
                $jf.loading.shown = true;
            }
        },

        hideLoading: function(){
            clearInterval($jf.loading.timer);
            if ($jf.loading.shown) {
                $jf.loading.addClass('hidden').removeClass('msg');
                $jf.loading.css({
                    marginTop: -20,
                    marginLeft: -20
                });
                $jf.loading.shown = false;
            }
        },

        animateLoading: function(){
            if (!$jf.loading.shown){
                clearInterval($jf.loading.timer);
                return;
            };
            $jf.loading.div.css('top', ($jf.loading.frame * -40) + 'px');
            $jf.loading.frame = ($jf.loading.frame + 1) % 12;
        }

    };//end jFace

    $.extend({
        getScrolls: function(){
            var xS, yS;

            if (self.pageYOffset) {
                yS = self.pageYOffset;
                xS = self.pageXOffset;
            } else if (document.documentElement && document.documentElement.scrollTop) {
                yS = document.documentElement.scrollTop;
                xS = document.documentElement.scrollLeft;
            } else if (document.body) {
                yS = document.body.scrollTop;
                xS = document.body.scrollLeft;
            }

            return {xScroll:xS, yScroll:yS};
        },
        getBodyDimensions: function(){
            return {wW:$jf.w.width(), wH:$jf.w.height(), bW:$jf.b.width(), bH:$jf.b.height()};
        }

    });

//jQuery service extensions

    $.fn.centrify = function(){
        $this = $(this);
        if ($this.is('.ui-draggable-dragging')) return $this;
        var h = $this.height();
        var w = $this.width();
        return $this.css({'left': (($jf.bD.wW - w) / 2 + $jf.bS.xScroll), 'top':(($jf.bD.wH - h > 0 ? $jf.bD.wH - h : 0 ) / 2 + ( $this.css('position') == 'fixed' ? 0 : $jf.bS.yScroll ))});
    };

    /*JFace cursor*/
    $jf.cursor = {
        shown: false,
        obj: null,
        init: function(){},
        toggle: function(ev){
            if (!$jf.cursor.shown) {
                $jf.b.addClass('wait');
                $jf.cursor.shown = true;
            } else {
                $jf.b.removeClass('wait');
                $jf.cursor.shown = false;
            };
        }
    };
    window.showCursor = window.hideCursor = $jf.cursor.toggle;
})(jQuery);

/*JFACE DIALOGS
* prompts removed
* */
(function ($) {
    $jf.dialog = function (settings) {
        this.tpl = $jf.templates.window;
        this.html = this.tpl.replace('{JW_EXTRA_CLASSES}', 'jf-window modal dialog hidden');
        return $(this.html).attr('id', 'active-dialog');
    };
    $jf.dialog.activeDialog = null;
    $jf.dialog.active = false;
    $jf.dialog.blank = null;
    $jf.dialog.stack = new Array();
    $jf.dialog.closeTimer = null;
    $jf.dialog.replaceOrig = true;
    $jf.dialog.images = [];
    $jf.addDialogs = function (replaceOrig) {
        if (!$('#jface-dialogs').length) {
            $jf.dialogshome = $('<div id="jface-dialogs"></div>');
            $jf.wrap.append($jf.dialogshome);
            $jf.dialogs = {
                alert: {},
                confirm: {}
            };
            $jf.dialog.blank = new $jf.dialog();
            $jf.dialog.blank.find('.close').unbind('click').bind('click', function () {
                $jf.dialog.close()
            });
            $jf.dialog.blank.content = $jf.dialog.blank.find('.jw-content');
            $jf.dialog.blank.header = $jf.dialog.blank.find('.jw-hdr h3');
            $jf.dialog.blank.actions = $jf.dialog.blank.find('.jw-footer').removeClass('empty').find('.jw-footer-content');
            $jf.dialog.blank.form = $('<form id="dialog-form" action="" method="post" enctype="multipart/form-data"></form>');
            $jf.dialog.blank.find('.jw-extra-l').wrapAll($jf.dialog.blank.form);
            $jf.dialog.blank.form = $jf.dialog.blank.find('#dialog-form').submit(function () {
                return $jf.dialog.okActions()
            });
            $jf.dialog.blank.addClass('hidden').appendTo($jf.dialogshome)
        }
        if (undefined != replaceOrig) $jf.dialog.replaceOrig = !!replaceOrig;
        if ($jf.dialog.replaceOrig) {
            window.alert = $jf.alert;
        }
    };
    $jf.normalizeArguments = function (args) {
        if (!args.length) return {};
        var norm = {};
        norm.html = '';
        norm.hdr = $jf.dialog.defaults.header;
        norm.options = {};
        if (args.length > 1 && typeof(args[0]) === 'object') {
            norm.options.trigger = args[0];
            args = $.makeArray(args);
            args.shift()
        }
        if (args.length == 1) {
            norm.html = args[0]
        } else if (args.length == 2) {
            if (typeof(args[1]) === 'string') {
                norm.html = args[0];
                norm.hdr = args[1]
            } else if (typeof(args[1]) === 'object') {
                norm.html = args[0];
                norm.options = $.extend({},
                norm.options, args[1])
            }
        } else if (args.length == 3) {
            norm.html = args[0];
            norm.hdr = args[1];
            norm.options = $.extend({},
            norm.options, args[2]);
        }
        return norm
    };
    $jf.alert = function () {
        var args = $jf.normalizeArguments($jf.alert.arguments);
        $jf.dialog.prepareDialog('alert', args.html, args.hdr, args.options);
        return false
    };
    $jf.confirm = function () {
        var args = $jf.normalizeArguments($jf.confirm.arguments);
        $jf.dialog.prepareDialog('confirm', args.html, args.hdr, args.options);
        return false
    };
    $jf.dialog.prepareDialog = function (type, html, hdr, options) {

    var data = {};
        if ('undefined' == typeof(options)) {
            options = {}
        }
        if ('undefined' != typeof(html)) {
            //data.contentHtml = html.toString();
      data.contentHtml = html;

        }

        if ('undefined' != typeof(hdr)) {
            data.headerHtml = hdr.toString();
        } else {
            data.headerHtml = $jf.dialog.defaults.header
        }
        data.options = $.extend({},
        $jf.dialog.defaults, options);
        data.options.btnNames = $.extend({},
        $jf.dialog.defaults.btnNames, data.options.btnNames);
        data.options.type = type;
        if (!$jf.dialog.active) {
            $jf.dialogs[type].active = $jf.dialog.active = true;
            $jf.dialog.start($jf.dialog.blank, data)
        } else {
            $jf.dialog.stack.push(data)
        }
        return false
    };
    $jf.dialog.start = function (dialog, data) {
        dialog.data('params', data.options);
        $jf.wrap.addClass('jf-dialog-on');
        if (!$jf.overlay.shown) {
            $jf.toggleOverlay({
                opacity: data.options.overlayOpacity,
                initBy: 'jf.dialog'
            })
        }
        if ($jf.dialog.closeTimer) clearTimeout($jf.dialog.closeTimer);
        dialog.actionsHtml = $jf.dialog.buildActions(dialog);
    dialog.content.html(data.contentHtml);
        dialog.header.html(data.headerHtml);
        dialog.actions.html(dialog.actionsHtml);
        if (data.options.width > 0) {
            dialog.css({
                width: data.options.width
            })
        }
        if(data.options.top > 0)
        {
            dialog.css({
                top: data.options.top
            });
        }
        if (data.options.addClass) {
            dialog.addClass(data.options.addClass)
        }
        dialog.removeClass('jw-alert jw-confirm hidden')
        .addClass('jw-' + data.options.type)
        .centrify();
        data.options.showCallback.apply(dialog, [data.options]);
        var wh = parseInt(dialog.height());
        var heightDelta = $jf.dialog.getResizeHeightDelta(dialog, wh);
        var mH = $jf.bD.wH;
        if (wh > mH) {
            $jf.dialog.setContentHeight(dialog, mH - heightDelta)
        }
        $jf.dialog.activeDialog = dialog;
        $jf.dialog.active = true;
        if (data.options.autoClose > 0) {
            $jf.dialog.closeTimer = setTimeout($jf.dialog.close, data.options.autoClose * 1000)
        }
        $jf.d.unbind('keydown').bind('keydown', $jf.dialog.closeFromKbd);
        $jf.w.scroll($jf.dialog.centrify).resize($jf.dialog.centrify);
        try {
            dialog.draggable({
                scroll: false,
                handle: '.jw-hdr',
                cancel: '.close',
                containment: 'document'
            });
        } catch(err){}
        //dialog.find('.jw-footer').disableSelection()
    };
    $jf.dialog.close = function () {
        if ($jf.dialog.closeTimer) clearTimeout($jf.dialog.closeTimer);
        var params = $jf.dialog.activeDialog.data('params');
        var overlayParams = $jf.overlay.data('jf.data');
        if (typeof(overlayParams) === 'object' && overlayParams.initBy == 'jf.dialog') {
            $jf.toggleOverlay()
        }
        $jf.dialog.activeDialog.addClass('hidden').removeClass(params.type).removeAttr('style');
        $jf.dialog.activeDialog.content.removeAttr('style');
        if (params.addClass) {
            $jf.dialog.activeDialog.removeClass(params.addClass)
        }
        $jf.d.unbind('keydown', $jf.dialog.closeFromKbd);
        $jf.w.unbind('resize', $jf.dialog.centrify).unbind('scroll', $jf.dialog.centrify);
        try {
            params.closeCallback.apply($jf.dialog.activeDialog, [params])
        } catch(e) {}
        $jf.dialogs[params.type].active = $jf.dialog.active = false;
        $jf.dialog.activeDialog = null;
        $jf.wrap.removeClass('jf-dialog-on');
        if ($jf.dialog.stack.length) {
            $jf.dialog.start($jf.dialog.blank, $jf.dialog.stack.shift())
        }
    };
    $jf.dialog.buildActions = function (dialog) {
        var actionsHtml = $('<div class="btn-row"></div>');
        var params = dialog.data('params');
        //var btnsHtml = '<div id="btn-confirm" class="btn btn-ok">';
        var btnsHtml = '';
        if (params.type == 'confirm') {
            //actionsHtml.append('<div id="btn-refuse" class="btn btn-cancel"><a href="javascript:;">' + params.btnNames.cancel + '</a></div>')
            actionsHtml.append('<a class="btn btn-cancel" href="javascript:;">' + params.btnNames.cancel + '</a>')
        }
        if (params.type == 'alert' || params.type == 'confirm') {
            btnsHtml += '<a class="btn btn-primary btn-ok" href="javascript:;">' + params.btnNames.ok + '</a>';
        }
        //btnsHtml += '</div>';
        actionsHtml.append(btnsHtml);
        //actionsHtml.append('<div class="clear"></div>');
        var $btnOk = actionsHtml.find('.btn-ok');
        var $btnCancel = actionsHtml.find('.btn-cancel');

        $btnOk.unbind('click').click(function () {
            return $jf.dialog.okActions()
        });

        $btnCancel.unbind('click').click(function () {
            try {
                var params = $jf.dialog.activeDialog.data('params');
                params.cancelCallback.apply($jf.dialog.activeDialog, [params]);
                $jf.dialog.close()
            } catch(e) {}
        });
        actionsHtml.find('.btn:last').addClass('no-right-margin');
        return actionsHtml
    };
    $jf.dialog.closeFromKbd = function (e) {
        if (e.keyCode == 13) {
            return $jf.dialog.okActions()
        } else if (e.keyCode == 27) {
            $jf.dialog.close()
        }
    };
    $jf.dialog.okActions = function () {
        try {
            var params = $jf.dialog.activeDialog.data('params');

            if ($.isFunction(params.okCallback)) {
                params.okCallback.apply($jf.dialog.activeDialog, [params])
            }
            $jf.dialog.close();
            if (params.type == 'confirm' && params.trigger) {
                if (params.trigger.nodeName == 'A') {
                    window.location = params.trigger.href
                } else if (params.trigger.nodeName == 'FORM') {
                    params.trigger.submit()
                }
            }
            return false;

        } catch(e) {}
    };

    $jf.dialog.centrify = function () {
        $jf.dialog.activeDialog.centrify()
    };

    $jf.dialog.getResizeHeightDelta = function (dialog, wh) {
        var heightDelta = 0;
        try {
            heightDelta = wh - parseInt(dialog.content.height())
        } catch(e) {}
        return heightDelta
    };

    $jf.dialog.setContentHeight = function (dialog, h) {
        dialog.content.css({
            'height': h
        })
    };

    $jf.dialog.defaults = {
        type: 'alert',
        addClass: '',
        width: false,
        header: 'Сообщение',
        okCallback: function () {},
        cancelCallback: function () {},
        closeCallback: function () {},
        showCallback: function () {},
        autoClose: false,
    noClose:false,
        formId: '',
        formAction: '',
        formMethod: 'post',
        btnNames: {
            'ok': 'Ok',
            'cancel': 'Отмена',
            'submit': 'Подтвердить'
        },
        overlayOpacity: 0.35
    }
})(jQuery);

/*JFACE WINDOWS*/
(function ($) {
    $jf.window = $jwindow = $jw = function (options) {
		if(options.split) {
			this.tpl = $jf.templates.windowSplit;
		} else {
			this.tpl = $jf.templates.window;
		}
        this.html = this.tpl.replace('{JW_EXTRA_CLASSES}', ' jf-window modal');
        return $(this.html);
    };

    $jw.visibleWindows = new Array();
    $jw.windowshome = null;
    $jw.storage = null;
    $jw.dieTimers = new Array();
    $jw.order = new String();
    $jw.winIds = new Array();
    $jw.activeWindow = null;
    $jw.lastId = 0;
    $jw.maxZindex = 1;

    $jf.windows = $jwindows = new Array();

    $jf.addWindows = function () {
        if (!$('#jface-windows').length) {
            $jf.windowshome = $jw.windowshome = $('<div id="jface-windows"><div id="jw-storage"></div></div>');
            $jf.wrap.append($jf.windowshome);
            $jw.storage = $('#jw-storage');
        }
        $jf.w.on('resize.jwindows', function(){
            var i = $jf.windows.length;
            while(i--) {
                if(!$jf.windows[i] || !$jf.windows[i].length) continue;
                $jf.windows[i].trigger('jw.fitsize');
            }
        });
    };

    $jw.prepare = function (options) {
        var data = {};
        if (undefined == options) {
            options = {}
        }
        if (undefined != options.contentHtml) data.contentHtml = options.contentHtml;
        if (undefined != options.headerHtml) {
            data.headerHtml = options.headerHtml
        } else {
            data.headerHtml = $jw.defaults.headerHtml
        }
        if (undefined != options.footerHtml) {
            data.footerHtml = options.footerHtml
        }
        data.params = $.extend({},$jw.defaults, options);
        return data
    };

    $jw.open = function (options) {
		
        var data = $jw.prepare(options);
        var win = null;
        if (data.params.trigger || data.params.winId) {
            try {
                var winId = 0;
                if (data.params.trigger) {
                    winId = data.params.trigger.data('jw.winId')
                } else {
                    winId = $jw.winIds[data.params.winId]
                }
                if (winId > 0) {
                    if ($jw.visibleWindows[winId]) {
                        $jw.activate(winId)
                    } else {
                        $jw.show(winId)
                    }
                    return
                }
            } catch(e) {}
        }
        win = new $jf.window(options);
        win.content = win.find('.jw-content');
        win.header = win.find('.jw-hdr h3');
        win.footer = win.find('.jw-footer-content');
        if (data.params.addClass) {
            win.addClass(data.params.addClass)
        }
        data.zIndex = ++$jw.maxZindex;
        data.id = ++$jw.lastId;
        win.data('jw.data', data);
        if (data.params.trigger) {
            try {
                data.params.trigger.data('jw.winId', data.id);
            } catch(e) {}
        }
        win.content.html(data.contentHtml);
        win.header.length && win.header.html(data.headerHtml);
        if (win.footer.length && data.footerHtml) {
            win.footer.html(data.footerHtml).parents('.jw-footer').removeClass('empty');
        }
        if (data.params.toolbarHtml) {
            $('<div class="jw-toolbar"></div>').append(data.params.toolbarHtml).append('<div class="clear"></div>').insertBefore(win.content);
            win.toolbar = win.find('.jw-toolbar');
        }
        if(!!data.params.addForm) {
            win.wrapInner(data.params.addForm);
        }
        $jf.windows[data.id] = win;
        if ($.trim(data.params.winId) && undefined == $jw.winIds[data.params.winId]) {
            win.attr('id', data.params.winId);
            $jw.winIds[data.params.winId] = data.id
        } else {
            win.attr('id', 'jw-' + data.id)
        }
        win.find('.close').on('click', function () {
            $jw.close()
        });

        var cssParams = {
            'z-index': data.zIndex,
            'width': data.params.width
        };
        cssParams.left = data.params.initX + ($jf.bS.xScroll || 0);
        cssParams.top = data.params.initY + ($jf.bS.yScroll || 0);
        win.appendTo($jf.windowshome).css(cssParams).on('mousedown', function () {
            var self = $(this);
            if (!self.is('.jw-active')) {
                var data = self.data('jw.data');
                $jw.activate(data.id)
            }
        }).bind('jw.close close.jw', function (id) {
            $jw.close(id)
        }).bind('jw.activate activate.jw', function (id) {
            $jw.activate(id)
        }).bind('jw.die die.jw', function (id) {
            $jw.die(id)
        }).bind('jw.contentchange contentchange.jw jw.fitsize', function (e) {
            $jw.fitHeight(e)
        });
            //.find('.pop-actions').disableSelection();
        if (data.params.resizable && $.isFunction($.fn.resizable)) {
            var resizeParams = {};
            resizeParams.minHeight = data.params.minHeight;
            resizeParams.minWidth = data.params.minWidth;
            if (data.params.maxHeight) {
                resizeParams.maxHeight = data.params.maxHeight;
            } /*else {
                resizeParams.maxHeight = $jf.bD.wH;
            }*/
            if (data.params.maxWidth) {
                resizeParams.maxWidth = data.params.maxWidth - $jw.defaults.resizeXDelta
                if(data.params.maxHeight) {
                    //delete data.params.
                }
            } else {
                resizeParams.maxWidth = $jf.bD.wW - $jw.defaults.resizeXDelta
            }
            if(!data.params.maxHeight || !data.params.maxWidth) {
                resizeParams.containment = data.params.containment;
            }
            resizeParams.containment = data.params.containment;
            resizeParams.handles = 'n, e, s, w, se';
            win.content.wrap('<div class="jw-resize"></div>');
            win.resizer = win.find('.jw-resize');
            resizeParams.alsoResize = win.resizer;
            resizeParams.stop = function (e) {
                win.css('height', 'auto');
                win.resizer.css('width', 'auto');
                try {
                    var data = $jw.activeWindow.data('jw.data');
                } catch(e) {}
            };
            win.resizable(resizeParams)
        }
        if (data.params.draggable && $.isFunction($.fn.draggable)) {
            var dragParams = {};
            dragParams.containment = data.params.containment;
            dragParams.scroll = data.params.scroll;
            dragParams.handle = '.jf-hdr';
            dragParams.cancel = '.jw-resize, .jw-content, .jw-footer, .jw-toolbar';
            //win.header.disableSelection();
            win.draggable(dragParams)
        }
        data.params.openCallback.apply(win, [data.params]);
        $jw.show(data.id)
        return win;
    };

    $jw.show = function (id) {
        try {
            var win = $jf.windows[id];
            var data = win.data('jw.data')
        } catch(e) {}
        $jw.preactivate(win, data);
        $jw.activate(data.id)
    };

    $jw.preactivate = function (win, data) {
        if (undefined != $jw.dieTimers[data.id]) {
            clearTimeout($jw.dieTimers[data.id])
        }
        if (data.params.relativeTo && data.params.relativeTo != 'window' && !win.data('alreadyShown')) {
            try {
                var $rel = $(data.params.relativeTo);
                var pos = $rel.offset();
                win.css({
                    'left': parseInt(pos.left) + data.params.initX,
                    'top': parseInt(pos.top) + data.params.initY
                })
            } catch(e) {}
        }
        win.addClass('jw-visible').show();
        $jw.visibleWindows[data.id] = win;
        var wh = parseInt(win.height());
        var heightDelta = $jw.getResizeHeightDelta(win, wh, data);
        if (data.params.fitSize) {
            var mH = $jf.bD.wH;
            if (!/window|document/.test(data.params.containment)) {
                mH = $(data.params.containment).height()
            }
            if(data.params.maxHeight > 0) {
                mH = Math.min(data.params.maxHeight, mH);
            }
            if (wh > mH) {
                $jw.setContentHeight(win, data.params, mH - heightDelta)
            }
        } else if (!win.data('alreadyShown')) {
            var h = parseInt(data.params.height) > 0 ? parseInt(data.params.height) : wh;
            $jw.setContentHeight(win, data.params, h - heightDelta)
        }
        if (data.params.centered && !win.data('alreadyShown')) {
            win.centrify()
        }
        if (!win.data('alreadyShown')) {
            win.data('alreadyShown', 1)
        }
        data.params.showCallback.apply(win, [data.params])
    };

    $jw.activate = function (id) {
        if ($jw.activeWindow) {
            $jw.activeWindow.removeClass('jw-active')
        }
        var win = null;
        data = null;
        if (typeof(id) == 'object' && id.target) {
            try {
                data = $(id.target).data('jw.data');
                win = $jf.windows[data.id];
                if (!$jw.visibleWindows[data.id]) {
                    $jw.preactivate(win, data)
                }
                id = data.id
            } catch(e) {
                return false
            }
        } else {
            win = $jw.visibleWindows[id];
        }
        try {
            $jw.activeWindow = win;
            if (!data) data = $jw.activeWindow.data('jw.data');
            var sId = new String(id);
            if ($jw.order.indexOf('/' + sId) != -1) {
                $jw.order = $jw.order.replace('/' + sId, '')
            }
            $jw.order += '/' + sId;
            win.css({
                'z-index': ++$jw.maxZindex
            }).addClass('jw-active')
        } catch(e) {}
        data.params.activateCallback.apply(win, [data.params])
    };
    $jw.close = function (id) {
        var win = null;
        var data = null;
        if (undefined == id) {
            win = $jw.activeWindow
        } else if (typeof(id) == 'object' && id.target) {
            try {
                data = $(id.target).data('jw.data');
                win = $jf.windows[data.id];
                id = data.id;
                if (!$jw.visibleWindows[id]) {
                    return
                }
            } catch(e) {
                win = $jw.activeWindow
            }
        } else {
            win = $jw.visibleWindows[id]
        }
        try {
            if (!data) data = win.data('jw.data');
            $jw.visibleWindows[data.id] = null;
            var sId = new String(data.id);
            $jw.order = $jw.order.replace('/' + sId, '');
            if ($jw.order.length) {
                var nextId = $jw.order.substr($jw.order.lastIndexOf('/') + 1);
                $jw.activate(nextId)
            }
            clearTimeout($jw.dieTimers[data.id]);
            win.removeClass('jw-visible');
            $jw.dieTimers[data.id] = setTimeout(function () {
                $jw.die(data.id)
            },
            data.params.dieAfter * 1000);
            data.params.closeCallback.apply(win, [data.params])
        } catch(e) {}
    };
    $jw.die = function (id) {
        try {
            var data = $jf.windows[id].data('jw.data');
            $jf.windows[id].remove();
            if (data.params.winId) {
                $jw.winIds[data.params.winId] = null
            }
            if (data.params.trigger) {
                data.params.trigger.removeData('jw.winId')
            }
            clearTimeout($jw.dieTimers[id]);
            data.params.dieCallback.apply($jf.windows[id], [data.params])
        } catch(e) {}
    };
    $jw.closeFromKbd = function (e) {};
    $jw.setContent = function (id, html) {
        try {
            $jwindows[id].content.html(html);
            $jwindows[id].trigger('jw.contentchange')
        } catch(e) {throw e;}
    };
    $jw.getResizeHeightDelta = function (win, wh, data) {
        var heightDelta = 0;
        if (data.params.resizable) {
            try {
                heightDelta = wh - parseInt(win.resizer.height())
            } catch(e) {}
        } else {
            try {
                heightDelta = wh - parseInt(win.content.height()) + parseInt(win.content.css('padding-top')) + parseInt(win.content.css('padding-bottom'))
            } catch(e) {}
        }
        return heightDelta
    };
    $jw.fitHeight = function (e) {
        if (typeof(e) == 'object' && e.type == 'jw') {
            try {
                var data = $(e.target).data('jw.data');
                var win = $jf.windows[data.id];
                if (data.params.heightAuto) {
                    win.add(win.resizer).css({
                        height: 'auto'
                    })
                } else if (data.params.fitSize) {
                    var wh = parseInt(win.height());
                    var heightDelta = $jw.getResizeHeightDelta(win, wh, data);
                    var mH = $jf.bD.wH;
                    if (!/window|document/.test(data.params.containment)) {
                        mH = $(data.params.containment).height()
                    }
                    if(data.params.maxHeight > 0) {
                        mH = Math.min(data.params.maxHeight, mH);
                    }
                    if (wh > mH) {
                        $jw.setContentHeight(win, data.params, mH - heightDelta);
                    }
                }
            } catch(e) {}
        }
    };

    $jw.setContentHeight = function (win, params, h) {
        if (params.resizable) {
            win.resizer.css({
                'height': h
            })
        } else {
            win.content.css({
                'height': h
            })
        }
    };

    $jw.setDefault = function (params) {
        if ('object' != typeof(params)) return;
        $jw.defaults = $.extend({},
        $jw.defaults, params)
    };
    $jw.restoreDefault = function () {
        $jw.defaults = $jw._defaults
    };
    $jw.getById = function (winId) {
        if (!winId) return [];
        return $jf.windows[$jw.winIds[winId]]
    };
    $jw.closeActiveWindow = function (winId) {
        try {
            $jw.activeWindow.trigger('jw.close');
        } catch(err){}
    };
    $jw.defaults = $jw._defaults = {
        split: false,
        headerHtml: 'Сообщение',
        toolbarHtml: '',
        contentHtml: '',
        footerHtml: '',
        addForm: false,
        dieAfter: 20,
        trigger: false,
        winId: '',
        addClass: '',
        openCallback: function () {},
        showCallback: function () {},
        activateCallback: function () {},
        closeCallback: function () {},
        dieCallback: function () {},
        relativeTo: 'window',
        centered: false,
        initX: '50%',
        initY: '10%',
        draggable: false,
        containment: 'document',
        scroll: true,
        resizable: false,
        resizeXDelta: 25,
        width: false,
        height: false,
        heightAuto: false,
        minWidth: 160,
        maxWidth: false,
        minHeight: 90,
        maxHeight: false,
        fitSize: true
    }
})(jQuery);