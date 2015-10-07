Time Of Day.js
================

A javascript library for alternating classes on a dom
element based on the time of day


##Installation

            npm install time-of-day --save


##Usage

Javascript (using browserify / common js):
(Alternatively if you want to use the standalone version
include the file in ./dist/time-of-day.js and access via window.TimeOfDay)

            var TimeOfDay = require('time-of-day');

            timeOfDayInstance = new TimeOfDay({

                // required - array of elements whose classes
                // will be modified
                elements: $('.items-to-change').get(),

                // class that gets appended
                // when the timezone on the user's computer
                // matches
                className: 'item-active',

                // optional times of day
                timesOfDay: {
                    morning: {
                        from: '03:00',
                        to: '12:00'
                    },
                    lunch: {
                        from: '12:00',
                        to: '16:00'
                    },
                    dinner: {
                        from: '16:00',
                        to: '23:00',
                    }
                }
            });


HTML:

            <div data-time-of-day="morning">
                <h1>It's Morning</h1>
            </div>
            <div data-time-of-day="lunch">
                <h1>It's Lunch Time</h1>
            </div>


Licence MIT

Copyright Campbell Morgan 2014
