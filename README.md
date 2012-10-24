webComponent
============

This is an experimental JavaScript module that will load a fully modular web component. A web component will consist of a main JavaScript file and any supporting HTML and CSS fragments to provide the UI of the component.

The webComponent module will look for a *package.json* file which will describe where the HTML and CSS files are located.

webComponent is an extremely curde proof of concept of the larger picture for which [fragmentz](https://github.com/coltrane/fragmentz) aims to achieve.

## Dependencies

- [RequreJS](http://requirejs.org/)
- [q promise library](https://github.com/kriskowal/q)
- [fragmentz](https://github.com/coltrane/fragmentz)

## Where I would like to take this

- Allow for templating (such as Handlebars) within the HTML fragments
- Better package.json format