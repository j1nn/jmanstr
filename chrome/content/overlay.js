var Jmanstr = {
    onLoad: function() {
        // initialization code
        this.initialized = true;
    },

    jmsShortSearch: function() {
        var selected = this.jmsGetSelection();
        //nothing selected == nothign to do
        if(selected == ''){
            return;
        }

        //filter masked chars from the string
        selected = this.jmsFormatLang(selected);

       

        
        var query = selected;
        return;

        var REF_URI = Components.Constructor("@mozilla.org/network/standard-url;1", "nsIURI");
        var REF = new REF_URI;
        var newTab = getBrowser().addTab("http://www.google.com/search?q=" + query, REF, null, null);
        //getBrowser().selectedTab = newTab; - to get focus
    },
  
    jmsSpecialSearch: function() {
        window.open("chrome://jmanstr/content/jmanstr.xul", "jmAnstr enchanced search", "chrome");
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
                curChar = this.transfer(curChar, transToEn);
            }
            formatted += curChar;
        }

        return formatted;
    },
    jmsGetSelection: function(){
        var focused_window = document.commandDispatcher.focusedWindow;
        var sel_text = focused_window.getSelection();
        return sel_text.toString();
    },
    isen: function(code){
        return (code >= 65 && code <= 122);
    },
    isru: function(code){
        return (code >= 1040 && code <= 1103);
    },
    transfer: function(c, toEn){
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
    }

};

window.addEventListener("load", function(e) { 
    Jmanstr.onLoad(e);
}, false);