
/*
 *
 * TimeOfDay.js
 *
 * Licence MIT : http://opensource.org/licenses/MIT
 * Copyright Campbell Morgan <campbellmorgan@gmail.com> 2014
 *
 * github.com/campbellwmorgan/time-of-day
 *
 */

(function() {
  var TimeOfDay, elementClass,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  elementClass = require('element-class');

  TimeOfDay = (function() {
    TimeOfDay.prototype.defs = {
      elements: [],
      className: 'item-active',
      onlyShowNext: false,
      timesOfDay: {
        night: {
          from: '22:30',
          to: '06:30'
        },
        morning: {
          from: '06:30',
          to: '12:00'
        },
        lunch: {
          from: '12:00',
          to: '14:30'
        },
        afternoon: {
          from: '14:30',
          to: '17:30'
        },
        evening: {
          from: '17:30',
          to: '22:30'
        }
      }
    };

    TimeOfDay.prototype.elementClass = elementClass;

    function TimeOfDay(config) {
      this._getMinutesSinceMidnight = __bind(this._getMinutesSinceMidnight, this);
      this._rankPeriods = __bind(this._rankPeriods, this);
      this._getPeriod = __bind(this._getPeriod, this);
      this._isActive = __bind(this._isActive, this);
      this._evaluateElements = __bind(this._evaluateElements, this);
      this._inPeriod = __bind(this._inPeriod, this);
      this._extendConfig = __bind(this._extendConfig, this);
      this.activePeriods = [];
      this._extendConfig(config);
      this._evaluateElements();
    }

    TimeOfDay.prototype._extendConfig = function(config) {
      var setting, value, _ref;
      this.opts = {};
      if (config == null) {
        config = {};
      }
      _ref = this.defs;
      for (setting in _ref) {
        value = _ref[setting];
        this.opts[setting] = setting in config ? config[setting] : value;
      }
      return this.opts;
    };


    /*
    Are we in the current time period
    @param {Date} current time
    @param {Object} Time Range
     */

    TimeOfDay.prototype._inPeriod = function(timeNow, period) {
      var from, time, to;
      time = this._getMinutesSinceMidnight(timeNow);
      from = this._getMinutesSinceMidnight(period.from);
      to = this._getMinutesSinceMidnight(period.to);
      if (from < to) {
        if (time > to) {
          return false;
        }
        if (time < from) {
          return false;
        }
      } else {
        if (time > to && time < from) {
          return false;
        }
      }
      return true;
    };


    /*
    Cycles through each element
    and adds active class to any
    element where time matches
     */

    TimeOfDay.prototype._evaluateElements = function() {
      var el, period, _i, _len, _ref, _results;
      if (!this.opts.elements.length) {
        return;
      }
      this._rankPeriods();
      _ref = this.opts.elements;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        period = this._getPeriod(el);
        if (!period) {
          continue;
        }
        if (!this._isActive(period.period)) {
          continue;
        }
        if (this.opts.onlyShowNext) {
          if (period.name !== this.activePeriods[0].name) {
            continue;
          }
        }
        this.elementClass(el).add(this.opts.className);
        _results.push(this.elementClass(el).add(period.name + "-active"));
      }
      return _results;
    };


    /*
     * Checks if a period is active
     * @param {Object} time range {from:.., to:...}
     * @returns {Boolean}
     */

    TimeOfDay.prototype._isActive = function(timeRange, now) {
      if (now == null) {
        now = new Date();
      }
      return this._inPeriod(now, timeRange);
    };


    /*
    Checks the list of options
    and returns the matching period
    or false if period not found
    @param {DOM Element}
    @return {Object}
     */

    TimeOfDay.prototype._getPeriod = function(el) {
      var time, timeOfDay;
      timeOfDay = el.getAttribute('data-time-of-day');
      if (!timeOfDay) {
        return false;
      }
      if (!(timeOfDay in this.opts.timesOfDay)) {
        throw new Error(timeOfDay + " not found in available periods");
        return false;
      }
      return time = {
        period: this.opts.timesOfDay[timeOfDay],
        name: timeOfDay
      };
    };

    TimeOfDay.prototype._rankPeriods = function(nowOverride) {
      var compare, name, obj, period, _ref;
      compare = (function(_this) {
        return function(a, b) {
          var aCountdown, bCountdown;
          aCountdown = _this._getTimeUntilEnd(a);
          bCountdown = _this._getTimeUntilEnd(b);
          return aCountdown > bCountdown;
        };
      })(this);
      this.activePeriods = [];
      _ref = this.opts.timesOfDay;
      for (name in _ref) {
        period = _ref[name];
        obj = {
          name: name,
          from: period.from,
          to: period.to
        };
        if (this._isActive(period, nowOverride)) {
          this.activePeriods.push(obj);
        }
      }
      this.activePeriods.sort(compare);
      return this.activePeriods;
    };


    /*
     * Gets the period of time until
     * the end of the given period
     * @param {Object} {from:..., to:..}
     * @return {Integer} number of minutes
     */

    TimeOfDay.prototype._getTimeUntilEnd = function(period) {
      var endTime, now, timeRemaining;
      now = this._getMinutesSinceMidnight();
      endTime = this._getMinutesSinceMidnight(period.to);
      timeRemaining = endTime - now;
      if (timeRemaining < 0) {
        timeRemaining = ((24 * 60) + endTime) - now;
      }
      return timeRemaining;
    };


    /*
     * Calculates the number of minutes
     * since midnight
     * @param {String} time (in format HH:MM)
     * @return {Integer} minutes
     */

    TimeOfDay.prototype._getMinutesSinceMidnight = function(time) {
      var hoursMins, matches;
      if (time == null) {
        time = new Date();
      }
      matches = time.toString().match(/\d\d\:\d\d[^ ]?/);
      if (!matches.length) {
        return 0;
      }
      hoursMins = matches[0];
      return this._convertHoursMinsToMins(hoursMins);
    };

    TimeOfDay.prototype._convertHoursMinsToMins = function(hoursMins) {
      var hours, mins;
      hours = parseInt(hoursMins.replace(/\:.*$/, ''));
      mins = parseInt(hoursMins.replace(/^[^\:]+\:/, ''));
      return (hours * 60) + mins;
    };

    return TimeOfDay;

  })();

  module.exports = TimeOfDay;

}).call(this);
