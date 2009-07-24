var Jmanstr = {
    onLoad: function() {
        // initialization code
        this.initialized = true;
    },

    jmsShortSearch: function(format) {
        var query = this.jmsGetSelection();
        //nothing selected == nothign to do
        if(query == ''){
            return;
        }

        //filter masked chars from the string
        if(format){
            query = this.jmsFormatLang(query);
        }

        this.jmsGoogle(query);
    },
    jmsGoogle: function(query, win){
        if(win == undefined || win == null){
            win = window;
        }

        var REF_URI = Components.Constructor("@mozilla.org/network/standard-url;1", "nsIURI");
        var REF = new REF_URI;
        var newTab = win.getBrowser().addTab("http://www.google.com/search?q=" + query, REF, null, null);
        //getBrowser().selectedTab = newTab; - to get focus
    },
    jmsSpecialSearch: function() {
        var selected = this.jmsGetSelection();
        window.open("chrome://jmanstr/content/jmanstr.xul", selected, "chrome");
    },
    jmsFill: function(){
        var selected = window.name;
        //fill in all fields with our string
        var fields = document.getElementsByClassName('field');
        for(var i in fields){
            fields[i].value = selected;
        }
    },
    jmsRunTransfers: function(){
        var checks = document.getElementsByClassName('field-check');
        var cur,field;
        for(var i in checks){
            cur = checks[i];
            if(cur.checked){
                field = document.getElementById(cur.id + '-string');
                field.value = this.jsmDispatchTransfer(cur.id, field.value);
                cur.checked = false;
            }
        }
    },
    jsmDispatchTransfer: function(what, value){
        switch(what){
            case 'rev':
                return value.split('').reverse().join('');
            case 'en':
                return this.toEn(value);
            case 'ru':
                return this.toRu(value);
            case 'nc':
                return this.jmsFormatLang(value);
            case 'abcen':
                return this.jmsAbc(value, true, true, true);
            case 'abcru':
                return this.jmsAbc(value, false, true, true);
            case 'rabcen':
                return this.jmsAbc(value, true, false, true);
            case 'rabcru':
                return this.jmsAbc(value, false, false, true);
            case 'mvl':
                return this.jmsMoveAbc(value, true);
            case 'mvr':
                return this.jmsMoveAbc(value, false);
            case 'enkrl':
                return this.jmsKeyboard(value, false, true);
            case 'enklr':
                return this.jmsKeyboard(value, true, true);
            case 'rukrl':
                return this.jmsKeyboard(value, false, false);
            case 'ruklr':
                return this.jmsKeyboard(value, true, false);
        }
        return value;
    },
    jmsGoogleTransfers: function(){
        var checks = document.getElementsByClassName('field-check');
        var cur,field;
        for(var i in checks){
            cur = checks[i];
            if(cur.checked){
                field = document.getElementById(cur.id + '-string');
                this.jmsGoogle(field.value, window.opener);
            }
        }
    },
    jmsFormatLang: function(string){
         //part 1: collect ascii stats
        var len = string.length;
        var curChar, curCode;
        var enChars = 0;
        var ruChars = 0;
        for(var i = 0; i < len; ++i){
            curCode = string.charCodeAt(i);
            if(this.isen(curCode)){
                ++enChars;
            }
            else if(this.isru(curCode)){
                ++ruChars;
            }
        }

        //if the number is equal, consider as russian text
        var transToEn = (enChars > ruChars)?true:false;

        var formatted = '';
        for(i = 0; i < len; ++i){
            curCode = string.charCodeAt(i);
            curChar = string.charAt(i);
            if((this.isru(curCode) && transToEn) || (this.isen(curCode) && !transToEn)){
                curChar = this.recode(curChar, transToEn);
            }
            formatted += curChar;
        }

        return formatted;
    },
    jmsGetSelection: function(){
        var win = document.commandDispatcher.focusedWindow;
        var sel_text = win.getSelection();
        return sel_text.toString();
    },
    isen: function(code){
        return (code >= 65 && code <= 122);
    },
    isru: function(code){
        return (code >= 1040 && code <= 1103);
    },
    recode: function(c, toEn){
        //first letter - en, second one - ru
        var jmsSringFormatChars = {'e':'\u0435','t':'\u0442','y':'\u0443','u':'\u0438',
                                    'o':'\u043e','p':'\u0440','a':'\u0430','g':'\u0434',
                                    'k':'\u043a','x':'\u0445','c':'\u0441','E':'\u0415',
                                    'T':'\u0422','Y':'\u0423','U':'\u0418','O':'\u041e',
                                    'P':'\u0420','A':'\u0410','D':'\u0414','H':'\u041d',
                                    'K':'\u041a','X':'\u0425','C':'\u0421','B':'\u0412',
                                    'M':'\u041c'};
        for(var x in jmsSringFormatChars){
            if(toEn && jmsSringFormatChars[x] == c){
                return x;
            }
            else if(x == c){
                return jmsSringFormatChars[x];
            }
        }
        return c;
    },
    selectAll: function(){
        var checks = document.getElementsByClassName('field-check');
        for(var i in checks){
            checks[i].checked = !checks[i].checked;
        }
    },
    toEn: function(st){
        var len = st.length;
        var ret = new Array(len);
        var cur = '';
        for(var i = 0; i < len; ++i){
            cur = st.charCodeAt(i);
            if(this.isru(cur)){
                cur -= 985;
            }
            ret[i] = String.fromCharCode(cur);
        }
        return ret.join('');
    },
    toRu: function(st){
        var len = st.length;
        var ret = new Array(len);
        var cur = '';
        for(var i = 0; i < len; ++i){
            cur = st.charCodeAt(i);
            if(this.isen(cur)){
                cur += 985;
            }
            ret[i] = String.fromCharCode(cur);
        }
        return ret.join('');
    },
    findDelimiter: function(st){
        var len = st.length;
        var letters = st.split('');
        var stats = new Array();
        var cur;
        var regex = /^([a-z]|[0-9])$/i;
        //collect info
        for(var i = 0; i < len; ++i){
            cur = letters[i];
            //interested in non-AB and non-numeric chars only
            if(!regex.test(cur)){
                if(stats[cur] == undefined || stats[cur] == null){
                    stats[cur] = 0;
                }
                ++stats[cur];
            }
        }
        //choose delimiter
        var max = 0;
        var delim = '';
        for(var x in stats){
            if(stats[x] > max){
                max = stats[x];
                delim = x;
            }
        }

        return delim;
    },
    numToChar: function(num, diff, asc, total){
        if(isNaN(num)){
            return num;
        }
        if(asc){
            return String.fromCharCode(parseInt(num) + diff);
        }
        else{
            return String.fromCharCode(total - parseInt(num) + diff);
        }
    },
    charToNum: function(c, diff, asc, total){
        if(!isNaN(c)){
            return c;
        }
        if(asc){
            return c.charCodeAt(0) - diff;
        }
        else{
            return total - (c.charCodeAt(0) - diff);
        }
    },
    jmsAbc: function(st, en, asc, numToLet){
        var delim = this.findDelimiter(st);
        var nums = st.split(delim);
        var diff = 96;//en
        var total = 27;
        //get lang from first char
        if(!en){
            diff = 1071;//ru
            total = 33;
        }
        var cur;
        var res = new Array();
        for(var i in nums){
            cur = nums[i];
            if(numToLet){
                res[i] = this.numToChar(cur, diff, asc, total);
            }
            else{
                res[i] = this.charToNum(cur, diff, asc, total);
            }
        }

        return res.join('');
    },
    jmsMoveAbc: function(st, left){
        var params = st.split(',');
        st = params[0].toLowerCase();
        var move = parseInt(params[1]);
        if(move == undefined || isNaN(move)){
            move = 1;
        }
        if(left){
            move *= -1;
        }


        var en = true;
        if(this.isru(st.charCodeAt(0))){
            en = false;
        }
        var nums = this.jmsAbc(st, en, true, false);
        
        var len = nums.length;
        var res = new Array(len);
        for(var i = 0; i < len; ++i){
            res[i] = parseInt(nums[i]) + move;
        }

        return this.jmsAbc(res.join('-'), en, true, true);
    },
    calcKeyboardRows: function(nums){
        var res = new Array();
        var len = nums.length;
        for(var i = 0; i < (len - 1); ++i){
            res[i / 2] = parseInt(nums[i]) * parseInt(nums[i + 1]);
        }
        return res;
    },
    jmsKeyboard: function(st, simpleCount, en){
        var delim = this.findDelimiter(st);
        var nums = st.split(delim);
        if(!simpleCount){
            if(nums.length % 2 != 0){
                return 'error: odd number of the numbers';
            }
            nums = this.calcKeyboardRows(nums);
        }
        if(en){
            var kmap = new Array('q','w','e','r','t','y','u','i','o','p','a','s','d',
                                'f','g','h','j','k','l','z','x','c','v','b','n','m');
        }
        else{
            kmap = new Array('\u0439','\u0446','\u0443','\u043a','\u0435','\u043d','\u0433',
                            '\u0448','\u0449','\u0437','\u0445','\u044a','\u0444','\u044b',
                            '\u0432','\u0430','\u0440f','\u043e0','\u043e','\u043b','\u0434',
                            '\u0436','\u044d','\u044f','\u0447','\u0441','\u043c','\u0438',
                            '\u0442','\u044c','\u0431','\u044e');
        }
        var res = new Array();
        var len = nums.length;
        for(var i = 0; i < len; ++i){
           res[i] = kmap[nums[i]];
        }
        return res.join('');
    }
};

window.addEventListener("load", function(e) { 
    Jmanstr.onLoad(e);
}, false);