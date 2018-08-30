var Tools = (function(){
    function _extend(source, distance){
        for(var attr in distance){
            source[attr] = distance[attr];
        }
        return source;
    }

    var _export = {
        URLS: {
            LOGIN: 'http://newcssp.ztuimedia.com/login.html?logout=1',
        },
        _init: function(){
            this.API_URL = 'mallapi.ztuimedia.com';
            this.initLogin();
            this._ajaxSetup();
            this.initTranslate();
        },
        initLogin: function(){
            var search = this.urlParse().search;
            if(search.token && search.token.length > 20){
                this.setCookie('token_shop', search.token);
            }else if(search.logout){
                this.removeCookie('token_shop');
            }
        },
        /*初始化翻译功能*/
        initTranslate:function(options, defaultLang){
            var urlParams = this.urlParse().search;
            if(urlParams.lang){
                this.setCookie('lang_shop', urlParams.lang);
            }

            var lang = urlParams.lang || this.getCookie('lang_shop') || defaultLang || 'CN';
            var cMaps = {
                CN: '<i class="iconfont cn"></i>中国',
                HK: '<i class="iconfont hk"></i>香港',
                TW: '<i class="iconfont tw"></i>臺灣',
                MO: '<i class="iconfont mo"></i>澳門',
                KR: '<i class="iconfont kr"></i>한국, 한국',
                EN: '<i class="iconfont usa"></i>USA',
            };

            $('.j-language').html(cMaps[lang]);

            if(lang === 'MO' || lang === 'TW'){
                lang = 'HK';
            }
            if(window.translate){
                this.translateInterface = translate(this.extend({lang: lang}, options));
            }
            return this.translateInterface;
        },
        /*获得翻译文本*/
        getTranslation: function(text){
            if(this.translateInterface){
                return this.translateInterface.getTranslationResult(text);
            }else if(window.translate){
                return this.initTranslate().getTranslationResult(text);
            }
            return text;
        },
        /*ajax全局配置*/
        _ajaxSetup: function(){
           /* 
            var langMap = {
                CN: 'zh',
                EN: 'en'
            };
            */
            var token = this.getCookie('token_shop');
            var lang = this.getCookie('lang_shop') || 'CN';
            $.ajaxSetup({
                headers: {
                    'token': token,
                    'Language': lang
                }
            })
        },
        /*ajax针对不同环境请求不同域名*/
        ajax: function(options){
            options.url = location.protocol + '//' + this.API_URL + options.url;

            if(!options.dataType){
                options.dataType = 'json'
            }

            var self = this;
            var _error = options.error;
            var _success = options.success;

            options.error = function(err){
                self.msAlert('系统繁忙,请稍候再试');
                _error && _error(err);
            }

            options.success = function(res){
                /*
                    20014 => '用户登录凭证无效',
                    20015 => '用户登录已经过期',
                    20016 => '验证token失败',
                    13001 => '无效的token'
                    13002 => 'token已过期'
                */
                if(res && (res.code == '20014' || 
                        res.code == '20015' || 
                        res.code == '13001' || 
                        res.code == '13002' || 
                        res.code == '20016')){
                    if(options.tokenInValidUrl){
                        self.redirect(options.tokenInValidUrl);
                    }
                    self.removeCookie('token_shop');
                }
                _success(res);
            }

            $.ajax(options);
        },
        /*ajax get环境处理*/
        get: function(){
            if(arguments[0].indexOf('http') == -1){
                arguments[0] = location.protocol + '//' + this.API_URL + arguments[0];
            }
            $.get.apply($, arguments);
        },
        /*ajax post环境处理*/
        post: function(){
            if(arguments[0].indexOf('http') == -1){
                arguments[0] = location.protocol + '//' + this.API_URL + arguments[0];
            }
            $.post.apply($, arguments);
        },
        redirect: function(url, delay){
            if(location.host.indexOf('localhost') !== 0){
                if(delay>0){
                    setTimeout(function(){
                        location.href = url;
                    }, delay);
                }else{
                    location.href = url;
                }
            }else{
                console.warn('redirect:', url);
            }
        },
        /*url分析*/
        parseUrl: function(url){
            url = url || location.href;
            var uri = {
                origin: null, //http://www.baidu.com
                domain: null, //baidu.com
                host: null //www.baidu.com
            };
            var match = url.match(/^(http:\/\/|https:\/\/)*([^\/]+)/g);
            var ret = [];

            if(match){
                uri.origin = match[0];
                ret = uri.origin.split('//');
                ret.reverse();
                uri.host = ret[0];
                uri.domain = this.getDomain(uri.host);
            }

            return uri;
        },
        /*获得主域名 www.baidu.com => baidu.com */
        getDomain: function(host){
            //if(this.is_dev)return null;
            var _hostname = (host || location.host).replace(/\:\d+/, '').split('.');
            var n = _hostname.length;

            for(var i = n; i > 2; i--){
                _hostname.shift();
            }
            return _hostname.join('.').replace(/[\/|\?].*/,'');
        },
        /*
            /a/b.html => b
        */
        dirname: function (filename){
            return ((filename || '').split('/').reverse()[0] || '').split('.')[0] 
        },
        urlParse: function(){
            var search = (location.search  || '').substr(1).split('&');
            var searchObj = {};

            if(search){
                for(var i = 0; i < search.length; i++){
                    var ret = search[i].split('=');
                    searchObj[ret[0]] = ret[1] || '';
                }
            }
            return {
                search: searchObj,
                dir: this.dirname(location.pathname)
            }
        },
        getEmailUrl: function (email){
            var hash={
                'qq.com':'http://mail.qq.com',
                'gmail.com': 'http://mail.google.com',
                'sina.com': 'http://mail.sina.com.cn',
                '163.com': 'http://mail.163.com',
                '126.com': 'http://mail.126.com',
                'yeah.net': 'http://www.yeah.net/',
                'sohu.com': 'http://mail.sohu.com/',
                'tom.com': 'http://mail.tom.com/',
                'sogou.com': 'http://mail.sogou.com/',
                '139.com': 'http://mail.10086.cn/',
                'hotmail.com': 'http://www.hotmail.com',
                'live.com': 'http://login.live.com/',
                'live.cn': 'http://login.live.cn/',
                'live.com.cn': 'http://login.live.com.cn',
                '189.com': 'http://webmail16.189.cn/webmail/',
                'yahoo.com.cn': 'http://mail.cn.yahoo.com/',
                'yahoo.cn': 'http://mail.cn.yahoo.com/',
                'eyou.com': 'http://www.eyou.com/',
                '21cn.com': 'http://mail.21cn.com/',
                '188.com': 'http://www.188.com/',
                'foxmail.coom': 'http://www.foxmail.com'
            };
            if(!email)return null;
            var host = email.split('@');
            return hash[host[1]] || null;
        },
        getCookie: function(name, value){
            var cookies = document.cookie;
            if(cookies.indexOf(name) < 0)return null;
            var res = null;
            var arr = cookies.split('; ');
            for(var i = 0; i < arr.length; i++){
                var ret = arr[i].split('=');
                if(ret[0] == name){
                    res = unescape(ret[1]);
                }
            }
            return res;
        },
        /*缓存token*/
        setCookie: function (name, value, expires, domain){
            var oDate  = new Date();
                domain = domain || this.getDomain();

            if(expires){
                oDate.setTime( oDate.getTime() + expires*1000 )
            }
            document.cookie = [
                name + "=" + escape(value),
                expires ? 'expires' + '=' + oDate.toGMTString() : '',
                'path=/',
                domain ? 'domain=' + domain : ''
            ].join('; ');
        },
        /*删除域名cookie*/
        removeCookie:function(name){
            this.setCookie(name, null, -1);
        },
        msAlert: function(msg){
            msg = this.translateInterface ? this.translateInterface.getTranslationResult(msg) : msg;
            if(window.jqueryAlert){
                jqueryAlert({
                    'content' : msg,
                    'closeTime' : 2000,
                });
            }else{
                alert(msg);
            }
        },
        /* a=1&b=2 => {a:1,b:2} */
        parseSerialize:function (str){
            if(!str)return str;
            var arr = String(str).split('&');
            var res = {};

            for(var i = 0; i < arr.length; i++){
                var ret = arr[i].split('=');
                res[ret[0]] = ret[1];
            }

            return res;
        },
        extend: _extend,
        /*保留指定小数位*/
        toFixed:function(num, n){
            var nub = num * 1;
            n = typeof n !== 'undefined' ? n : 2;
            if(isNaN(nub)){
                return num
            }
            return nub.toFixed(n);
        },
        /**
         * [fillZero 补零]
         * @Author   hishion
         * @Email    mrhainer@qq.com
         * @DateTime 2018-04-20
         * @return   {[String]}        [补零后的结果]
         */
        fillZero: function(num, n){
            n = n || 2;
            if(num >= Math.pow(10,n-1))return num;
            return ((new Array(n+1)).join(0) + num).slice(-n)
        },

        /**
         * [dateFormat 时间格式化]
         * @Author   hishion
         * @Email    mrhainer@qq.com
         * @DateTime 2018-04-20
         * @param    {[type]}        time   [时间戳]
         * @param    {[type]}        format [要转换的格式]
         * @return   {[type]}               [返回转换后的时间]
         */
        dateFormat: function(time, format){
            var format = format || 'yy-mm-dd hh:ii:ss';
            var date = new Date(time);

            if (!date || date.toUTCString() == "Invalid Date") {
                return time;
            }

            var map = {
                "yy": date.getFullYear(),
                "mm": date.getMonth() + 1, //月份
                "dd": date.getDate(), //日
                "hh": date.getHours(), //小时
                "ii": date.getMinutes(), //分
                "ss": date.getSeconds() //秒
            };

            format = format.replace(/([ymdhis]+)/g, function(all, t){
                return Tools.fillZero(map[t]);
            });

            return format;
        },


        
        /**
         * [formatTime 格式化时间,传入的数字大于0即可]
         * @Author   hishion
         * @Email    mrhainer@qq.com
         * @DateTime 2018-04-20
         * @param    {[Number]}        time   [大于0即可,单位为秒]
         * @param    {[String]}        format [格式语法,可选]
         * @param    {[Boolean]}       isFillZero [格式语法,可选]
         * @return   {[type]}               [返回格式后的结果]
         */
        formatTime: function(time, format, isFillZero){
            if(isNaN(time)){
                return time;
            }

            if(time < 0){
                time  = 0;
            }

            format = format || 'hh时ii分ss秒';
            isFillZero = isFillZero || true;

            var d = Math.floor(time/3600/24);//天
            var h = Math.floor((time - d*3600*24)/3600);//小时
            var i = Math.floor((time - d*3600*24 - h*3600)/60) //分钟
            var s = Math.floor(time - d*3600*24 - h*3600 - i*60);

            var timeMap = {
                dd: d,
                hh: h,
                ii: i,
                ss: s
            };

            var self = this;

            format = format.replace(/([his]+)/g,function(a,t){
                return self.fillZero(timeMap[t]);
            });

            return format;
        },
        /**
         * [countDown 倒计时函数]
         * @Author   hishion
         * @Email    mrhainer@qq.com
         * @DateTime 2018-04-21
         * @param    {[Number]}        time   [倒计时所需的时间单位为秒]
         * @param    {[Function]}        update [第一秒更新执行的回调]
         * @param    {[Function]}        over   [倒计时结束的回调]
         */
        countDown: function(time, update, over){
            var timer = null;
            var self  = this;
            var _arg  = arguments;

            update && update(time);

            if(!time || time <= 0){
                over && over(time);
            }else{
                time--;
                timer = setTimeout(function(){
                    clearTimeout(timer);
                    self.countDown.apply(self, _arg);
                }, 1000);
            }
        },

        /**
         * [sendMSM 发送短信, 类名为.btn-sms将自动绑定发送短信功能]
         * @Author   hishion
         * @Email    mrhainer@qq.com
         * @DateTime 2018-04-21
         * @param    {[Number]}        type [发送短信的type,默认取元素的data-type值]
         * @param    {[Number]}        time [发送短信间隔时间,倒计时,默认取元素的data-time值]
         */
        sendMSM: function(type, time){
            var self = this;
            $('body').on('click', '.btn-sms', function(){
                var $this = $(this);
                var type  = type || $this.data('type');
                
                if($this.hasClass('disabled'))return;
                if(type){
                    doSendSMS(type, $this)
                }
            }).on('click', '.btn-email', function(){
                var $this = $(this);
                var type  = type || $this.data('type');
                var code  = $this.data('code');
                if($this.hasClass('disabled'))return;
                if(type && code ==='email'){
                    doSendEmail(type, $this)
                }
            })

            function counttime($element){
                if($element.size() == 0)return;

                var nodeName    = $element[0].nodeName.toLowerCase();
                var method      = 'text';
                var defaultVal  = '';

                time  =  time || $element.data('time') || 60;

                if(nodeName == 'input' || nodeName == 'button'){
                    method      = 'val';
                    defaultVal  = $element.val();
                }else{
                    defaultVal  = $element.text();
                }

                Tools.countDown(time, function(time){
                    $element[method](time + 's').addClass('disabled')
                }, function(){
                    $element[method](defaultVal).removeClass('disabled')
                })
            }
            
            function doSendSMS(type, $element){
                Tools.ajax({
                    url: '/send/sms',
                    type: 'post',
                    data: {type: type},
                    success: function(res){
                        if(res && res.code == '0'){
                            counttime($element);
                        }else{
                            Tools.msAlert(res.msg);
                        }
                    }
                })
            }

            function doSendEmail(type, $element){
                Tools.ajax({
                    url: '/api/user/email',
                    type: 'post',
                    data: {type: type},
                    success: function(res){
                        if(res && res.code == '0'){
                            counttime($element);
                        }else{
                            Tools.msAlert(res.msg);
                        }
                    }
                })
            }
        },

        /**
         * [toNumber 转数字]
         * @Author   hishion
         * @Email    mrhainer@qq.com
         * @DateTime 2018-04-21
         * @param    {[String]}        str [要转换的字符串]
         */
        toNumber:function(str){
            if(!str)return str;
            var match = String(str).match(/(\d+\.{0,1}\d*)/);
            if(match && String(match[0]).indexOf('.')>-1){
                return match[0];
            }
            return match ? match[0]*1: 0;
        },

        /*是否登录*/
        isLogin: function(){
            var token = this.getCookie('token_shop');
            return token && token !== 'undefined' && token !== 'null';
        }

    };

    _export._init();


    return _export;

}());













