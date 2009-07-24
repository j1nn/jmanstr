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
    }
};

window.addEventListener("load", function(e) { 
    Jmanstr.onLoad(e);
}, false);