# React Big Schedule (react-big-schedule)

[![NPM version][npm-image]][npm-url] [![MIT License][mit-image]][mit-url] [![CodeQL][codeql-image]][codeql-url] [![CodeFactor][codeFactor-badge]][codeFactor-link]

[npm-image]: http://img.shields.io/npm/v/react-big-schedule.svg
[npm-url]: http://npmjs.org/package/react-big-schedule
[mit-image]: https://img.shields.io/badge/License-MIT-green.svg
[mit-url]: https://github.com/ansulagrawal/react-big-schedule/blob/master/LICENSE
[codeql-image]: https://github.com/ansulagrawal/react-big-schedule/actions/workflows/github-code-scanning/codeql/badge.svg?branch=master
[codeql-url]: https://github.com/ansulagrawal/react-big-schedule/actions/workflows/github-code-scanning/codeql
[codeFactor-badge]: https://www.codefactor.io/repository/github/ansulagrawal/react-big-schedule/badge
[codeFactor-link]: https://www.codefactor.io/repository/github/ansulagrawal/react-big-schedule

React Big Schedule is a powerful and intuitive scheduler and resource planning solution built with React. Seamlessly integrate this modern, browser-compatible component into your applications to effectively manage time, appointments, and resources. With drag-and-drop functionality, interactive UI, and granular views, react-big-schedule empowers users to effortlessly schedule and allocate resources with precision.

Enhance productivity and streamline your workflow with this React-based solution, designed to optimize time management and simplify calendar-based operations. Perfect for applications requiring advanced scheduling capabilities, react-big-schedule offers a seamless and intuitive experience for managing appointments, resource allocation, and time slots.

Unlock the potential of your React projects with react-big-schedule and revolutionize the way you handle scheduling and resource planning.

### This project code is forked from:

