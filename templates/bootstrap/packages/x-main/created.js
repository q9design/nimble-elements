var $ = require('jquery')
var _ = require('underscore')
var moment = require('moment')

var oe = _.countBy([1, 2, 3, 4, 5], v=> {
  return v % 2 == 0 ? 'even': 'odd'
})

$('.start',dom).text(moment().format("dddd, MMMM Do YYYY, h:mm:ss a"))

$('.report',dom).text('odd: '+oe.odd+' '+'even: '+oe.even)

