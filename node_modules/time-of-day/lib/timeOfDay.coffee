###
#
# TimeOfDay.js
#
# Licence MIT : http://opensource.org/licenses/MIT
# Copyright Campbell Morgan <campbellmorgan@gmail.com> 2014
#
# github.com/campbellwmorgan/time-of-day
#
###
elementClass = require 'element-class'

class TimeOfDay
  defs:
    elements: []

    className: 'item-active'

    # if there are multiple
    # overlapping periods
    # just add the class to
    # the next one
    onlyShowNext: false

    timesOfDay:
      night:
        from: '22:30'
        to: '06:30'
      morning:
        from: '06:30'
        to: '12:00'
      lunch:
        from: '12:00'
        to: '14:30'
      afternoon:
        from: '14:30'
        to: '17:30'
      evening:
        from: '17:30'
        to: '22:30'

  #override for testing
  elementClass: elementClass

  constructor: (config) ->
    # list of all active
    # periods in order of
    # when next finishing
    @activePeriods = []

    @_extendConfig config

    # evaluate each element
    @_evaluateElements()


  _extendConfig: (config) =>
    @opts = {}
    config = {} unless config?
    for setting, value of @defs
      @opts[setting] = if setting of config
      then config[setting]
      else value
    @opts

  ###
  Are we in the current time period
  @param {Date} current time
  @param {Object} Time Range
  ###
  _inPeriod: (timeNow, period)=>
    # get the current day
    time = @_getMinutesSinceMidnight timeNow

    from = @_getMinutesSinceMidnight period.from

    to = @_getMinutesSinceMidnight period.to

    # if end time is next day
    if from < to
      return false if time > to
      return false if time < from
    # if from is same day as to
    else
      return false if (
        time > to and
        time < from
      )

    true


  ###
  Cycles through each element
  and adds active class to any
  element where time matches
  ###
  _evaluateElements: =>
    return unless @opts.elements.length

    # rank the active periods by time til end
    @_rankPeriods()

    for el in @opts.elements
      period = @_getPeriod el
      continue unless period
      # ignore if period not in list
      continue unless @_isActive period.period

      if @opts.onlyShowNext
        continue if period.name isnt @activePeriods[0].name

      # add the active class to the element
      @elementClass(el).add @opts.className
      # add a class with the active timeperiod
      # to the element
      @elementClass(el).add period.name + "-active"

  ###
  # Checks if a period is active
  # @param {Object} time range {from:.., to:...}
  # @returns {Boolean}
  ###
  _isActive: (timeRange, now) =>
    now = new Date() unless now?
    @_inPeriod now, timeRange

  ###
  Checks the list of options
  and returns the matching period
  or false if period not found
  @param {DOM Element}
  @return {Object}
  ###
  _getPeriod : (el) =>
    # get time of day setting
    timeOfDay = el.getAttribute 'data-time-of-day'
    # ignore if no timeOfDay tag
    return false unless timeOfDay

    unless timeOfDay of @opts.timesOfDay
      throw new Error( timeOfDay +
        " not found in available periods"
      )
      return false

    time =
      period: @opts.timesOfDay[timeOfDay]
      name: timeOfDay

  # order active periods
  # by proximity to now
  _rankPeriods: (nowOverride) =>

    compare = (a, b) =>
      aCountdown = @_getTimeUntilEnd a
      bCountdown = @_getTimeUntilEnd b
      aCountdown > bCountdown

    @activePeriods = []

    for name, period of @opts.timesOfDay
      obj =
        name: name
        from: period.from
        to: period.to

      if @_isActive(period, nowOverride)
        @activePeriods.push(obj)

    @activePeriods.sort(compare)
    @activePeriods

  ###
  # Gets the period of time until
  # the end of the given period
  # @param {Object} {from:..., to:..}
  # @return {Integer} number of minutes
  ###
  _getTimeUntilEnd: (period) ->
    now = @_getMinutesSinceMidnight()
    endTime =  @_getMinutesSinceMidnight period.to
    timeRemaining = endTime - now
    # if end time is in
    # next 24 hour period
    if timeRemaining < 0
      timeRemaining = ((24 * 60) + endTime) - now

    timeRemaining

  ###
  # Calculates the number of minutes
  # since midnight
  # @param {String} time (in format HH:MM)
  # @return {Integer} minutes
  ###
  _getMinutesSinceMidnight: (time) =>
    time = new Date() unless time?
    matches = time.toString().match(/\d\d\:\d\d[^ ]?/)
    return 0 unless matches.length
    hoursMins = matches[0]
    @_convertHoursMinsToMins(hoursMins)

  _convertHoursMinsToMins: (hoursMins) ->
    hours = parseInt(hoursMins.replace(/\:.*$/, ''))
    mins = parseInt(hoursMins.replace(/^[^\:]+\:/, ''))
    return (hours * 60) + mins


module.exports = TimeOfDay
