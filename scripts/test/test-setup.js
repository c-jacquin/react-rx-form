const { JSDOM } = require('jsdom')
const { configure } = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
const jsdom = new JSDOM('<!doctype html><html><body></body></html>')
const { window } = jsdom

configure({ adapter: new Adapter() })
global.window = window
global.document = window.document
