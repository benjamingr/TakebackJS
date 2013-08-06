DomScraper
==========

Dom Scraper - Take control of your DOM.

Often we have to serve HTML for speed but still want data bindable JS objects for good separation of concerns.

This converts DOM to data bindable objects. 

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
    
And so on.


###Warning, this is WiP and is _highly_ unstable
