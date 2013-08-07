Scraper = (function extractor() {
    var options;
    var elementCache = [];
    var cacheIndexName = "___elementCacheIndex_" + (new Date().getTime());
    var cacheName = "___elementCache_" + (new Date().getTime());
    window[cacheName] = elementCache;
    window[cacheName + "__"] = function (args) {
        var el = Array.prototype.slice.call(args, 0);
        el.toJSON = function () { return "Bindings"; };
        return el;
    }
    window[cacheIndexName] = [];
    var $$ = function (el, selector) {
        return Array.prototype.slice.call(el.querySelectorAll(selector), 0);
    };
    var observe = " function(val) {" +
		'if(typeof val === "undefined"){' +
		'	return this._{value};' +
		'}else{' +
		'	this.__fields[{node}].textContent = val;' +
		'	this._{value} = val;' +
		'}' +
	'}';
    function mapToFunction(nodes) {
        var fieldJson = nodes.map(function (field, i) {
            var val = field.textContent.toLowerCase();
            var obs = observe.replace(/\{value\}/g, val).
							 replace(/\{node\}/g, i);
            return "_" + val + ": arguments[" + i + "].textContent,\n" +
					val + ":" + obs;
        });
        fieldJson.unshift("__fields : " + cacheName + "[" + cacheIndexName + "++] = " +
			"window['" + cacheName + "__'](arguments)");

        return new Function("    return {" + fieldJson.join(",") + "};");
    }

    var extractors = {
        TABLE: extractTable,
        UL: extractList,
        OL: extractList,
        DIV: extractDiv,
        SPAN: extractDiv,
    };

    function extractGeneral(el) {
        return extractors[el.nodeName](el);
    }

    function extractTable(el) {
        //console.log("Got to table")
        var thead = el.querySelector("thead");
        if (!thead) { return console.log("No <thead> found for", el); }
        var tbody = el.querySelector("tbody");
        if (!tbody) { return console.log("No <tbody> found for", el); }
        var fields = $$(thead, "th");
        var scrapeFunction = mapToFunction(fields);
        var rows = $$(tbody, "tr");
        var result = [];
        var current = [];
        var el;
        for (var i = 0; i < rows.length; i++) {
            var cells = $$(rows[i], "td");
            for (var j = 0; j < cells.length; j++) {
                current[j] = cells[j];
            }
            el = scrapeFunction.apply(null, current);
            el.__el = rows[i];
            el.__el.toJSON = function () { };
            result.push(el);
        }
        function createRow() {
            var el = document.createElement("tr");
            for (var i = 0; i < cells.length; i++) {
                el.appendChild(document.createElement("td"));
            }
            return el;
        }
        function fromObject(obj,el){
            var asScraped = scrapeFunction.apply(null, el.children);
            console.log(asScraped);
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (!(i in asScraped)) {
                        throw new Error("Invalid object structure : ",obj, i);
                    }
                    //scrape normal property
                    if (typeof obj[i] !== "function") {
                        asScraped[i](obj[i]);
                    } else {  //scrape observable property
                        asScraped[i] = obj[i];
                    }
                }
            }
            return asScraped;
        }
        result.__push = result.push;
        result.push = function (obj) {
            var el = createRow();
            asScraped = fromObject(obj,el);
            //create the row
            tbody.appendChild(el);//add to the dom
            return result.__push(asScraped);
        };

        result.__splice = result.splice;
        result.splice = function (index, howMany) {
            //TODO handle negative index case
            var elements = Array.prototype.slice.call(arguments, 2);
            if (howMany <= 0 && elements.length <= 0) {
                return;//slice called with 0 
            }
            howMany = Math.min(result.length, howMany);
            for (var i = 0; i < howMany; i++) {
                tbody.removeChild(tbody.children[index]);//remove the elements to remove
            }
            var newArgs = [index,howMany];
            for (var j = elements.length-1; j >= 0 ; j--) {
                var row = createRow();
                newArgs.push(fromObject(elements[j], row));
                tbody.insertBefore(row, tbody.children[index]);
            }
            return result.__splice.apply(result, arguments);
        };
        result.pop = function (index, howMany) {
            return result.splice(result.length-1, 1);
        }
        //replace the whole table
        result.replace = function (elements) {
            // hopefully, no leaks here since there is no reference from the DOM here
            console.log([0, result.length].concat(elements));
            return result.splice.apply(result,[0,result.length].concat(elements)); 
        }
        result.__sort = result.sort;
        result.sort = function (comp) {
            var asSorted = result.__sort(comp);
            result.splice(0, result.length, asSorted);
        }
        return result;
    }
    function extractList() {
        var ul = el.querySelector("ul") || el.querySelector("ol");
        if (!ul) { return console.log("No <ul> or <ol> found for", el); }
        var fields = $$(ul, "li");
        return fields.map(function (el) { return el.textContent; });

    }
    function extractDiv() {
        return "Got to div";
    }
    function form() {
        return "Got to form";
    }

    function extractResolve(element) {
        if (typeof element === "string") {
            return extractResolve(document.querySelector(element));
        }
        if (typeof element === "undefined") {
            throw new Error("Called with invalid number of parameters, usage is extract(element)");
        }
        if (element === null || !element.nodeType) {
            throw new Error("Called with non existing element");
        }

        return extractGeneral(element);
    }

    return function (opts) {
        if ((typeof opts === "object") && opts !== null) {
            options = opts;
        } else {
            options = {};
        }

        return {
            scrape: extractResolve
        };
    };

})();