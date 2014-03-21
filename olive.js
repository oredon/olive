/**
 * IE等、consoleエラー避ける
 */
if ( !("console" in window) ) {
	window.console = {
		log: function(){},
		dir: function(){},
		debug: function(){}
	};
};

/**
 * console.log
 */
if ( !("_log" in window) ){
	window._log = function(){
		console.log(arguments);
	}
};


/**
 * Object.createをIE6対応
 */
if (typeof Object.create !== 'function') {
	Object.create = function(o) {
		var F = function(){};
		F.prototype = o;
		return new F();
	};
};



/**
 * Class機能を定義
 * 
 * depends:
 *  - jQuery
 * 
 */
;(function($, window, document, undefined) {
	var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	
	var nameUA = navigator.userAgent.toLowerCase();
	var isIe678 = nameUA.match(/ie [6-8]/) ? true : false;
	
	function Class() {}
	
	/**
	 * Class.extendメソッド
	 */
	Class.extend = function (props) {
		// thisをSuperClassとする
		var SuperClass = this;
		
		// extend内で使用するClass関数
		function Class() {
			if (typeof this.init === 'function') {
				this.init.apply(this, arguments);//スーパークラスのinitメソッドを継承実行
			}
		}
		
		// スーパークラス継承
		Class.prototype = Object.create(SuperClass.prototype, {
			constructor: {
				value: Class,
				writable: true,
				configurable: true
			}
		});
		
		// 個別クラスのメンバ変数メンバ関数を上書き jquery
		$.each(props, function(key,val){
		/* }
		Object.keys(props).forEach(function (key) { */
			var prop   = props[key],
				_super = SuperClass.prototype[key],
				isMethodOverride = (typeof prop === 'function' && typeof _super === 'function' && fnTest.test(prop));
				
			// 対象がメンバ関数だった場合
			if (isMethodOverride) {
				Class.prototype[key] = function () {
					var ret;
					
					//IE6 7 8 はdefineProperty非対応ないし挙動が異なるためprototype
					if (typeof Object.defineProperty !== 'function' || isIe678) {
						Class.prototype._super = _super;//IE6 7 8対応
					}else{
						Object.defineProperty(this, '_super', {
							value: _super,
							configurable: true
						});
					}
					
					ret = prop.apply(this, arguments);
					
					return ret;
				};
				
			}
			// 対象がメンバ変数だった場合
			else {
				Class.prototype[key] = prop;
			}
		});
		
		Class.extend = SuperClass.extend;
		
		return Class;
	};
	
	//グローバルに引き渡す
	window.Class = Class;
	
}(jQuery, this, this.document));




