/**********************************

Contract
Admin
Site 
Bucause
Architectural
Heros

Andrew Siddeley

13-Dec-2017
********************************/
if (typeof casbah=="undefined") {casbah={};}

//$.get("casbah_tableview.js")
//.done(function(){console.log("tableView OK");})
//.fail(function(){console.log("tableView failed");})
//.always(function(casbah){

casbah.array_diff=function(a, b) {
	//Thanks to https://radu.cotescu.com/javascript-diff-function/
	//saftey first
	if (typeof a=="undefined"){a=[];}
	if (typeof b=="undefined"){b=[];}
	if (a.length < b.length) {var t=a; a=b; b=t;}
	
	//diffArray
	var seen = []
	var diff = [];
	for ( var i = 0; i < b.length; i++) { seen[b[i]] = true; }
	for ( var i = 0; i < a.length; i++) { if (!seen[a[i]]) { diff.push(a[i]);}}
	return diff;
};

casbah.array_insert_after=function(list, item, neighbour){
	//copy rows array before modifying it
	//var orig=[]; for (var i in list){orig[i]=list[i];}

	var pos=list.indexOf(neighbour);
	if (pos == -1){	list.push(item);}
	else {list.splice(pos+1, 0, item);}
	
	//console.log("array_add_at list, item, neighbour, position:", JSON.stringify(list), item, neighbour, pos);	
	
	return list;
};

casbah.array_nth_swap=function(arr, n, offset){
	/**
	Moves nth item up one spot in the array
	@param arr - array of items
	@param n - index of first item to swap
	@param offset - index offset for other item to swap
	**/
	if (typeof offset=="undefined"){offset = -1;}
	//n is likely to be a string so ensure it's a number
	var d=Number(n)+offset;
	//console.log("swap item ", n, " & ", d);
	if (n>=0 && n<arr.length && d >= 0 && d<arr.length){
		//console.log("swap occured");
		var temp=arr[d];arr[d]=arr[n];arr[n]=temp;
	};
	return arr;
};

casbah.array_nth_to_nth=function(arr, nf, nt){
	nf=Number(nf); //from
	nt=Number(nt); //to
	if (nt<nf){
		arr.splice(nt,0,arr[nf]);
		arr.splice(nf+1,1);
	} else if (nf<nt){
		//console.log("from",nf,"to",nt, "arr", arr);
		arr.splice(nt+1,0,arr[nf]);
		//console.log("arr", arr);
		arr.splice(nf,1);
		//console.log("arr", arr);
	}	
}

casbah.array_remove=function(list, item){
	/**
	copy rows array before modifying it
	**/
	var pos=list.indexOf(item);
	if (pos > -1){list.splice(pos, 1);}
	return list;
};


casbah.array_rowidorder=function(rows, rowids){
	/***
	Modifies rows, re-ordering its items by rowid key as listed in rowids 
	@param rows Eg. [{rowid:1, ...}, {rowid:2, ...}, ...]
	@param rowids Eg. [2,1,3,4,5...]
	***/

	//copy rows array before modifying it
	var orig=[]; for (var i in rows){orig[i]=rows[i];}
	
	var getrowbyid=function(rowid){
		for(var i in orig){
			//console.log("GET rowid, orig[i]", rowid, orig[i].rowid);
			if (orig[i].rowid==rowid) {	return orig[i];	}
		} 
		//default 
		return null;
	};
	
	var r=null, j=0;
	for (var i in rowids){
		//console.log("FOR rows[i], getrowbyid", rows[i], getrowbyid( rowids[i] ) )
		r=getrowbyid( rowids[i] );
		if (r != null) {rows[j]=r; j++;}
	};
	
	//delete any remaining 
	while (j<rows.length){rows.splice(j,1); j++;}
	
};


casbah.cookie=function(cname, cvalue, exdays) {
	
	if (typeof cvalue=="undefined"){
		//GET COOKIE
		//console.log("getCookie...", cname);
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		//console.log("ca...", ca);	
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return null;
	} 
	else {
		//SET COOKIE
		//console.log("setCookie...");
		if (typeof exdays=="undefined"){exdays=7;}
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
		return cvalue;
	}

};

