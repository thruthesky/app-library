var device_ready = false;

if ( is_phonegap() ) {
	document.addEventListener('deviceready', onDeviceReady, false);
}
else {
	onDeviceReady();
}
$(function(){
	trace("App begins (default.js) ...");
	if ( is_phonegap() ) {
		trace("Phonegap is running ...");
		add_javascript('../cordova.js');
	}
	else {
		trace("It is not phonegap ...");
	}
});




var trace_count = 0;
function trace( msg )
{
	try {
		trace_count ++;
		console.log("TRACE[" + trace_count + "] " + msg);
	}
	catch ( e ) {
		// e.message
	}
}


/**
 *
 *
 *
 */
function onDeviceReady()
{
	if ( is_phonegap() ) {
		device_ready = true;
		trace("onDeviceReady()");
		document.addEventListener("online", on_online, false);
		document.addEventListener("offline", on_offline, false);
	}
	else {
		on_online();
	}
	if ( typeof callback_device_ready == 'function' ) {
		callback_device_ready();
	}
}



function on_online()
{
	// message("연결되었습니다.");
	// init_online();
	if ( typeof callback_online == 'function' ) {
		callback_online();
	}
}

function on_offline()
{
	// message("인터넷이 끊겼습니다.");
	if ( typeof callback_offline == 'function' ) {
		callback_offline();
	}
}

                
/** 인터넷에 연결되었으면 참을 리턴한다.
 *
 * 특히, 폰갭이 인터넷에 연결되었는지 확인한다.
 * 이 함수를 쓰기 위해서는 network plugin 을 설치해야 한다.
 */
function is_online() { return is_network_online(); }
function is_network_online()
{
	trace("is_network_online() begins ...");
	if ( ! is_phonegap() ) {
		trace("It is not PhoneGap. It's PC. Just return true;");
		return true;
	}
	
	if ( typeof Connection == 'undefined' ) {
		message("Connection is undefined...: INSTALL network-information plugin.");
		return false;
	}
	
	if ( typeof navigator.connection == 'undefined') {
		trace("navigator.connection is undefined: return false;");
		return false;
	}
	
	if ( navigator.connection.type == Connection.NONE ) {
		trace("navigator.connection.type is none: return false;");
		return false;
	}
	
	trace("is_network_online() returns true");
	return true;
}

/** @short 폰갭이면 참을 리턴한다.
 * 폰갭의 경우, file:// 프로토콜을 사용하므로, 폰갭인지 아닌지를 판별하는데 사용한다.
 */
function is_phonegap() {
	if ( document.location.protocol == 'file:' ) return true;
	else return false;
}

/** @short 폰갭의 경우, 알림 창의 제목을 '알림'으로 표시하게 한다.
 *
 * alert() 를 사용하지 않는다.
 */
function message( str )
{
	if ( typeof navigator == 'undefined' || typeof navigator.notification == 'undefined' || typeof navigator.notification.alert == 'undefined' ) {
		alert( str );
	}
	else {
		navigator.notification.alert(
			str,
			null,
			'알림',
			'확인'
		);
	}
}



/* 자바스크립트를 동적으로 로드한다.
 *
 * 예)
	add_javascript("https://maps.googleapis.com/maps/api/js?key=AIzaSyBhp5tglxrh4OsdnGaZy5Onkv2j08alWW0&sensor=true");
 */
function add_javascript(file) {
	trace("Adding javascript: " + file);
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = file;
	document.body.appendChild(script);
}


function homepage(url)
{
	if ( is_online() ) {
		var ref = window.open(url, '_blank');
	}
	else {
		message("인터넷을 연결 해 주세요.");
		return;
	}
}


function api_load( data )
{
	if ( ! is_network_online() ) {
		message("인터넷을 연결 해 주세요.");
		return;
	}
	trace("api_load(" + data.url + ")");
	
	/** loader 출력. 이 위치에서 시간차로 로드 하는 것이 그나마 제일 낳다. */
	if ( typeof show_loader == 'function' ) setTimeout(function(){ show_loader(); }, 10);
	
	/** */
	$.ajax({
		type: 'GET',
		url: data.url,
		contentType: "application/json",
		dataType: 'jsonp',
		jsonpCallback: data.callback,
		crossDomain: true,
		success: function ( res ) {
			if ( typeof hide_loader == 'function' ) setTimeout(function(){ hide_loader(); }, 500);
		}
	});
}

function is_android()
{
	if ( is_phonegap() ) {
		var string = device.platform;
		if ( string == 'Android' ) return true;
	}
}
function is_ios()
{
	if ( is_phonegap() ) {
		return false;
	}
}


function page_content( id, data )
{
	$('#' + id + ' .content').html(data);
}
function page_content_prepend( id, data )
{
	$('#' + id + ' .content').prepend(data);
}
function page_content_append( id, data )
{
	$('#' + id + ' .content').append(data);
}

function page_move( id )
{
	$.mobile.changePage('#' + id);
}



function listview_add( selector, data )
{
	var lis='';
	for ( var i = 0; i < data.length; i ++ ) {
		var d = data[i];
		lis += "<li><a href='"+d.url+"'>";
		if ( typeof d.image != 'undefined' && d.image != null && d.image != '' ) {
			lis += "<img src='"+d.image+"'>";
		}
		lis += data[i].content + "</a></li>";
	}
	
	listview_add_html( selector, lis );
}

function listview_add_html( selector, data )
{
	$(selector).append( data ).listview( 'refresh' );
}




/** ajax 로 현재 도메인 또는 파일 스트림의 정보를 로드한다.
	예제: 간단한 데이터를 읽을 때, 굳이 파일 함수를 사용 할 필요가 없다.
	ajax_load( './index.html', function(data){	
		alert(data);
	});
	
 */
function ajax_load( url, callback )
{
	$.ajax({
		url: url,
		success: function(data) {
			trace("success: ajax_load("+url+") ...");
			callback(data);
		},
		error : function(data) {
			trace("ajax_load failed...");
		}
	});
}


function page_header( url )
{
	ajax_load( url, function( data ) {
		$('.header').html(data);
	});
}
function page_footer( url )
{
	ajax_load( url, function( data ) {
		$('.footer').html(data);
	});
}



