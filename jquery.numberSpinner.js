;(function($){

	$.fn.numberSpinner = function(options){

		var that = this;
				options = options || {};
				
		$(that).each(function(){
			var context= this;
			var $input = $('input', this);
			var $add   = $('.add', this);
			var $reduce= $('.reduce', this);
			var $unitPrice = $('.shop_price',this);
			var max    = $input.data('max');
			var value  = $input.val()*1;
			var min    = Math.min(value, $input.data('min') || 1);
			var step   = $input.data('step')*1 || 1;
			var preVal = value;

			$add.click(function(e){
				value += step;
				setVal();
			});

			$reduce.click(function(e){
				value -= step;
				setVal();
			});

			$input.keyup(function(){
				value = toNumber(this.value);
				if(value !== ''){
					setVal();
				}
			}).blur(function(){
				value = toNumber(this.value);
				if(value === ''){
					value = preVal;
					setVal();
				}
			});

			function toNumber(str){
				return str !== '' ? parseFloat(str) || 0 : '';
			}

			function updateState(){
				var v = toNumber($input.val());

				if(v <= min){
					$reduce.addClass('disabled');
				}else{
					$reduce.removeClass('disabled');
				}
				if(v >= max){
					$add.addClass('disabled');
				}else{
					$add.removeClass('disabled');
				}
			}

			function setVal(){
				if(value > max){
					value = max;
				}else if(value < min){
					value = min;
				}
				if($.isFunction(options.onChange)){
					options.onChange.call(context, value, preVal);
				}

				$input.val(value);

				preVal = value;
				updateState();
			}

			updateState();

		});

		return that;
	}

	//初始化
	/*$('.numberSpinner').numberSpinner({
		onChange: function(value){ 
			console.log('value==',value) 
		}
	});*/

}(jQuery));