casbah.database=function(sql, callback){
	
	$.ajax({
		url: '/database',
		type: 'POST',
		data: jQuery.param({SQL:sql}),
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		success:function(result){ 
			if(typeof result.rows=="undefined") result.rows=[];
			if (typeof callback=="function") callback(result);
		},
		error:function(err){console.log("database function, ajax error:",err);}
	});	
};


//////////////////////////////////
// TEXTEDITOR
// init...
// var ed=new Editor();
// example (icTV is a casbah TableView obj)
// <div onclick="ed.text(this, function(){icTV.update(ed.row(), ed.rowid()); ed.hide();})" ...>

casbah.Editor=function (){
	
	var that=this;
	
	this.e$=null; //editee - initialized by this.text()
	
	this.fit=function(){
		if (this.e$==null){return;}
		that.x$.show();
		//fit textarea to element	
		that.x$.width(that.e$.width());
		that.x$.css("height","auto");
		that.x$.css("padding-left", that.e$.css("padding-left"));
		if (that.x$[0].scrollHeight > 0) {that.x$.css("height", that.x$[0].scrollHeight);}
		//element to match textarea height
		that.e$.height(that.x$.height()+5);
		//Position needs to be done last per trial-and-error
		that.x$.position({my:'left top', at:'left top', of:that.e$});
		//progress backup of edited value
		that.e$.attr("newval", that.x$.val());
	};
	
	this.hide=function(){
		that.x$.hide();
		$(window).off("resize", that.fit);
		//restore row height of previously accessed elements 
		//select elements with onclick attribute. 
		//Re. jquery notation...
		//^= means matches value as begining 
		//*= means matches value as substring 
		//~= means matches value as space delimited word
		//$("[onclick*='.text(']").css("height","auto");
		$("[onclick*='.text(']").css("height","100%");
	};
	
	this.text=function(el, dblclick){

		//restore row height of any previously edited elements
		//$("[onclick*='.text(']").css("height","auto");
		$("[onclick*='.text(']").css("height","100%");
	
		that.e$=$(el); 
		that.x$=$("#texteditor");
		
		//update editors dblclick callback to the current edited element
		//dblclick meant to commit the texteditors change
		if (typeof dblclick=="function"){that.x$.off("dblclick").on("dblclick", dblclick);};
		
		//all this newval was working not anymore. Lose it? 
		//newval allows for edit to resume editing on an element that was left without commiting
		var newval=that.e$.attr("newval");
		if (typeof newval=="undefined") {
			//first time this element is edited so initialize editor from element
			that.x$.val(that.e$.text());
			that.x$.attr("newval", that.e$.text());
		} else {
			//resume editing from last edited value
			that.x$.val(newval);
		}
		that.fit();
	};
	
	this.row=function(){
		var row={};
		//row[that.e$.attr("field")]=that.e$.attr("newval");
		row[that.e$.attr("field")]=that.x$.val();
		//console.log("EDITOR field, newval, row...", that.e$.attr("field"), that.e$.attr("newval"), row);
		return row;
	};
	
	this.rowid=function(){
		var rowid=that.e$.attr("rowid");
		//console.log("EDITOR rowid...", rowid);
		return rowid;
	};
	
	//INIT
	//create text area element for editing text
	this.x$=$("<textarea id='texteditor' style='z-index=999;'></textarea>");
	$("body").append(this.x$);
	this.x$.hide();
	
	//initialize or reset various event handlers...
	this.x$.on("click keyup resize", that.fit);
	$(window).on("resize", that.fit);
	
	$(document).one("pageturn",function(){
		//console.log("pageturn detected");
		that.x$.hide();
	});
	
};

////////////////////////////////
// Highlighter
// 