;(function($, window, document, undefined) {
	
	window.Olive = window.Olive || {};
	Olive = {};
	
	Olive.Ajax = Class.extend({
		init: function(){
			
		},
		url: null,
		type: "GET",
		dataType: "json",
		sendData: {},
		exec: function(options){
			var dfd = $.Deferred();
			var _this = this;
			
			_this = $.extend({}, _this, options);
			
			if(!_this.url) return;
			
			if(_this.beforeHandler && $.isFunction(_this.beforeHandler)) _this.beforeHandler();
			
			$.ajax({
				url: _this.url,
				type: _this.type,
				dataType: _this.dataType,
				data: _this.sendData,
				success: function(res) {
					//成功時
					_this.data = res;
					if(_this.successHandler && $.isFunction(_this.successHandler)) _this.successHandler(res);
					dfd.resolve(res);
					
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					//エラー時
					if( 
					    XMLHttpRequest.status != 0 && 
					    XMLHttpRequest.readyState != 0 && 
					    XMLHttpRequest.readyState != 1 && 
					    XMLHttpRequest.readyState != 2 && 
					    XMLHttpRequest.readyState != 3 
					){
						if(_this.errorHandler && $.isFunction(_this.errorHandler)) _this.errorHandler();
						dfd.reject();
					}
				}
			});
			return dfd.promise();
		},
		successHandler: null,
		errorHandler: null,
		beforeHandler: null
	});
	
	Olive.UI = Class.extend({
		init: function(options){
			
		},
		simpleTab: function(options){
			options = $.extend({}, this.simpleTabDefault, options);
			
			var wrpSelector          = options.wrpSelector;
			var btnSelector          = options.btnSelector;
			var containerSelector    = options.containerSelector;
			var currentClassname     = options.currentClassname;
			var attachedCurrentElem  = options.attachedCurrentElem;
			var btnChainAttr         = options.btnChainAttr;
			var containerChainAttr   = options.containerChainAttr;
			var eventTrigger         = options.eventTrigger;
			var initCallback         = options.initCallback;
			var beforeChangeCallback = options.beforeChangeCallback;
			var afterChangeCallback  = options.afterChangeCallback;
			
			var $wrp = $(wrpSelector);
			var $btns = $wrp.find(btnSelector);
			
			
			//一端全てのコンテナをhide
			var $containers = $wrp.find(containerSelector);
			
			if(initCallback && $.isFunction(initCallback)) initCallback();
			
			//ボタンクリック
			$btns.bind(eventTrigger, function(e){
				var $this = $(this);
				var btnChain = $this.attr(btnChainAttr);
				
				if(beforeChangeCallback && $.isFunction(beforeChangeCallback)) beforeChangeCallback.call(this, options);
				
				//一端全てのコンテナをhide
				$containers.hide();
				
				//一端全てのボタンのcurrentを外す
				$attachedTarget = attachedCurrentElem.call($btns);
				$attachedTarget.removeClass(currentClassname);
				
				//対象コンテナをshow
				$(btnChain).show();
				
				//対象ボタンにcurrentを付ける
				$current = attachedCurrentElem.call($this);
				$current.addClass(currentClassname);
				
				if(afterChangeCallback && $.isFunction(afterChangeCallback)) afterChangeCallback.call(this, options);
				
				e.preventDefault();
				return false;
			});
			
			//init処理
			var count = 0;
			$btns.each(function(idx){
				var $this = $(this);
				if( $this.hasClass(currentClassname) ){
					count++;
					$this.trigger(eventTrigger)
				}
			});
			
			
		},
		simpleTabDefault: {
			wrpSelector: "#simpleTabWrp",
			btnSelector: ".simpleTabBtn",
			containerSelector: ".simpleTabContainer",
			currentClassname: "cur",
			attachedCurrentElem: function(){
				//カレントクラスを振る要素 thisはaタグ
				//return this.closest("li")
				return this;
			},
			btnChainAttr: "href",
			eventTrigger: "click",
			initCallback: null,
			beforeChangeCallback: null,
			afterChangeCallback: null
		},

		$simpleModal: null,
		$simpleModalBg: null,
		$simpleModalWindow: null,
		$simpleModalWrapper: null,
		simpleModalOptions: null,
		simpleModalInit: function(options){
			//グローバルcommonオプション拡張
			this.simpleModalOptions = $.extend({}, this.simpleModalDefault, options);
			
			this.$simpleModal = $("<div>").attr("id", this.simpleModalOptions.modalId );
			
			var localThis = this;
			this.$simpleModalBg = $("<div>").attr("id", this.simpleModalOptions.bgId).click(function(e) {
				
				//背景クリックで閉じる
				localThis.simpleModalClose();
				e.preventDefault();
				return false;
				
				
			}).appendTo(this.$simpleModal);
			
			$("body").append(this.$simpleModal);

			//閉じるアクション
			$(this.simpleModalOptions.closeSelector).on("click",function(e) {
				localThis.simpleModalClose();
				e.preventDefault();
				return false;
			});

			//リサイズで高さ・位置調整
			var bindResizeString = "orientationchange resize";//ios6はresizeが暴発するため除外
			var nameUA = navigator.userAgent.toLowerCase();
			var isIphone5Ios6 = nameUA.match(/iphone os 6/) ? true : false;
			if(isIphone5Ios6){
				bindResizeString = "orientationchange";
			}
			$(window).bind(bindResizeString,function(){
				if(localThis.$simpleModalWindow) localThis._simpleModalSetPosAndHeight(localThis.$simpleModalWindow.data("options").modalWindowMarginTopMin, localThis.$simpleModalWindow.data("options").modalWindowMarginSide);
			});
		},
		simpleModalTag: function($target,options){
			//個別オプション拡張
			options = $.extend({}, this.simpleModalOptions, options);
			
			var localThis = this;
			if( !$target || $target.size() == 0 ) return;
			
			$target.each(function(index) {
				$(this).click(function(e) {
					//クリックアクション
					var modalSelector = $(this).attr("href");
					if(modalSelector) localThis.simpleModalOpen(modalSelector, options, $(this));
					e.preventDefault();
					return false;
				});
			});
		},
		simpleModalOpen: function(selector, options, $trigger){
			this.$simpleModalWrapper = $(selector);
			if(!this.$simpleModalWrapper.size()) return;

			//個別オプション拡張
			options = $.extend({}, this.simpleModalOption, options);
			var duration = this.simpleModalOptions.duration;

			//モーダルウィンドウの設定を埋め込む
			this.$simpleModalWindow = this.$simpleModalWrapper.children();
			if(!this.$simpleModalWindow.hasClass("simple_modalbox")) {
				this.$simpleModalWindow.addClass("simple_modalbox").data("options", options);
			}

			//表示
			this._simpleModalShow(options, $trigger);
		},
		simpleModalClose: function(callback){
			if (typeof this.$simpleModalWindow === undefined){
				//連打やサーバサイド遅延により、$modalWindowが消失していたら・・・
				this.$simpleModalWindow = $("#" + this.simpleModalOptions.modalId).find(".modalContents");
			}
			
			var options = this.$simpleModalWindow.data("options");
			
			if (typeof options === undefined){
				this.$simpleModalWindow = $("#" + this.simpleModalOptions.modalId).find(".modalContents");
				var options = this.$simpleModalWindow.data("options");
			}
			
			if( options ){
				var duration = options.duration;
				
				//非表示前に実行
				var beforeHideContent = options.beforeHideContent;
				if($.isFunction(beforeHideContent)) beforeHideContent.call(this.$simpelModal, this.$simpelModalWrapper, this.$simpleModalWindow, options);

				this.$simpleModalWindow.animate({ opacity: 0 }, duration);
				
				var localThis = this;
				setTimeout(function() {
					localThis.$simpleModalWrapper.append(localThis.$simpleModalWindow);
					localThis.$simpleModal.hide();
					if($.isFunction(callback)) callback.call(this, localThis.$simpleModal, localThis.$simpleModalWrapper);

					//非表示後に実行
					var afterHideContent = options.afterHideContent;
					if($.isFunction(afterHideContent)) afterHideContent.call(localThis.$simpleModal, localThis.$simpleModalWrapper, localThis.$simpleModalWindow, options);
				}, duration);
			}
		},
		simpleModalDefault: {
			modalId: "simple_modal",
			bgId: "simple_modal_bg",
			closeSelector: ".simple_modal_close",   //閉じるアクションを付加するオブジェクトのセレクタ
			duration: 300,                          //フェードイン・アウトの時間
			modalWindowMarginTopMin: 20,            //モーダルの最小上マージン
			modalWindowMarginSide: 20,              //モーダルの左右マージン
			beforeShowContent: null,                //表示前に実行(引数　$modalWrapper：背景含むモーダルオブジェクト全体, $modalWindow：モーダルウィンドウ, options: オプション, $trigger: トリガー)
			afterShowContent: null,                 //表示後に実行(引数　$modalWrapper：背景含むモーダルオブジェクト全体, $modalWindow：モーダルウィンドウ, options: オプション, $trigger: トリガー)
			beforeHideContent: null,                //非表示前に実行(引数　$modalWrapper：背景含むモーダルオブジェクト全体, $modalWindow：モーダルウィンドウ, options: オプション)
			afterHideContent: null,                  //非表示後に実行(引数　$modalWrapper：背景含むモーダルオブジェクト全体, $modalWindow：モーダルウィンドウ, options: オプション)
			fixedTopPx: null
		},
		_simpleModalShow: function(options, $trigger){
			this.$simpleModal.show().append(this.$simpleModalWindow);
			this.$simpleModalWindow.show();

			//表示前に実行
			var beforeShowContent = options.beforeShowContent;
			if($.isFunction(beforeShowContent)) beforeShowContent.call(this.$simpleModal, this.$simpleModalWrapper, this.$simpleModalWindow, options, $trigger);
			
			this.$simpleModalWindow.animate({ opacity: 1 }, options.duration);
			
			this._simpleModalSetPosAndHeight(options.modalWindowMarginTopMin, options.modalWindowMarginSide, options.fixedTopPx);
			
			//表示後に実行
			setTimeout(function() {
				var afterShowContent = options.afterShowContent;
				if($.isFunction(afterShowContent)) afterShowContent.call(this.$simpleModal, this.$simpleModalWrapper, this.$simpleModalWindow, options, $trigger);
			}, 1000);
		},
		_simpleModalSetPosAndHeight: function(modalWindowMarginTopMin, modalWindowMarginSide, fixedTopPx){
			var modalWindowWidth  = this.$simpleModalWindow.filter(":visible").outerWidth();
			var modalWindowHeight = this.$simpleModalWindow.filter(":visible").outerHeight();
			var windowWidth  = window.innerWidth  || $(window).width();
			var windowHeight = window.innerHeight || $(window).height();
			
			if( fixedTopPx ){
				//追加
				posTop = fixedTopPx;
			}else{
				var posTop = $(window).scrollTop() +
					((windowHeight < modalWindowHeight + modalWindowMarginTopMin * 2)?
						modalWindowMarginTopMin:
						(windowHeight - modalWindowHeight) / 2
					);
			}
			//モーダルコンテンツの位置をセット
//			this.$simpleModalWindow.filter(":visible").css({ top: posTop, left: "50%", marginLeft:-1*modalWindowWidth/2 });
			var wid = Math.max.apply( null, [document.body.clientWidth , document.body.scrollWidth, document.documentElement.scrollWidth, document.documentElement.clientWidth] );
			
			this.$simpleModalWindow.filter(":visible").css({ top: posTop, left: (wid - modalWindowWidth) / 2 , marginLeft:0 });
			
			this.$simpleModalBg.css({ width:"100%", height:"100%", position:"fixed" }).show();
		},
		flickable: function($scroll){
			// ---- 基本設定
			var target = this;
			var isTouch = ('ontouchstart' in window);
			var timerId = null;
			var duration = 50;
			var isFlick = false;
			
			$scroll.children('#triggerScroll').bind('touchstart mousedown',function (evt) {
			
			  // ---- フリック開始処理
			  var clientx = isTouch ? event.changedTouches[0].clientX : evt.clientX;
			  var clienty = isTouch ? event.changedTouches[0].clientY : evt.clientY;
			  
			  $scroll
			    .data('down', true)
			    .data('x', clientx)
			    .data('y', clienty)
			    .data('scrollLeft', $scroll.scrollLeft())
			    .data('scrollTop', $scroll.scrollTop());
			  
			  //慣性用のプロパティ初期化
			  $scroll
			    .data('diff_x',0 )
			    .data('diff_y',0 )
			    .data('pre_x',$scroll.scrollLeft() )
			    .data('pre_y',$scroll.scrollTop() );
			  
			  //timer開始
			  timerId = setTimeout(function(){ updateFric(); }, duration);
			  
			  isFlick = true;
			  
			  return false;
			});
			
			/* 
			 * ウィンドウから外れてもイベント実行できるようにdocument全体へイベント割り当て
			 * IEでバグあり thisで代用するとウィンドウのなかだけになる
			 * ＝＞isFlickフラグでフリック開始直後のみイベントを割り当てるよう変更
			 */
			$(document).bind('touchmove mousemove',function (evt) {
			if(isFlick){
			  // ---- フリック中の処理
			  if ($scroll.data('down') == true) {
			    var clientx = isTouch ? event.changedTouches[0].clientX : evt.clientX;
			    var clienty = isTouch ? event.changedTouches[0].clientY : evt.clientY;
			    // スクロール
			    $scroll.scrollLeft($scroll.data('scrollLeft') + $scroll.data('x') - clientx);
			    $scroll.scrollTop($scroll.data('scrollTop') + $scroll.data('y') - clienty);
			    
			    return false; // 文字列選択を抑止
			  }
			}
			}).bind('touchend mouseup',function (evt) {
			if(isFlick){
			  // ---- フリック終了の処理
			  $scroll.data('down', false);
			  //timer終了
			  if(timerId) clearTimeout(timerId);
			  timerId = null;
			  
			  //慣性
			  fricMove();
			  
			  isFlick = false;
			}
			});

			//return this;
			
			/* 
			 * 内部使用関数
			 */
			function updateFric(){
			    
			    //_log( "横：" + $scroll.data('diff_x')  +  "縦：" + $scroll.data('diff_y')  );
			    
			    //慣性プロパティ
			    $scroll
			        .data('diff_x', $scroll.scrollLeft() - $scroll.data('pre_x') )
			        .data('diff_y', $scroll.scrollTop() - $scroll.data('pre_y')  )
			        .data('pre_x',$scroll.scrollLeft() )
			        .data('pre_y',$scroll.scrollTop() );
			    
			    //再帰タイマー
			    timerId = setTimeout(function(){ updateFric(); }, duration);
			}
			
			function fricMove(){
			    //_log( "横：" + $scroll.data('diff_x')  +  "縦：" + $scroll.data('diff_y')  );
			    //$scroll.scrollLeft( $scroll.scrollLeft() + $scroll.data('diff_x') );
			    //$scroll.scrollTop( $scroll.scrollTop() + $scroll.data('diff_y') );
			    $scroll.animate({
			        scrollTop: $scroll.scrollTop() + $scroll.data('diff_y'),
			        scrollLeft: $scroll.scrollLeft() + $scroll.data('diff_x')
			    },{ duration: 600, easing: 'linear'});

			}
		},
		simpleAccordion: function(options){
			//オプション拡張
			options = $.extend({}, this.simpleAccordionDefault, options);
			
			var wrapperSelector      = options.wrapperSelector;
			var triggerSelector      = options.triggerSelector;
			var containerSelector    = options.containerSelector;
			var btnChainAttr         = options.btnChainAttr;
			var triggerCloseSelector = options.triggerCloseSelector;
			var triggerOpenSelector  = options.triggerOpenSelector;
			var touchendFlag         = options.touchendFlag;
			
			var triggerCloseText  = options.triggerCloseText;
			var triggerOpenText   = options.triggerOpenText;
			
			var $wrp = $(wrapperSelector);
			var $trigger = $wrp.find(triggerSelector);
			var $cont = $( $trigger.attr(btnChainAttr) );
			
			//initの開閉ステータス
			if( $trigger.hasClass(triggerCloseSelector) ){
				//閉じクラスがついている
				$cont.hide();
			}else{
				//開くクラスがついている
				$cont.show();
			}
			
			//touchendで開くオプションが有効
			if(touchendFlag){
				//touchendで発火する
				$(window).data("acs_start",0);//touchstart時のscrollTop
				$(window).data("acs_end",0);//touchend時のscrollTop
				$(window).data("acs_num",0);//上記二つの差の絶対値
				
				//touchstart 差の絶対値を初期化　start時のscrollTopを計算
				$(window).bind("touchstart.acs_start",function(){
					$(window).data("acs_num",0);
					$(window).data("acs_start",$(window).scrollTop());
				});
				//touchmove endのscrollTop　と　差の絶対値を常に更新
				$(window).bind("touchmove.acs_move",function(){
					$(window).data("acs_end",$(window).scrollTop());
					$(window).data("acs_num",Math.abs( ( $(window).data("acs_start") - $(window).data("acs_end" )  ) ) );
				});
				////touchend 必要であれば追記
				//$(window).bind("touchend.acs_end",function(){
				//	
				//});
			}
			
			//タッチイベント
			var togglingEvent = "click";
			var isTouch = ('ontouchstart' in window);
			
			if( touchendFlag && isTouch ){
				
				togglingEvent = "touchend";
				$trigger.bind("click",function(e){
					e.preventDefault();
					return false;
				});
				
				
			}
			
			$trigger.bind(togglingEvent, function(e) {
				var $this = $(this);
				
				var execFlag = false;
				if(touchendFlag){
					//touchendで開くオプションが有効
					if( $(window).data("acs_num") < 30 ){
						//touchstartからtouchendまでにスクロールした量が閾値以下であればアコーディオン実行
						execFlag = true;
					}
				}else{
					//clickイベントないしtouchstartで実行
					execFlag = true;
				}
				
				if(execFlag == true){
					//トリガーのクラス切り替え and コンテンツの切り替え
					if( $this.hasClass(triggerCloseSelector) ){
						//閉じている＝＞開く
						$this.removeClass(triggerCloseSelector);
						$this.addClass(triggerOpenSelector);
						$this.html(triggerCloseText);
						
						toggleContentsArea( "open", $cont, options, $this );
					}else{
						$this.addClass(triggerCloseSelector);
						$this.removeClass(triggerOpenSelector);
						$this.html(triggerOpenText);
						
						toggleContentsArea( "close", $cont, options, $this );
					}
					
					
				}
				
				e.preventDefault();
				return false;
			});
			
			function toggleContentsArea( status, $toggleContent, options, $trigger ){
				var duration = options.duration;
				var easing = options.easing;
				
				var beforeOpen = options.beforeOpen;
				var endOpen = options.endOpen;
				var beforeClose = options.beforeClose;
				var endClose = options.endClose;
				
				var open = status == "open";
				
				if(open) {
					if($.isFunction(beforeOpen)) beforeOpen.apply($trigger, [options]);
				} else {
					if($.isFunction(beforeClose)) beforeClose.apply($trigger, [options]);
				}
				
				var contentsDataHeight = $toggleContent.data("height");
				var animatePropertyHeight = contentsDataHeight? (open? 0: contentsDataHeight): "toggle";
				
				$toggleContent.animate({ height: animatePropertyHeight }, duration, easing, function() {
					if(open) {
						if($.isFunction(endOpen)) endOpen.apply($trigger, [options]);
					} else {
						$toggleContent.hide();
						if($.isFunction(endClose)) endClose.apply($trigger, [options]);
					}
				});
			}
			
		},
		simpleAccordionDefault: {
			wrapperSelector: "#accordionWrp",
			triggerSelector: ".accordionTrigger",
			containerSelector: ".accordionContainer",
			btnChainAttr: "href",
			triggerCloseSelector: "closed",
			triggerOpenSelector: "opened",
			triggerCloseText: "閉じる",
			triggerOpenText: "開く",
			touchendFlag:true,
			duration: 300,
			easing: "linear",
			beforeOpen: null,
			endOpen: null,
			beforeClose: null,
			endClose: null
		},
		randomFadeMultipleElems: function(options){
			//オプション拡張
			options = $.extend({}, this.randomFadeMultipleElemsDefault, options);
			
			var $wrp = $(options.wrapperSelector);
			var $fd  = $wrp.find(options.fadeableSelector);
			var fdnum = $fd.size();
			
			var startTimeMin = options.startTimeMin;
			var startTimeMax = options.startTimeMax;
			var fadeDurationMin = options.fadeDurationMin;
			var fadeDurationMax = options.fadeDurationMax;
			var timerScope = options.timerScope;
			
			var olive_util = new Olive.Util();
			
			if(fdnum > 0){
				$fd.each(function(idx){
					var $this = $(this)
					
					
					initFade($this);
				});
			}
			
			function initFade(_this){
				var startTime = olive_util.randint(startTimeMin, startTimeMax) * timerScope;
				var fadeDuration = olive_util.randint(fadeDurationMin, fadeDurationMax) * timerScope;
				
				fadeInFunction(_this, startTime, fadeDuration);
			}
			
			function fadeInFunction(_this, startTime, fadeDuration){
				//フェードアクション開始
				var loadTimerId = null;
				
				loadTimerId = setTimeout(function() {
					
					_this.fadeIn(fadeDuration,function(){
						fadeOutFunction(_this, startTime, fadeDuration);
					});
					
					if(loadTimerId) clearTimeout(loadTimerId);
					loadTimerId = null;
				}, startTime);
			}
			
			function fadeOutFunction(_this, startTime, fadeDuration){
				//フェードアクション開始
				var loadTimerId = null;
				
				loadTimerId = setTimeout(function() {
					
					_this.fadeOut(fadeDuration,function(){
						initFade(_this);
					});
					
					if(loadTimerId) clearTimeout(loadTimerId);
					loadTimerId = null;
				}, startTime);
			}
		},
		randomFadeMultipleElemsDefault: {
			wrapperSelector: "#randomFade",
			fadeableSelector: ".random",
			startTimeMin: 10,
			startTimeMax: 30,
			fadeDurationMin: 8,
			fadeDurationMax: 18,
			timerScope: 100
		}
	});
	
	Olive.Util = Class.extend({
		init: function(options){
			this.isIE6 = this.ua.match(/ie 6/) ? true : false;
			this.isIE7 = this.ua.match(/ie 7/) ? true : false;
			this.isIE8 = this.ua.match(/ie 8/) ? true : false;
			if(this.isIE6 || this.isIE7 || this.isIE8) this.isLegacy = true;
			
			var isTouch = ('ontouchstart' in window);
			if( isTouch ){
				this.isTouch = true;
			}
		},
		randint: function(min, max) {
			return Math.floor( Math.random()*(max-min+1) ) + min;
		},
		randfloat: function(min, max) {
			return Math.random()*(max-min)+min;
		},
		randbool: function() {
			return this.randint(0, 1) === 1;
		},
		ua: navigator.userAgent.toLowerCase(),
		isIE6: false,
		isIE7: false,
		isIE8: false,
		isLegacy: false,
		isTouch: false
	});
	
}(jQuery, this, this.document));
