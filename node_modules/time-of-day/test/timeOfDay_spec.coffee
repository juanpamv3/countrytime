TimeOfDay = require '../lib/timeOfDay'

class TimeOfDayMock extends TimeOfDay
  constructor: ->


describe "TimeOfDay", ->

  tOD = false

  beforeEach ->
    tOD = new TimeOfDayMock()


  describe "extendConfig", ->

    it "should merge config with the defaults and add to opts", ->

      tOD._extendConfig
        elements: ['item2']

      expect(tOD.opts.elements[0])
        .toBe 'item2'

      expect(tOD.opts.timesOfDay.night.from)
       .toBe '22:30'


  describe "_inPeriod", ->

    time = false
    beforeEach ->
      time = "Mon Nov 03 2014 12:00:12 "

    it "should correctly match a given time with a period", ->

      period1=
        from: '08:00'
        to: '10:00'

      expect(tOD._inPeriod(time, period1))
        .toBe false

    it "should return true when within period", ->

      period2 =
        from: '08:00'
        to: '12:01'

      expect(tOD._inPeriod(time, period2))
        .toBe true

    it "should return false when period occurs afterwards", ->
      period3 =
        from: '13:00'
        to: '16:00'

      expect(tOD._inPeriod(time, period3))
        .toBe false

    it "should return true when period starts the day before and overlaps", ->
      period4 =
        from: '22:00'
        to: '13:00'

      expect(tOD._inPeriod(time, period4))
        .toBe true

    it "should return false when period starts day before and ends before", ->
      period5 =
        from: '22:00'
        to: '11:00'

      expect(tOD._inPeriod(time, period5))
        .toBe false

    it "should return true when period " +
    "overlaps and time finishes the day after", ->
      period6 =
        from: '08:00'
        to: '01:00'

      expect(tOD._inPeriod(time, period6))
        .toBe true

    it "should return false when period doesnt overlap " +
    "and time finishes day after", ->
      period6 =
        from: '14:00'
        to: '01:00'

      expect(tOD._inPeriod(time, period6))
        .toBe false


  describe "_evaluateElements", ->

    classContr = false

    beforeEach ->
      classContr =
        add: (className) ->

      spyOn classContr, 'add'
      tOD.elementClass = (el) ->
        classContr

      tOD._rankPeriods = ->
      tOD.activePeriods = [
        {
          name: 'testa'
        }
      ]

      tOD._getPeriod = (el) ->
        if el is 'one'
          return name: 'testa', period: 'one'
        if el is 'two'
          return name: 'testb', period: 'two'
        return false

      tOD._isActive = (period)->
        return true if period is 'one'
        false

      elements = ['one', 'two', 'three']
      tOD.opts =
        elements: elements
        className: 'item-active'

    it "should call add class on all elements where period matches", ->


      tOD._evaluateElements()

      expect(classContr.add)
        .toHaveBeenCalledWith 'item-active'

      expect(classContr.add)
        .toHaveBeenCalledWith 'testa-active'

      expect(classContr.add)
        .not
        .toHaveBeenCalledWith 'testb-active'

    it "should only add class to the next finishing period", ->
      tOD.opts.onlyShowNext = true
      tOD._evaluateElements()
      expect(classContr.add)
        .toHaveBeenCalledWith 'testa-active'
      expect(classContr.add)
        .not.toHaveBeenCalledWith 'testb-active'

  describe "_getPeriod", ->
    it "should return false if attribute is null", ->
      el =
        getAttribute : ->
          null

      expect(tOD._getPeriod(el))
        .toBe false

    it "Should throw an error if attribute time of day not in definitions", ->

      el =
        getAttribute: ->
          'morning'

      tOD.opts =
        timesOfDay :
          afternoon:
            from: '12:00'
            to: '15:00'

      try
        expect(tOD._getPeriod(el))
          .toBe false
      catch e
        expect(e.message).toBe(
          'morning not found in available periods'
        )

    it "should return an object of correct element", ->

      el=
        getAttribute: ->
          'morning'

      tOD.opts =
        timesOfDay :
          morning:
            from: '08:00'
            to: '10:00'

      res = tOD._getPeriod(el)

      expect(res.name)
        .toBe 'morning'

      expect(res.period.from)
        .toBe '08:00'

  describe "_isActive", ->

    it "should call and return _inPeriod with now and timerange", ->

      spyOn tOD, '_inPeriod'

      now = new Date()

      tOD._isActive 'period', now
      expect(tOD._inPeriod)
        .toHaveBeenCalledWith(now, 'period')



  describe "_rankPeriods", ->
    it "should order periods from soonest to last", ->

      periods =
        one:
          from: '00:00'
          to: '11:00'
        two:
          from: '00:00'
          to: '09:00'
        three:
          from: '12:00'
          to: '14:00'
        four:
          from: '00:00'
          to: '10:00'


      tOD.opts =
        timesOfDay: periods

      result = tOD._rankPeriods('01:15')
      expect(result.length).toBe 3

      expect(result[0].name).toBe 'two'
      expect(result[2].name).toBe 'one'


  describe "getTimeUntilEnd", ->
    beforeEach ->
      origTimeSinceMidnight = tOD._getMinutesSinceMidnight

      newFunc = (time) ->
        time = '01:15' unless time?
        origTimeSinceMidnight.apply tOD, [time]

      tOD._getMinutesSinceMidnight = newFunc

    it "should get difference in between now and end of period", ->
      expect(tOD._getTimeUntilEnd(to:'01:45'))
        .toBe(30)

    it "should add on 24 hours if end time passed in this 24 hour period", ->
      expect(tOD._getTimeUntilEnd(to:'00:15'))
        .toBe((23*60))


  describe "getMinutesSinceMidnight", ->

    it "should return correct number of minutes since midnight", ->
      expect(tOD._getMinutesSinceMidnight(
        "Mon Nov 03 2014 03:19:02 GMT+0000"
      )).toBe 199




