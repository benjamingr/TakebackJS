TakebackJS
==========

Take control of your DOM.

Serving HTML from the server can be useful for load times. We still want sensible structure for our data, we want 
models that back up our presentation.

This converts DOM structure to data bindable objects. 

For example, the following table:

    Name  Title
    John	Doctor
    Fi Fi	Dog
    Major	Major

With the following HTML structure:

    <table id='content1'>
  			<thead>
  			<tr>
  				<th>Name</th><th>Title</th>
  			</tr>
  			</thead>
  			<tbody>
  				<tr><td>Jon</td><td>Doctor</td></tr>
  				<tr><td>Fi Fi</td><td>Dog</td></tr>
  				<tr><td>Major</td><td>Major</td></tr>
  			</tbody>
  	</table>


Gets converted to an array of bindable objects

    var s = new Scraper();
    ver res = s.scrape("content1");
    res[0].name("Snow");//Jon is now Snow in the dom
    res[0].name();//Jon
    res[1].title();//Dog
    res.push({name:"Who",title:"Doctor"});//adds to the DOM too
    res.splice(0,1);//removes the first element, both from array and DOM
    
And so on.


###Warning, this is WiP and is _highly_ unstable


##TODO:

 - Take back lists and not just tables.
 - Fix memory leak when deleting elements (in cache)
 - Plugins for Knockout and Angular
 - Find more collaborators
 - Improve readability 
