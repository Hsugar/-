(function($){
	$.fn.dialog = function(options, callback){

		var $that  = this;
		var config = {
			onClosed: $.noop,//已关闭
			onOpened: $.noop,//已打开
			onWillOpen: $.noop,//正要打开
			onWillClose: $.noop,//正要关闭
			onConfirm: $.noop, //确定
			open: true,
			escExit: true,
			title: '',
		};

		if($.isPlainObject(options)){
			$.extend(config, options);
		}else if(typeof options === 'string'){
			if($.isFunction(callback)){
				config.onOpened = callback;
				config.onClose  = callback;
			}
			if(options === 'open'){
				config.open = true;
			}else if(options === 'close'){
				config.open = false;
			}
		}

		if(config.open === true){
			open();
		}else if(config.open === false){
			close();
		}

		if(config.title){
			$that.find('.dialog-title').text(config.title);
		}
		
		if(config.escExit){
			$(document).off('keyup.dialog')
				.on('keyup.dialog', function(e){
					if(e.keyCode === 27){
						close()
					}
				})
		}

		$that.find('.dialog-close,.btn-cancel')
			.off('click.dialog')
			.on('click.dialog', close);

		$that.find('.btn-confirm')
			.off('click.dialog')
			.on('click.dialog', _confirm);

		function open(){
			config.onWillOpen.call($that);
			$that.fadeIn(config.onOpened);
		}

		function close(){
			config.onWillClose.call($that);
			$that.fadeOut(config.onClose);
		}

		function _confirm(){
			config.onConfirm($that);
			close()
		}

		return $that;
	};
}(jQuery));


/**
 * example
 * $('.dialog').dialog('open') //打开
 * $('.dialog').dialog('close') //关闭
 * $('.dialog').dialog({open:true}) //打开
 * $('.dialog').dialog({open:false}) //关闭
 */
	

