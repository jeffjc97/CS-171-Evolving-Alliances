# Evolving Alliances

Jeffrey Chang, Miriam Barnum, Isabel Lee

Evolving Alliances is an exploration into the changing landscape of international relations over time through analysis of alliance data. Our dataset, which is provided by Correlates of War, provides alliance data between countries for different years, and we created an interactive visualization of this data.

The visualization can be accessed here: TODO

A screencast of the different features of our visualization can be viewed here: TODO

# Features
- On the home page, there are links to the other pages of the site - project overview, visualization, and data overview.
- The project overview page details the background and motivation of the project, as well as its objective and goals.
- The data overview page explains more about the dataset and the preprocessing steps needed to convert it into a usable form.
- Lastly, the visualization page contains our visualization. There are three individual visualizations present in the page in two locations - the top view can either be a map view of global alliances or a force diagram of global alliances, and the bottom view has a map of indiidual country alliances.

### Top Visualization
  - The top visualization displays all of the alliances for a given year, with links between each pair of allied countries. Users can filter the type of alliances shown (defense, neutrality, nonagression, entente, or all), as well as switch between a map view or a force diagram view. In addition, for years where historical events can explain major changes in the visualization, the relevant information is displayed for users to learn more.
    - In the map view, the alliances are links between the countries on the map. Users can zoom and pan the visualization to look at smaller countries in more detail.
    - In the force diagram view, our innovative visualization, links between countries represent alliances and the strength of the link illustrates the strength of the alliances (defence alliances are the strongest, and ententes are weakest). This allows users to see how different groups of countries are connected and how the overall landscape of the world changes over time.

### Bottom Visualization 
 - The bottom visualizatoin displays all of the alliances involving a specific country in a given year, allowing users to get a more specific view of the status of an individual country over time.

### Toolbar
- There is a toolbar at the bottom of the page which allows the user to either start/stop an animation over the years, or manually change the visualization to different years. It is accessible to the user wherever they are on the page, and can also be collapsed for users to have more space to examine the visualizations.

# Acknowledgements

We used [Correlates of War](http://www.correlatesofwar.org/) for our alliance data. We also used a template from [html5up](http://html5up.net/directive) for our home page and edited it slightly to our color scheme. We also used FontAwesome, Bootstrap, jQuery, and D3 libraries.