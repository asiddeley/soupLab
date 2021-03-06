/**********************************
S iddeley's
O pen
U tility
P ackage

Andrew Siddeley
20-Sep-2017
********************************/

window.AIengine=function(options){
	
	if (this===window) {return new AIengine(options);};

	
	/////////////////////////////////////////////////////////
	//STORAGE
	this.data={};
	this.inits={};
	this.fn={};
	this.paTokens=[]; //["["function(words){return true;}, "hello",...][...][...]]
	
	////////////////////////////////////////
	this.ask=function(inputStr){
		var a=this.match(inputStr);
		if (a) {return a;} else return "nada";
		
	};
	
	///////////////////////////////////////////////////////////////////
	this.fn.isitin=function(item,list){return this.fn.memberof(item,list);};
	this.fn.memberof=function(item, list_hash){
		//list checker
		//returns true if item is in the list AKA Array
		if ( list_hash instanceof Array){
			return (list_hash.indexOf(item)!=-1);
		} 
		else if (typeof list_hash=="object") {
			return (Object.keys(list_hash).indexOf(item)!=-1);
		}
		else return false;
	};

	this.fn.hashval=function(item, hash){
		return hash(item);		
	};
	
	this.groom=function(str){
		//grooming returns a clean string
		str=str.replace(/\]/g,"] "); //ensures good separation at brackets
		str=str.replace(/\.\s/g," . "); //ignores [...] and chaining periods such as www.com
		//TO DO - ampersand&, comma, exclamation!, question mark?, quote"  
		return str;
	};
	
	////////////////////////////////////////	
	this.match=function(inputStr){
		var that=this;
		var answer;
		this.matchInputStr=this.groom(inputStr);
		//[].some stops at first true, needs false to continue
		this.matchp=this.paTokens.some(function(pa, i){
			answer=pa.a;
			//patternResult=that.matchMap(pair.pattern, this.inputStr, 0);
			return that.matchMap(pa);
		});
		if (this.matchp) {return answer;} 
	};
	
	this.matchExec=null; //current regex.exec() result as a [] or null if nomatch
	this.matchInputStr=""; //current input string for matching
	this.matchTerm=""; //current regex capture group ie. matchExec[1]..[n]
	this.matchPred=false; //true or false - predicate result
	
	this.matchMap=function(pa){
		//pattern	{predicates:[fn1, fn2...], regexp:/(term1)(term2)(term3)/}
		//where		a term may be a wildcard at location of predicate such a list checker
		//input  	[word1, word2...]
		//result	[1,1,1,1,0]
		//return	[{head}, {term result}, {term result}...]
		//Example 	[{pattnum:1, match:true, score:0.95}, {term:noun, target:cat, match:true}...]
		var pattern=pa.p;
		var matchp=false;		
		var that=this;
		this.matchExec=pattern.regexp.exec(this.matchInputStr);
		console.log("MATCHING:", pattern.regexp.toString(),"==",that.matchInputStr, (this.matchExec)?"YES":"NO")

		//eg. [0]=matching string, [1]..[n]=matched terms, ["index"]=match index in string
		
		//Regex Matches
		if (this.matchExec!=null){
			//Returns true only if all predicates are true. 
			//Also returns true if the predicates array if empty which is good
			matchp=pattern.predicates.every(function(p,i,a){
				that.matchTerm=that.matchExec[i+1];
				//predicates return true/false
				//predicate functions contain functions such as 
				//that.fn.memberof(this, this.matchTerm) or
				//that.fn.runToken(token);
				//so always pass aiEngine context to predicates
				console.log("PREDICATE TESTING:", that.matchTerm)
				return p.call(that);
			});	
		}
		return matchp;
		//return {mr:matchExec, pr:matchp}
	};

	///////////////////////////////////////////////////
	this.readPairs=function(element){
		var pairs$=$(element);
		var that=this;
		var p$=pairs$.children("p");
		var a$=pairs$.children("a");
		var i$=pairs$.children("i");
		var r$=pairs$.children("r");
		if (p$.length!=a$.length){console.log("Error, P-A elements not paired"); return;}
		if (i$.length!=r$.length){console.log("Error, I-R elements not paired"); return;}
		p$.map(function(index, element){
			that.tokenizePA($(element).html(), $(a$[index]).html());		
		});
		i$.map(function(index, element){
			that.tokenizeIR($(element), $(r$[index]));	
		});
	};
	
	//////////////////////////////////////
	this.runToken=function(tokenOrKey){
		var that=this;
		//var t=(typeof tokenOrKey=="string")?this.storeTokenBank[tokenOrKey]:tokenOrKey;
		var t=(typeof tokenOrKey=="string")?JSON.parse(tokenOrKey):tokenOrKey;

		if (t.token=="function") {
			var fn=this.inits["$"+t.label];
			if (typeof fn != "undefined"){
				var m=t.args.map(function(a, i){
					if (a.token=="function"){
						return that.runtoken(token);
					}
				});
				//evaluate and return 
				//return fn.call(this, m); //how to convert array to arguments?
				return fn.apply(this, m);
			} else {
				console.log("Error, undefined function or value in pattern/answer;","$"+t.label);
			}
		} else if (t.token=="variable"){
			//retrieve previously defined value and return
			return this.ii["$"+t.label];
		}
	};
	
	//Deprecated, using JSON.parse and JSON.stringify instead
	this.storeToken=function(token){
		var key="token"+this.tokenCount.toString();
		this.tokenCount+=1;
		this.tokenBank[key]=token;
		return key;
	};
	this.tokenBank={}; 
	this.tokenCount=0;
	///////////////////
	
	this.tokenizePA=function(pattern, antiphon){
		//adds a word pattern to wordMatcher
		//[...] hello [punc] my name is [properNoun arg1][...]
		//this.pairs.push({pattern:this.groom(patternStr), response:response});
		this.paTokens.push({token:"PA", p:this.tokenizeP(pattern), a:this.tokenizeA(antiphon), r:null});
	};
	
	this.tokenizeA=function(antiphon){
		//TO DO - expand this



		
		
		return antiphon;
	};
	
	this.tokenizeIR=function(left$, right$){
		//eg. ("[noun]", "[person] [place] [thing] monolito ")
		//resolve definitions here, not at match time! 
		//if definition is a function, make sure it returns T/F within 6 recurrsions then store it.
		//if definition is a string and a function seed, prepare the function and store.
		//that should cover all cases.
		var left=left$.text();
		var spliter=/[,\s]+/;
		var that=this;
		if (false) {
			//some sort of check, ie. already defined
			console.log("Syntax error - text/string arguments expected"); 
			return null;
		}
		else if (typeof right$.attr("function")!="undefined") { 
			//console.log("define right$, attr",right$.text(),right$.attr("function"));
			var arga=right$.attr("function").split(spliter);
			var code="try{ "+right$.text()+"} catch(er) {console.log(er);}"; 
			var func;
			switch (arga.length){
				case 0:func=new Function(code);break;
				case 1:func=new Function(arga[0],code);break;
				case 2:func=new Function(arga[0],arga[1],code);break;
				case 3:func=new Function(arga[0],arga[1],arga[2],code);break;
				default:func=new Function(arga[0],arga[1],arga[2],arga[3],code);
			}
			this.inits[left]=func;
			console.log("INIT FUNCTION:", left, "AS:", func);
		}
		else if (typeof right$.attr("list")!="undefined") {
			var list=right$.text().replace(/\s+/g,",");
			var code="var i=-1; try{ i=['"+ list + "'].indexOf(word);} catch(er) {console.log(er);}; return (i==-1)?false:true;"; 
			this.inits[left]=new Function("word", code);
			console.log("INIT LIST:", left, "AS:",list);
		}
	};

	this.tokenizeP=function(pstr){
		//Parses pattern string pstr and returns a token with predicates[] and Regexpes
		//pstr Eg. "$isBotmaster [noun] is * a *"
		//pstr profile "$predicate $predicate() is * a *"
		//pstr eg. has 6 terms, term 1, 2, 4 & 6 have regex wildcards
		//For pattern to match, all predicates and regexp must be true. 
		//returns {predicates:[], regexp:RegExp}
		var predicates=[];
		var regexp="";
		var word="(\\w+\\s+)"; //regex capture group for a word
		var nada="()"; //regex capture group to act as a predicate placeholder
		var star="(.*)"; //regex capture group to act as a wildcard for a list tesing predicate
		var flag="i"; //ignore case, global, multiline
		var that=this;
		var terms=pstr.split(" ");		
		var profile=terms.map(function(term, index, arr){
			if (term.charAt(0)=="$"){
				var v=that.tokenizeValu(term);
				if (v.token != null) {
					//handles functions and variables - with storeToken and runToken aka runt
					//TO DO create this.run() and this.storeArgs()
					//var runner=new Function("return this.tokenRun('"+that.storeToken(v)+"');");
					var runner=new Function("return this.runToken('"+JSON.stringify(v)+"');");
					predicates.push(runner);
					regexp+=nada;
					return v; //"$predicateFn";
				}
			}
			else if (term.charAt(0)=="[") {
				//[list] - list wrapper
				//eg. term="[nouns]", ai.defs["[nouns]"]=["person","place"]
				predicates.push(new Function(
					//inList(item, list); //returns true if item in list
					"return this.fn.memberof(this.matchTerm, this.inits['"+term+"']);"
				));
				regexp+=word;
				return "[list or hash]";
			}
			else if (term.charAt(0)=="*") {regexp+=star; return "*wildcard";}
			else {regexp+="("+term+"\\s)"; return "specific_word";}
		});
		console.log("PROFILE:", JSON.stringify(profile));
		return {token:"P", predicates:predicates, regexp:new RegExp(regexp, flag)};
	};
	
	/***************
	Following funcitons search input string for expected syntax and return tokens if found
	consider the example string below from pattern tags <p>...syntax...</p> 
	expression="$predicateFn(hello,1,$num,$hello(world))..."
	tokenized={token:"function", label:"$predicateFn", args=[
	{token:"literal", literal:"hello"...},
	{token:"num", num:1...}...
	]...}
	******************/
	this.tokenizeArgs=function(str){
		var limit=10; //no more than 10 arguments
		var t={token:null, args:[], tokends:null, index:str.length, span:0, rest:str};
		var x=this.tokenizeBetween(str);
		var a=x.between; //the content between ( and corresponding )

		while (x.token && (0 < a.length) && limit > 0){
			var best=null;
			//console.log("PARSE BETWEEN:",a);
			var possibilities=[
				this.tokenizeNum(a),
				this.tokenizeValu(a),
				this.tokenizeLiteral(a)
			];
			//console.log("POSSIBILITES:",JSON.stringify(pp));
			var best=possibilities.reduce(function(best, p){
				if (best){
					if (best.token && p.token){return (p.index < best.index)?p:best;}
					return best;
				} else return p;
			});
			//console.log("WINNER:",best.token);
			if (best.token){
				t.token="args";
				t.args=t.args.concat([best]); //t.args is a list of tokens
				t.index=x.index; //index of first arg
				t.span+=best.span;
				//chop off part of string that's been processed before searching for more args
				//unexpected behaviour... "hello".substring(4,5) returns "o", not "" as expected
				if (best.index + best.span >= a.length) {a="";}
				else {a=x.between.substring(best.index+best.span);}				
			} else {
				console.log("Syntax error in function arguments. Expected a number, value or literal.");
			}
			limit-=1; //countdown
		};
		return t;
	};
	
	this.tokenizeBetween=function(str, opener, closer){
		if (typeof opener=="undefined") {opener=/\(/;}
		if (typeof closer=="undefined") {closer=/\)/;}
		var r={token:null, between:null, tokend:null, index:str.length, span:0, rest:str};
		var x=opener.exec(str); //find first opener eg. (
		if(x){
			var i=x["index"]+1;
			var c, t=1;
			while(i<str.length && t!=0){
				c=str.charAt(i);
				//keep track of corresponding closing parenthesis
				if (closer.test(c)) {t-=1;} else if (opener.test(c)) {t+=1;}
				i++;
			};		
			if (t!=0){
				console.log("Error in $function in pattern/answer. Impaired parentheses '(..(..)'");
				return r;
			};
			r.token="between";
			r.between=str.substring(x["index"]+1,i-1); 
			r.tokend=[opener, closer]; 
			r.index=x["index"];
			r.span=i-x["index"];
			r.rest=str.substring(i); //i points at the begining of rest
			//console.log("BETWEEN str:",str,"between:",r.between);
		} 
		return r;
	};
	
	this.tokenizeComma=function(str){
		var t={token:null, comma:null, tokend:null, index:str.length, span:0, rest:str};
		var x=str.indexOf(","); 
		if(x!=-1){t.token="comma";t.comma=",";t.index=x;t.span=1;t.rest=str.substring(x+1);} 
		return t;		
	};
	
	this.tokenizeLabel=function(str){
		var t={token:null, label:null, tokend:null, index:str.length, span:0, rest:str};
		var x=/\w+[\w\d\.]*/.exec(str); 
		if(x){t.token="label";
			t.label=x[0];
			t.index=x["index"];
			t.span=x[0].length;
			t.rest=str.substring(x["index"]+x[0].length);
		}
		return t;		
	};
	
	this.tokenizeLiteral=function(str){
		//TO DO improve this regexp, literals should include !@%&_+- but not []()$#
		var t= {token:null, literal:null, tokend:null, index:str.length, span:0, rest:str};
		var x=/[\w\d]+/.exec(str); 
		if(x){ 
			t.token="literal";
			t.literal=x[0]; 
			t.index=x["index"];
			t.span=x[0].length;
			t.rest=str.substring(x["index"]+x[0].length);
		}
		return t;	
	};
		
	this.tokenizeNum=function(str){
		var t={token:null, num:null, tokend:null, index:str.length, span:0, rest:str};	
		//var x=/[\+\-]*\d+\.*\d+/.exec(str); // +-integer, +-real
		var x=/\+*\-*\b(\d*)\.*\d+/.exec(str); // +-integer, +-real
		if (x){
			t.token="num";
			t.num=x[0];
			t.tokend=null;
			t.index=x["index"];
			t.span=x[0].length;
			t.rest=str.substring(x["index"]+x[0].length);
		}
		return t;
	};

	this.tokenizeValu=function(str){
		/*****************
		Parses str for a valuable and returns a token object such as;
		{token:"$", label:"hello", args:[1,"hello", "$world"], tokend:"", index:1, rest:"..."} 
		Valuable is a variable or function that is meant to be evaluated to get a value, Eg;	
		$abc1 - variable
		$abc(1, hello, $world, $fn(1)) - function with 4 args, number, string, var & function
		***************/
		var t={token:null, label:null, args:[], tokends:null, index:null, span:0, rest:str};
		var x=/\$/.exec(str); //string
		if (x){		
			var l=this.tokenizeLabel(str); //l= {label:"fname", index:1, rest:"..."}
			var c=this.tokenizeComma(l.rest); //c= {token:"comma"... index:6, rest:"..."}
			var a=this.tokenizeArgs(l.rest); //result 2={rawArgs:[arg1, arg2], index:12, rest:rest}
			//console.log("PARSE VALU:", l.rest);
			//console.log("a.token:",a.token,"&& a.index:",a.index,"< c.index:", c.index);
			//console.log("ARGS:", JSON.stringify(a.args));
			if (a.token && (a.index < c.index)){
				//arguments found and they occur before a comma
				t.token="function";
				t.label=l.label;
				t.args=t.args.concat(a.args);
				t.tokends=["$", ")"];
				t.index=x["index"];
				t.span=l.span+a.span;
				t.rest=a.rest;
			}
			else {
				t.token="variable";
				t.label=l.label;
				t.args=null;
				t.tokends=["$"];
				t.index=x["index"];
				t.span=l.span;
				t.rest=l.rest;
			};			
		} 
		return t;
	};
	
	
}; //AIengine function


// Define a Module with Simplified CommonJS Wrapper...
// see http://requirejs.org/docs/api.html#cjsmodule
if (typeof define=="function"){
	define(function(require, exports, module){ return aiWordMatcher});
} 
else { 
	//console.log("window.aiWordMatcher", aiWordMatcher);
	//window.aiWordMatcher=aiWordMatcher;
}




