Scraper = (function extractor(){
	var options;
	var elementCache = [];
	var cacheIndexName = "___elementCacheIndex_"+(new Date().getTime());
	var cacheName = "___elementCache_" +(new Date().getTime());
	window[cacheName] = elementCache;
	window[cacheName+"__"] = function(args){
		var el = Array.prototype.slice.call(args,0);
		el.toJSON = function(){ return "Bindings";};
		return el;
	}
	window[cacheIndexName] = [];
	var $$ = function(el,selector){
		return Array.prototype.slice.call(el.querySelectorAll(selector),0);
	};
	var observe = " function(val) {"+
		'if(typeof val === "undefined"){'+
		'	return this._{value};'+
		'}else{'+
		'	this.__fields[{node}].textContent = val;'+
		'	this._{value} = val;'+
		'}'+
	'}';
	function mapToFunction(nodes){
		var fieldJson = nodes.map(function(field,i){
			var val = field.textContent.toLowerCase();
			var obs = observe.replace(/\{value\}/g,val).
							 replace(/\{node\}/g,i);
			return "_"+val+": arguments["+i+"].textContent,\n"+
					val+":" + obs;
		});
		fieldJson.unshift("__fields : "+cacheName+"["+cacheIndexName+"++] = "+
			"window['"+cacheName+"__'](arguments)");

		console.log("    return {"+fieldJson.join(",")+"};");
		return new Function("    return {"+fieldJson.join(",")+"};");
	}

	var extractors = {
		TABLE:extractTable,
		UL:extractList,
		OL:extractList,
		DIV:extractDiv,
		SPAN:extractDiv,
	};

	function extractGeneral(el){
		return extractors[el.nodeName](el);
	}

	function extractTable(el){
		console.log("Got to table")
		var thead = el.querySelector("thead");
		if(!thead){ return console.log("No <thead> found for",el);}
		var tbody = el.querySelector("tbody");
		if(!tbody){ return console.log("No <tbody> found for",el);}
		var fields = $$(thead,"th");
		var scrapeFunction = mapToFunction(fields);
		var rows = $$(tbody,"tr");
		var result = [];
		var current = [];
		var el;
		for(var i=0;i<rows.length;i++){
			var cells = $$(rows[i],"td");
			for(var j=0;j<cells.length;j++){
				current[j] = cells[j];
			}
			el = scrapeFunction.apply(null,current);
			el.__el = rows[i]; 
			el.__el.toJSON = function(){};
			result.push(el);
		}
		//TODO result.splice
		//TODO result.push
		//TODO result.set(index,value);
		//TODO result.add()  - return object to manipulate
		//TODO result.add({partial object})
		return result;
	}
	function extractList(){
		var ul = el.querySelector("ul") || el.querySelector("ol");
		if(!ul){ return console.log("No <ul> or <ol> found for",el);}
		var fields = $$(ul,"li");
		return fields.map(function(el){ return el.textContent;});

	}
	function extractDiv(){
		return "Got to div";
	}
	function form(){
		return "Got to form";
	}

	function extractResolve(element){
		if(typeof element === "string"){
			return extractResolve(document.querySelector(element));
		}
		if(typeof element === "undefined"){
			throw new Error("Called with invalid number of parameters, usage is extract(element)");
		}
		if(element === null || !element.nodeType){
			throw new Error("Called with non existing element");
		}

		return extractGeneral(element);
	}

	return function(opts){
		if((typeof opts === "object") && opts !== null){
			options = opts;	
		}else{
			options = {};
		}
		
		return {
			scrape:extractResolve
		};
	};

})();