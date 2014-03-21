olive
=====

jQueryベースのプログラム集です。
※詳細な使用例はexampleフォルダ内のHTMLをご覧下さい

Olive.Ajax
=====
jQuery Ajaxを持つクラスです。
例）
var Ajax = new Olive.Ajax();
Ajax.exec({
	url: "test.json",
	successHandler: function(res){
		$("body").append("ok");
	},
	errorHandler: function(){
		alert("error")
	},
	sendData: {
		aaa:1
	}
});


Olive.UI
=====
モーダルやアコーディオンなど、UI構築に便利な関数をまとめました。
例）
var ui = new Olive.UI();
ui.simpleTab();


Olive.Util
=====
疑似乱数生成関数などをまとめました
例）
var util = new Olive.Util();
alert( util.randint(1,100) );


extend
=====
それぞれのクラスはextendして使用できます。
例）
var exAjax = Olive.Ajax.extend({
	init: function(){
		this._super();
		console.log("extend")
	}
});
_superを呼び出すことで親クラスの同名関数を実行します

