// Only set up browser environment on server side
if (typeof window === 'undefined') {
  var mockBrowser = require("mock-browser").mocks.MockBrowser;
  var canvas = require("canvas");
  
  global.window = mockBrowser.createWindow();
  global.document = window.document;
  global.navigator = window.navigator;
  global.self = global;
  global.HTMLCollection = window.HTMLCollection;
  global.getComputedStyle = window.getComputedStyle;
  global.customElements = null;
  global.canvas = canvas;
  global.HTMLElement = window.HTMLElement;
  global.HTMLDivElement = window.HTMLDivElement;
}