- [react-big-scheduler](https://stephenchou1017.github.io/scheduler/#/).
- [react-big-scheduler-stch](https://github.com/hbatalhaStch/react-big-scheduler).

## Installation

To install react-big-schedule, use npm:

```bash
  npm install react-big-schedule
```

## Tech Stack

- React
- Ant Design
- react-dnd
- react-dnd-html5-backend
- webpack
- dayjs

## Features

- Modern and intuitive scheduler component for React applications.
- Seamless integration with React projects.
- Drag-and-drop functionality for effortless scheduling.
- Interactive user interface for a smooth user experience
- Granular views to manage time, appointments, and resources effectively.
- Optimized for time management and calendar-based operations.
- Perfect for applications requiring advanced scheduling capabilities.

## Contributions

Contributions to react-big-schedule are welcome! If you find a bug or want to contribute to the project, please follow these steps:

1. Fork the repository on GitHub.
2. Create a new branch with a descriptive name.
3. Make your changes and commit them with clear messages.
4. Push your changes to your forked repository.
5. Submit a pull request to the master repository.

Please ensure that your code adheres to the project's coding conventions and includes appropriate tests.

## License

React Big Schedule is released under the MIT License. See the [LICENSE](https://github.com/ansulagrawal/react-big-schedule/blob/master/LICENSE) file for more details.

## Support

If you have any questions or need support, please create an issue in the [GitHub repository](https://github.com/ansulagrawal/react-big-schedule/issues).

## Credits

React Big Schedule is developed and maintained by the React Big Schedule team. We would like to thank the open-source community for their valuable contributions and feedback.

Special thanks to the following contributors:

- Ansul Agrawal ([@ansulagrawal](https://github.com/ansulagrawal))
- Jitendra Soni ([@JitendraSoni1234](https://github.com/JitendraSoni1234))
- hbatalhaStch [[@hbatalhaStch](https://github.com/hbatalhaStch))
- DamyanBG ([@DamyanBG](https://github.com/DamyanBG))

## Acknowledgments

We would like to acknowledge the following projects for their inspiration and contributions:

- [react-big-scheduler](https://stephenchou1017.github.io/scheduler/#/).
- [react-big-scheduler-stch](https://github.com/hbatalhaStch/react-big-scheduler).

## Roadmap

- Additional view options for different scheduling needs.
- Support for recurring appointments.
- Integration with popular calendar services.
- Improved accessibility and localization support.
- Performance optimizations for handling large data sets.

We are continuously working on enhancing react-big-schedule and welcome your feedback and suggestions for future improvements.

## Changelog

Please refer to the [CHANGELOG.md](https://github.com/ansulagrawal/react-big-schedule/blob/master/CHANGELOG.md) file.

## Use and Setup

1.) Installation

```
  npm i react-big-schedule
```

or

```
  yarn add react-big-schedule
```

2.) Import dependencies

```
import { Scheduler, SchedulerData, ViewType, DATE_FORMAT } from "react-big-schedule";
import dayjs from "dayjs";
import "react-big-schedule/dist/css/style.css";
```

3.) Basic Usage

```js
const schedulerData = new SchedulerData(new dayjs().format(DATE_FORMAT), ViewType.Week);

//set locale dayjs to the schedulerData, if your locale isn't English. By default, Scheduler comes with English(en, United States).
schedulerData.setSchedulerLocale('pt-br'); // this uses dayjs, but it doesn't require dayjs to be installed as its called dynamically
schedulerData.setCalendarPopoverLocale('pt_BR'); // this uses antd [List of supported locales](https://ant.design/docs/react/i18n#supported-languages)

schedulerData.setResources([
  { id: 'r0', name: 'Resource0', groupOnly: true },
  { id: 'r1', name: 'Resource1' },
  { id: 'r2', name: 'Resource2', parentId: 'r0' },
  { id: 'r3', name: 'Resource3', parentId: 'r4' },
  { id: 'r4', name: 'Resource4', parentId: 'r2' },
]);

// the event array should be sorted in ascending order by event.start property
// otherwise there will be some rendering errors
schedulerData.setEvents([
  {
    id: 1,
    start: '2022-12-18 09:30:00',
    end: '2022-12-19 23:30:00',
    resourceId: 'r1',
    title: 'I am finished',
    bgColor: '#D9D9D9',
  },
  {
    id: 2,
    start: '2022-12-18 12:30:00',
    end: '2022-12-26 23:30:00',
    resourceId: 'r2',
    title: 'I am not resizable',
    resizable: false,
  },
  {
    id: 3,
    start: '2022-12-19 12:30:00',
    end: '2022-12-20 23:30:00',
    resourceId: 'r3',
    title: 'I am not movable',
    movable: false,
  },
  {
    id: 4,
    start: '2022-12-19 14:30:00',
    end: '2022-12-20 23:30:00',
    resourceId: 'r1',
    title: 'I am not start-resizable',
    startResizable: false,
  },
  {
    id: 5,
    start: '2022-12-19 15:30:00',
    end: '2022-12-20 23:30:00',
    resourceId: 'r2',
    title: 'R2 has recurring tasks every week on Tuesday, Friday',
    rrule: 'FREQ=WEEKLY;DTSTART=20221219T013000Z;BYDAY=TU,FR',
    bgColor: '#f759ab',
  },
]);

// ...

//3. render the scheduler component, mind that the Scheduler component should be placed in a DragDropContext(father or ancestor).

<Scheduler
  schedulerData={schedulerData}
  prevClick={this.prevClick}
  nextClick={this.nextClick}
  onSelectDate={this.onSelectDate}
  onViewChange={this.onViewChange}
  eventItemClick={this.eventClicked}
/>;
```

### Run examples locally

- Clone this repository
- Retrieve dependencies: `npm install` or `npm i`
- Start: `npm run start`
- Open [http://localhost:8080](http://localhost:8080).

If you fail to execute the `npm install` command, remove the package-lock.json file and try again.

# API

### SchedulerData

SchedulerData is the view model of Scheduler, we can modify it to control the view of the Scheduler.

#### constructor

```js
constructor(date=dayjs().format(DATE_FORMAT), viewType = ViewType.Week,
                showAgenda = false, isEventPerspective = false,
                newConfig = undefined, newBehaviors=undefined
                localeDayjs = undefined)
```

- `date` is a string in `YYYY-MM-DD` format, and is the initial date Scheduler will render. Take the date `2022-12-20`
  for example, Scheduler will render the time window of the week from `2022-12-18` to `2022-12-24` in `ViewType.Week`
  view type, and will render the time window of the `2022-12` month in `ViewType.Month` view type.
- `viewType` is the initial view type, now Scheduler supports `Day`, `Week`, `Month`, `Quarter`, `Year` 5 built-in view types,
  in addition Scheduler now supports `Custom`, `Custom1`, `Custom2` 3 custom view types at the same time, in which you can control
  the time window yourself, refer to [this example](https://stephenchou1017.github.io/scheduler/#/customtimewindow). `viewType`,
  `showAgenda` and `isEventPerspective` are a group which should be contained in the SchedulerData.config.views array,
  and they together decide which view should be rendered. When `showAgenda` and `isEventPerspective` are both `false`,
  Scheduler will render the resource view, refer to [this example](https://stephenchou1017.github.io/scheduler/#/views).
- `showAgenda` is a bool value, if true, Scheduler will display the agenda view of current view type. Agenda view is
  read only.
- `isEventPerspective` is a bool value, if true, Scheduler will display the task view of current view type. In
  resource view, every slot(row) describes how many events a resource does in the time window, while in task view,
  every slot describes how many events a big task is divided into and who will make it done. Add a `groupId` and
  `groupName` property to every event object, so that the events having the same `groupId` will belong to the same big task and
  be rendered in the same slot in task view. If `groupId` and `groupName` are not provided, SchedulerData will take
  the `id` as the `groupId`, and take the `title` as the `groupName`. See the `eventsForTaskView` in the
  [sample1.js](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/sample-data/sample1.js) for details.
- `newConfig` is a config object, used to override the [default config](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/config/scheduler.js)
  fully or partly.
- `newBehaviors` is a config object, used to override the [default behaviors](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/helper/behaviors.js)
  fully or partly.
- `localeDayjs` is a locale dayjs object, which is unified used in react-big-scheduler. If not provided, Scheduler will come
  with English(en, United States) locale strings.

#### setSchedulerLocale

```js
setSchedulerLocale(preset);
```

Used to set locale to the scheduler, it uses dayjs locales ([List of supported locales](https://github.com/iamkun/dayjs/tree/dev/src/locale)) and it is loaded on demand.

`preset` will be locale imported from dayjs.

#### example:

```js
import * as dayjsLocale from 'dayjs/locale/pt-br';

setSchedulerLocale(dayjsLocale);
```

By default, Scheduler comes with English(en, United States)

#### setCalendarPopoverLocale

```js
setCalendarPopoverLocale(lang);
```

Used to set locale to the calendar popover. it uses antd locales ([List of supported locales](https://ant.design/docs/react/i18n#supported-languages)). By default, it comes with English(en, United States)

#### example:

```js
import * as antdLocale from 'antd/locale/pt_BR';

setCalendarPopoverLocale(antdLocale);
```

refer this for the demo of the locale.

#### setResources

```js
setResources(resources);
```

Used to set the resources(the slots in resource view), make sure that there are no duplicated `resource.id` in the `resources`.
See the demo `resources` in the [sample1.js](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/sample-data/sample1.js).

#### setEvents

```js
setEvents(events);
```

Used to set the events. the event array should be sorted in ascending order by event.start property.
See the demo `events` in the [sample1.js](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/sample-data/sample1.js).
If we use the task view, we'd better add the `groupId` and the `groupName` property to each event object, see the
`eventsForTaskView` in the [sample1.js](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/sample-data/sample1.js) for details.

#### prev

```js
prev();
```

Let the time window scroll to the left once. When `SchedulerData,viewType` is `ViewType.Month`, the time window will
scroll a month, when `SchedulerData,viewType` is `ViewType.Week`, the time window will scroll a week. `SchedulerData.events`
will be clear after calling this method.

#### next

```js
next();
```

Let the time window scroll to the right once. `SchedulerData.events` will be clear after calling this method.

#### setDate

```js
setDate((date = dayjs().format(DATE_FORMAT)));
```

Let the time window jump to the provided `date` directly. `SchedulerData.events` will be clear after calling this method.

#### setViewType

```js
setViewType((viewType = ViewType.Week), (showAgenda = false), (isEventPerspective = false));
```

Tell SchedulerData to change current view, the `viewType`, `showAgenda` and `isEventPerspective` group should be
provided, and should be contained in the `SchedulerData.config.views` array. `SchedulerData.events` will be clear
after calling this method.

#### setEventGroups

```js
setEventGroups(eventGroups);
```

Used to set the event groups(the slots in task view), make sure that there are no duplicated `eventGroup.id` in the `eventGroups`.
This method is optional, and is needed only when `SchedulerData.eventGroupsAutoGenerated` is `false`.

#### setEventGroupsAutoGenerated

```js
setEventGroupsAutoGenerated(autoGenerated);
```

Tell SchedulerData to generate `SchedulerData.eventGroups` automatically or not. If `true`, SchedulerData will generate the event
groups(slots) automatically according to the `event.groupId` and 'event.groupName' automatically. If `groupId` and 'groupName' are
not provided, SchedulerData will take `event.id` and `event.title` instead.

#### setMinuteStep

```js
setMinuteStep(minuteStep);
```

Used to set minute step for daily view and refresh the render data.

#### toggleExpandStatus

```js
toggleExpandStatus(slotId);
```

Used to toggle slot's(and its children's) expand status.

#### getMinuteStepsInHour

```js
getMinuteStepsInHour();
```

Used to get minute steps in an hour, it equals 60 / SchedulerData.config.minuteStep.

#### addResource

```js
addResource(resource);
```

Add the `resource` to the `SchedulerData.resources`, make sure that `resource.id` is not duplicated. Refer
to [this example](https://stephenchou1017.github.io/scheduler/#/addresource).

#### addEventGroup

```js
addEventGroup(eventGroup);
```

Add the `eventGroup` to the `SchedulerData.eventGroups`, make sure that `eventGroup.id` is not duplicated. Please note
that the `eventGroup` added may be override when `SchedulerData.eventGroupsAutoGenerated` is `true` and
`SchedulerData.eventGroups` is auto-generated.

#### addEvent

```js
addEvent(newEvent);
```

Add the `newEvent` to the `SchedulerData.events`, make sure that `newEvent.id` is not duplicated. SchedulerData will
place the `newEvent` in the right index according to the `newEvent.start` property.

#### updateEventStart

```js
updateEventStart(event, newStart);
```

Update the `newStart` to the `event.start`, `newStart` is a string in `YYYY-MM-DD HH:mm:ss` format(similarly hereinafter).
SchedulerData will replace the `event` in the right index according to the `newStart` value.

#### updateEventEnd

```js
updateEventEnd(event, newEnd);
```

Update the `newEnd` to the `event.end`.

#### moveEvent

```js
moveEvent(event, newSlotId, newSlotName, newStart, newEnd);
```

Update the `newSlotId`, `newSlotName`, `newStart`, `newEnd` of the `event`. In resource view, new slot is a resource,
while in task view, new slot is a event group. SchedulerData will replace the `event` in the right index according
to the `newStart` value.

#### removeEvent

```js
removeEvent(event);
```

Remove the given event from `SchedeulerData.events`.

#### removeEventById

```js
removeEventById(eventId);
```

Remove event from `SchedeulerData.events` by the given event id.

#### getSlots

```js
getSlots();
```

Returns the slot array, `SchedulerData.resources` in resource view, `SchedulerData.eventGroups` in task view.

#### getSlotById

```js
getSlotById(slotId);
```

Returns the slot by `slotId`, returns `undefined` if not found.

#### getResourceById

```js
getResourceById(resourceId);
```

#### isEventInTimeWindow

```js
isEventInTimeWindow(eventStart, eventEnd, windowStart, windowEnd);
```

Returns whether an event is in the time window or not, remind that `eventStart`, `eventEnd`, `windowStart`, `windowEnd`
are all dayjs | Date objects.

#### getViewDates

```js
getViewDates();
```

Returns an object with the startDate and endDate of the currently selected view ({ startDate: Dayjs, endDate: Dayjs }).

#### getViewStartDate

```js
getViewStartDate();
```

Returns a dayjs object with the startDate of the currently selected view.

#### getViewEndDate

```js
getViewEndDate();
```

Returns a dayjs object with the endDate of the currently selected view.

### Locale support(Refer to [this example](https://stephenchou1017.github.io/scheduler/#/locale) for details.)

#### SchedulerData.config.resourceName

The locale string of resource name.

#### SchedulerData.config.taskName

The locale string of task name.

#### SchedulerData.config.agendaViewHeader

The locale string of agenda view header.

#### SchedulerData.config.addMorePopoverHeaderFormat

The locale string of add more popover header format.

#### SchedulerData.config.eventItemPopoverDateFormat

The locale string of event item popover date format.

#### SchedulerData.config.nonAgendaDayCellHeaderFormat

The locale string of non-agenda view cell header format of day view type.

#### SchedulerData.config.nonAgendaOtherCellHeaderFormat

The locale string of non-agenda view cell header format of other view types.

#### SchedulerData.behaviors.getDateLabelFunc

Used to resolve the locale string of date label of Scheduler component.(Refer to the [getDateLabel](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/helper/behaviors.js) func for example)

### SchedulerData.config(See the [config file](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/config/scheduler.js) for details.)

#### schedulerWidth

The width of Scheduler. Scheduler uses responsive layout so schedulerWidth should be a percentage,
Scheduler in the responsive layout:
`actual width of Scheduler = (SchedulerData.documentWidth - SchedulerData.config.besidesWidth) * SchedulerData.config.schedulerWidth`
`SchedulerData.documentWidth` is the window width of browser (or the the parent width in case SchedulerData.config.responsiveByParent
and Scheduler component prop parentRef is passed) and will change automatically when resized.

#### responsiveByParent

When true, Scheduler resposiveness will not be determined by the window width of browser but instead by the
width of the of the parent (the parent ref must be passed to the Scheduler component prop named `parentRef`,
in case it is not passed resposiveness will fall back to being determined by the window width).
Meaning:
`SchedulerData.documentWidth` is the width of the parent and will change automatically when resized

#### schedulerMaxHeight

The max height of Scheduler. If the desired height is bigger than the max height, the header row of Scheduler will be
frozen and vertical scroll bar will appear, but this won't happen when the max height is set to `0`. Refer
to [this example](https://stephenchou1017.github.io/scheduler/#/freezefirstrow).

#### tableHeaderHeight

Height of Scheduler table header.

#### agendaResourceTableWidth

Width of the left Scheduler resource column in agenda view.

#### agendaMaxEventWidth

Max width of an event item in agenda view.

#### dayResourceTableWidth, weekResourceTableWidth, monthResourceTableWidth, yearResourceTableWidth, quarterResourceTableWidth

Width of the left Scheduler resource column in resource view and task view of different view types.

#### dayCellWidth, weekCellWidth, monthCellWidth, yearCellWidth, quarterCellWidth

Width of Scheduler table cells in resource view and task view of different view types.

#### dayMaxEvents, weekMaxEvents, monthMaxEvents, yearMaxEvents, quarterMaxEvents

Max events count of a cell in resource view and task view of different view types. A '+N more' will appear when exceeded.
Refer to [this example](https://stephenchou1017.github.io/scheduler/#/addmore).

#### eventItemHeight

Height of an event item in 3 views.

#### eventItemLineHeight

Line height of an event item in 3 views.

#### nonAgendaSlotMinHeight

Min height of a slot in non-agenda views, default 0, means there is no min height.

#### dayStartFrom

Start hour rendered from in `ViewType.Day` in resource view and task view, default 0.

#### dayStopTo

End hour rendered to in `ViewType.Day` in resource view and task view, default 23.

#### defaultEventBgColor

Default event item background color in 3 views, will be override if there is a `bgColor` property in event object.

#### selectedAreaColor

Selected cells color in resource view and task view, cells are selectable only when `creatable` is `true`.

#### nonWorkingTimeHeadColor

Color of non-working time head cells. Modify `SchedulerData.behaviors.isNonWorkingTimeFunc` to re-define non-working time.
Refer the `isNonWorkingTime` func in the [behaviors.js](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/helper/behaviors.js).

#### nonWorkingTimeHeadBgColor

Background color of non-working time head cells.

#### nonWorkingTimeBodyBgColor

Background color of non-working time body cells.

#### summaryColor

Color of cell summary. Modify `SchedulerData.behaviors.getSummaryFunc` to display summary in a cell.
Refer the `getSummary` func in the [behaviors.js](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/helper/behaviors.js).

#### summaryPos

Position of cell summary, supports `SummaryPos.Top`, `SummaryPos.TopRight`, `SummaryPos.TopLeft`, `SummaryPos.Bottom`,
`SummaryPos.BottomRight` and `SummaryPos.BottomLeft`.

#### startResizable

Controls whether to resize the start of every event item in resource view and task view. If `false`, all item starts are
non-resizable, if `true`, all item starts are resizable except those who have a `resizable` or `startResizable`
property and its value is `false`.

#### endResizable

Controls whether to resize the end of every event item in resource view and task view. If `false`, all item ends are
non-resizable, if `true`, all item ends are resizable except those who have a `resizable` or `endResizable`
property and its value is `false`.

#### movable

Controls whether to move every event item in resource view and task view. If `false`, all items are
non-movable, if `true`, all items are movable except those who have a `movable` property and its value is `false`.

#### creatable

Controls whether to create new event item in resource view and task view.

#### crossResourceMove

Controls whether to cross-slot move an event item in resource view and task view. If `false`, the `slotId` and `slotName`
won't change in the `moveEvent` method. Refer to [this example](https://stephenchou1017.github.io/scheduler/#/nocrossslotmove).

#### checkConflict

Controls whether to check conflicts when creating, resizing or moving an event item in resource view and task view. If
`true`, Scheduler will call the `conflictOccurred` function if given. Refer to
[this example](https://stephenchou1017.github.io/scheduler/#/overlapcheck).

#### scrollToSpecialDayjsEnabled

Controls Scheduler whether to scroll to special dayjs automatically when the time window contains special dayjs. If `true`, Scheduler
horizontal bar will scroll to special dayjs after calling `setScrollToSpecialDayjs(true)` to SchedulerData. Use `SchedulerData.behaviors.getScrollSpecialDayjsFunc`
to tell Scheduler what time the special dayjs is.

#### eventItemPopoverEnabled

Controls Scheduler whether to display event item popover when moving mouse on an event item, default `true`.

#### eventItemPopoverTrigger

Controls Scheduler event item popover trigger, default `hover`.
Controls Scheduler whether to display event item popover when moving mouse on an event item, default `true`.

#### eventItemPopoverPlacement

Controls Scheduler event item popover placement (`'topLeftMousePosition' | 'bottomLeftMousePosition' | 'topRightMousePosition' | 'bottomRightMousePosition' | 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'`), default `bottomLeft`.

#### eventItemPopoverWidth

Controls Scheduler event item popover width. Should be taken into account when you set `eventItemPopoverPlacement` to one of the `...MousePosition` options and you set your own event item popover by setting `eventItemPopoverTemplateResolver` as `eventItemPopoverWidth` is used to determine when the event item popover content goes off the screen so the popover can be adjusted accordingly. Defaults to 300.

#### calendarPopoverEnabled

Controls Scheduler whether to display calendar popover when clicking on a date label in header, default `true`.

#### recurringEventsEnabled

Controls Scheduler whether to support recurring event, refer to [this feature request](https://github.com/StephenChou1017/react-big-scheduler/issues/8), default `true`.
If `true`, SchedulerData will filter out those template events who has a `rrule` string property in `setEvents` method,
generate the recurring events in the time window, and insert them into the event array in the right orders. The recurring events
generated from the same template event, all have a new id like `${templateEvent.id}-${number}`, and have a `recurringEventId`
property with the value `templateEvent.id`.

#### headerEnabled

Controls Scheduler whether to display header, default `true`.

#### resourceViewEnabled

Controls Scheduler whether to display resource view, default `true`.

#### displayWeekend

Controls Scheduler whether to display weekends in non-agenda view, default `true`.

#### relativeMove

Controls Scheduler whether to move events(only DnDTypes.EVENT type) relatively or absolutely, default `true`, means relatively.

#### minuteStep

Minute step for day view type in non-agenda view, can be 10, 12, 15, 20, 30, 60, etc, default 30.

#### views

Array of view that Scheduler will support.

#### dragAndDropEnabled

Controls whether the dragAndDrop funcionality is enabled. If false there's no need for the [withDnDContext wrapper function](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/components/WrapperFun.jsx).

### SchedulerData.behaviors(See the [behaviors.js](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/helper/behaviors.js) for details.)

#### getEventTextFunc

```js
getEventTextFunc(schedulerData, event);
```

Method that defines the text displayed in the `event`.

#### isNonWorkingTimeFunc

```js
isNonWorkingTimeFunc(schedulerData, time);
```

Method that defines non-working time.

#### getSummaryFunc

```js
getSummary(schedulerData, headerEvents, slotId, slotName, headerStart, headerEnd);
```

Method that defines the summary text displayed in the Scheduler cells.Refer
to [this example](https://stephenchou1017.github.io/scheduler/#/summary).

#### getCustomDateFunc

```js
getCustomDate(schedulerData, num, (date = undefined));
```

Method that controls the start and end of time window when current view type is Custom, Custom1 or Custom2.Refer
to [this example](https://stephenchou1017.github.io/scheduler/#/customtimewindow).

#### getNonAgendaViewBodyCellBgColorFunc

```js
getNonAgendaViewBodyCellBgColor(schedulerData, slotId, header);
```

Method that sets the background color of cells dynamically.

#### getScrollSpecialDayjsFunc

```js
getScrollSpecialDayjs(schedulerData, startDayjs, endDayjs);
```

Method that defines the special dayjs Scheduler will scroll to automatically, when the time window contains that dayjs.

### Scheduler.propTypes

#### schedulerData

```js
schedulerData: PropTypes.object.isRequired;
```

View model of the Scheduler component, provides data.

#### parentRef

```js
parentRef: PropTypes.object;
```

ref of the component that is the parent of the Scheduler component

#### prevClick

```js
prevClick: PropTypes.func.isRequired;
prevClick(schedulerData);
```

Callback function fired when the left point bracket '<' is clicked.

#### nextClick

```js
nextClick: PropTypes.func.isRequired;
nextClick(schedulerData);
```

Callback function fired when the right point bracket '>' is clicked.

#### onViewChange

```js
onViewChange: PropTypes.func.isRequired;
onViewChange(schedulerData, view);
```

Callback function fired when the Scheduler view changed. `view` is a json such as { viewType: ViewType.Month,
showAgenda: true, isEventPerspective: false}.

#### onSelectDate

```js
onSelectDate: PropTypes.func.isRequired;
onSelectDate(schedulerData, date);
```

Callback function fired when a new date is selected. `date` is the new selected data, a string in `YYYY-MM-DD` format.

#### eventItemClick

```js
eventItemClick: PropTypes.func;
eventItemClick(schedulerData, event);
```

Callback function fired when you click an event item.

#### updateEventStart

```js
updateEventStart: PropTypes.func;
updateEventStart(schedulerData, event, newStart);
```

Callback function fired when resizing the start of the `event`, `newStart` is a string in `YYYY-MM-DD HH:mm:ss` format.

#### updateEventEnd

```js
updateEventEnd: PropTypes.func;
updateEventEnd(schedulerData, event, newEnd);
```

Callback function fired when resizing the end of the `event`, `newEnd` is a string in `YYYY-MM-DD HH:mm:ss` format.

#### moveEvent

```js
moveEvent: PropTypes.func;
moveEvent((schedulerData, event, slotId, slotName, newStart, newEnd));
```

Callback function fired when moving the `event`. `slotId`, `slotName` are the new `id` and `name` of the slot moving into,
but they won't change if the `SchedulerData.config.crossResourceMove` is `false`. `newStart`, `newEnd` are the new beginning
and ending of the `event`.

#### newEvent

```js
newEvent: PropTypes.func;
newEvent(schedulerData, slotId, slotName, start, end, type, item);
```

Callback function fired when creating a new event, or dragging an external item and dropping it into the resource view or task
view. `slotId` and `slotName` are the slot creating in or dropping into, `start`, `end` are the beginning and ending of the
event. If it's a drag&drop operation, the `type` is the DnDType of DnDSource registered to Scheduler, and the `item` is the
external item.

#### leftCustomHeader, rightCustomHeader

```js
leftCustomHeader: PropTypes.object;
rightCustomHeader: PropTypes.object;
```

Component you need to put in the Scheduler header, it could be a div or a react component. Refer
to [this example](https://stephenchou1017.github.io/scheduler/#/customheader).

#### conflictOccurred

```js
conflictOccurred: PropTypes.func;
conflictOccurred(schedulerData, action, event, type, slotId, slotName, start, end);
```

Callback function fired when there is a conflict. This could happen when creating, resizing or moving an event, and when  
 `SchedulerData.config.checkConflict` is `true`.

#### eventItemTemplateResolver

```js
eventItemTemplateResolver: PropTypes.func;
eventItemTemplateResolver(schedulerData, event, bgColor, isStart, isEnd, mustAddCssClass, mustBeHeight, agendaMaxEventWidth);
```

Use this function, you can customize the event style. Refer to [this example](https://stephenchou1017.github.io/scheduler/#/customeventstyle).

### eventItemPopoverTemplateResolver

```js
eventItemPopoverTemplateResolver: PropTypes.func;
eventItemPopoverTemplateResolver(schedulerData, eventItem, title, start, end, statusColor);
```

Use this function, you can customize the event's popover style. Refer to [this example](https://stephenchou1017.github.io/scheduler/#/custompopover).

#### slotItemTemplateResolver

```js
slotItemTemplateResolver: PropTypes.func;
slotItemTemplateResolver(schedulerData, slot, slotClickedFunc, width, clsName);
```

Use this function, you can customize the left slot style.

#### nonAgendaCellHeaderTemplateResolver

```js
nonAgendaCellHeaderTemplateResolver: PropTypes.func;
nonAgendaCellHeaderTemplateResolver(schedulerData, item, formattedDateItems, style);
```

Use this function, you can customize the table header cell style. Refer to [this example](https://stephenchou1017.github.io/scheduler/#/customtableheaders).

#### onScrollLeft, onScrollRight

```js
onScrollLeft: PropTypes.func;
onScrollLeft(schedulerData, schedulerContent, maxScrollLeft);
onScrollRight: PropTypes.func;
onScrollRight(schedulerData, schedulerContent, maxScrollLeft);
```

Callback function fired when the scheduler content div scrolls to leftmost or rightmost. Refer to [this example](https://stephenchou1017.github.io/scheduler/#/infinitescroll).

#### onScrollTop, onScrollBottom

```js
onScrollTop: PropTypes.func;
onScrollTop(schedulerData, schedulerContent, maxScrollTop);
onScrollBottom: PropTypes.func;
onScrollBottom(schedulerData, schedulerContent, maxScrollTop);
```

Callback function fired when the scheduler content div scrolls to topmost or bottommost. Refer to [this example](https://stephenchou1017.github.io/scheduler/#/infinitescroll).

#### slotClickedFunc

```js
slotClickedFunc: PropTypes.func;
```

If it's set, slots will be clickable, and will fire this function when a slot is clicked. Refer
to [this example](https://stephenchou1017.github.io/scheduler/#/resourceclickable).

#### dndSources

```js
dndSources: PropTypes.array;
```

DnDSource array that registered to Scheduler. Use [DnDSource](https://github.com/ansulagrawal/react-big-schedule/blob/master/src/components/DnDSource.js),
we can simplify the drag and drop coding in React-Big-Scheduler. Refer
to [this example](https://stephenchou1017.github.io/scheduler/#/draganddrop).

#### onSetAddMoreState

```js
onSetAddMoreState: PropTypes.func;
onSetAddMoreState(newState);
```

Callback function fired when a '+N more' is clicked, is used to control the visibility and the position of the `AddMorePopover`.
`newState` is a json such as {headerItem: headerItem, left: 20, top: 20, height: 100}. Refer
to [this example](https://stephenchou1017.github.io/scheduler/#/addmore).

#### subtitleGetter

```js
subtitleGetter: PropTypes.func;
subtitleGetter(schedulerData, event);
```

Use this function, you can display a subtitle in the `EventItemPopover`.

#### viewEventClick

```js
viewEventClick: PropTypes.func;
viewEventClick(schedulerData, event);
```

Callback function fired when you click one operation link in the `EventItemPopover`. The operation link won't appear if this
function isn't set.

#### viewEventText

```js
viewEventText: PropTypes.string;
```

Text of one operation link in the `EventItemPopover`. The operation link won't appear if this text isn't set.

#### viewEvent2Click

```js
viewEvent2Click: PropTypes.func;
viewEvent2Click(schedulerData, event);
```

Callback function fired when you click the other operation link in the `EventItemPopover`. The other operation link won't
appear if this function isn't set.

#### viewEvent2Text

```js
viewEvent2Text: PropTypes.string;
```

Text of the other operation link in the `EventItemPopover`. The other operation link won't appear if this text isn't set.