casbah.Highlighter=function(hiclass){
	var that=this;
	this.hiclass=hiclass;
	this.selector="";
	this.__rowid="-1";

	this.attr=function(name){
		return $("."+that.hiclass).attr(name);
	};

	this.dark=function(element){$(element).removeClass(that.hiclass); }
	
	this.light=function(element){
		//element can be this of a DOM element or a jquery id selector
		if (typeof element=="string"){that.selector=element; element=$(element);}
		else if (typeof element=="undefined"){element=$(that.selector);};
		$("."+that.hiclass).removeClass(that.hiclass);
		$(element).addClass(that.hiclass);
		that.__rowid=$(element).attr("rowid");
	}
	
	this.rowid=function(){	return Number(that.__rowid);};	
	
	this.row=function(){
		//return all {name:vals}
		var f$, name;
		var r={};
		//collect all elements within the highlighted div that has an attr called field
		var ff$=$("."+that.hiclass).find("[field]");
		//console.log("field count", ff$.length);

		//r[ff.attr("field")]=ff.text();
		for (var i=0; i<ff$.length; i++){
			f$=$(ff$[i]);
			name=f$.attr("field");
			r[name]=f$.text();
		}
		return r;
	};
};


///////////////////////////
casbah.parameters={
	expiry_days:30,
	fetch:function(name, default_value){return this.get(name, default_value);},
	get:function(name, default_value){
		var $value=casbah.cookie(name);
		if (typeof $value=="undefined" || $value==null){
			if (typeof default_value=="undefined"){default_value="undefined";}
			$value=default_value;
			casbah.cookie(name, $value, this.expiry_days);
		};
		this[name]=$value;
		//console.log("GET ",name, "=",this[name]);
		return $value;
	},
	store:function(name,$value){return this.set(name, $value);},
	set:function(name, $value){
		if (typeof $value=="undefined"){$value="undefined";}
		$value=casbah.cookie(name, $value, this.expiry_days);
		this[name]=$value;
		//console.log("SET ", name, "=",this[name]);
		return this;
	}	
};




///////////////
casbah.renderFX=function(placeholderID, templateFN, result, delta){
	//as returned from sqlite query...
	//result {rows:[{field:value, field:value...},{...},...]}
	if (typeof delta == "undefined"){delta={count:0};};
	if (placeholderID.indexOf("#")!=0){placeholderID="#"+placeholderID;}
	switch(delta.count){
		case(1):
			////Grand Reveal for added row then run callback function to render result
			$(placeholderID).html(templateFN(result));
			//var cr$=$('#comments-row'+delta.rowids[0]);
			var cr$=$(placeholderID+" > div").find($("[rowid="+delta.rowids[0]+"]"));
			cr$.css('background','gold').hide().show(500, function(){cr$.css('background','white');});
		break;
		case(-1):
			var cr$=$(placeholderID+" > div").find($("[rowid="+delta.rowids[0]+"]"));
			////Grand send-off for deleted row then run callback function to render result
			cr$.css('background','gold').hide(500, function(){
				$(placeholderID).html(templateFN(result));
			});
		break;
		default: 
			$(placeholderID).html(templateFN(result));
	};		
}

casbah.showMenu=function(cm$, ev){
	//first call texteditor with no arguments to turn it off just in case its on
	//ed.hide();
	cm$.show().position({my:'left top',	at:'left bottom', of:ev});
	//remember caller, that is the <div> or <p> element that launched the contextMenu
	cm$.menu('option', 'caller', ev.target);
	return false;
};

casbah.selectFolder=function (e) {
    var theFiles = e.target.files;
    var relativePath = theFiles[0].webkitRelativePath;
    var folder = relativePath.split("/");
    alert(folder[0]);
};

//////////////////////////////
casbah.view=function(htmlfile){
	console.log("pageturn");	
	//heads up - close open editors etc
	$(document).trigger("pageturn");
	var id="view";
	if (!$("#"+id).length){
		//var el=$("<div></div>").addr("id",id);
		$("body").append($("<div></div>").attr("id",id));		
	}
	//if (pageid.indexOf("#")==-1) {pageid="#"+pageid;}
	//$(".dock").hide();
	//$(pageid).show().load(url);
	$("#"+id).load("views/"+htmlfile);
};
//}); //load
