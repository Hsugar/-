(function(){
	/**
	 * [validateForm 简单验证表单插件]
	 * @Author   hishion
	 * @Email    mrhainer@qq.com
	 * @DateTime 2018-04-21
	 * @param    {[Object]}        options [配置项,onSuccess为验证成功执行的函数]
	 * example:  
	 * 			$('form').validateForm({
	 *    			onSuccess: function(formData){ console.log(this, formData) },
	 *    			onFail: function(){},
	 *    			formTypes:{ 
	 *    				//配置验证规则,如: <input type="text" data-valid='mobile' data-error="手机号格式不正确"/>
	 *    				mobile: function(mobile){ return mobile.length == 11 }
	 *    			}
	 * 			})
	 */
	$.fn.validateForm = function(options){
		var config = $.extend(true, {
			//验证成功执行的函数
			onSuccess: $.noop,
			//验证失败执行的函数
			onFail: $.noop,
			//表单失去焦点延迟检查,
			blurDealy: 0,
			formTypes: {
				number: function(value){
					return value != '' && Math.abs(value) >= 0;
				},
				/*是否为验证码*/
				code: function(value){
						return value && value.length >= 4;
				},
				/*是否为密码*/
				password: function(value){
					if(!value || value.length < 8){
						return false;
					}
					if(/\d+/i.test(value) == false){
						return false
					}
					if(/[a-z]/i.test(value) == false){
						return false
					}
					return true;
				},
				empty: function(value){
       		return $.trim(value).length > 0;
				},
        /*是否在指定范围内*/
        range: function(num, $input){
        	var min = $input.data('min')*1;
        	var max = $input.data('max')*1;

        	num = num*1;

        	if(min && min > num){
        		return false
        	}
        	if(max && num > max){
        		return false
        	}

        	return true;
        }
			},
		}, options);

		var formTypes = config.formTypes;


		function _error($input){
			var error  = $input.data('error');
			var $error = $input.siblings('.error');

			if($error.length == 0){
				$error = $('<span class="error"></span>').appendTo($input.parent());
			}
			$error.text(error).show();
		}

		function _right($input){
			$input.siblings('.error').empty().hide();
		}


		function isValidForm($form){
			var isValid  = true;
			$form.find('[data-valid]').each(function(){
				var res = isValidInput($(this));

				if(isValid){
					isValid = res;
				}
			});

			return isValid;
		}

		function isValidInput($input){
			var valid = $input.data('valid');
			var value = $.trim($input.val());
			var res   = true;

			if(formTypes[valid]){
				res = formTypes[valid](value, $input);
				if(!res){
					_error($input)
				}else{
					_right($input);
				}
			}else{
				console.log('检查函数 `'+ valid +'` 不存在')
			}
			return res;
		}


		this.on('submit.validateForm', function(e){
			e.preventDefault();

			var $this = $(this);
			if(!isValidForm($this)){
				config.onFail.call(this, $this.serialize());
				return false;
			}
			config.onSuccess.call(this, $this.serialize());
		}).on('click', '[data-submit]', function(e){
			e.preventDefault();

			var $form = $(this).parents('form');

			if(!isValidForm($form)){
				config.onFail.call($form[0], $form.serialize());
				return false;
			}
			config.onSuccess.call($form[0], $form.serialize());

		}).on('blur', '[data-valid]', function(){
			var $input = $(this);

			if(config.blurDealy > 0){
				var blurTimer = setTimeout(function(){
					clearTimeout(blurTimer);
					isValidInput($input);
				}, config.blurDealy);
			}else{
				isValidInput($input);
			}
		})

		return this;
	}


}(jQuery));

