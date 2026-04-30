import { Controller, Get, Inject } from "@tsed/common";
import { MongooseModel } from '@tsed/mongoose';
import { QueryParams } from '@tsed/platform-params';
import moment, { Moment } from 'moment';
import { TaskTemplate } from '../entities/TaskTemplate';
//import { generateScheduleLogic } from '../utils/scheduler';
import { ContextTemplate, MiniContextTemplate, Project, Task } from '../entities/';
import type { IContext, IMiniContext, ITaskTemplate } from '../interfaces';
import { AddTaskListToEvents, filterTasksForScheduling, getHighestScoredTask, getTaskScore, getTimeEntryEvents, momentFromString, taskFactory, timeDiff } from "../utils/scheduleUtils";


interface ITimeframeContainerForSort {
  name: string
  type: 'context' | 'miniContext'
  startTime: string
  endTime: string
}

export type actionType = 'start' | 'end'

export interface IScheduleItem {
  name: string
  type: 'context' | 'miniContext' | 'task'
  action: actionType
}

interface ITimeEntry {
  time: string
  events: IScheduleItem[]
}


@Controller('/schedule')
export class ScheduleController {

  @Inject(TaskTemplate)
  private taskTemplate!: MongooseModel<TaskTemplate>;

  @Inject(ContextTemplate)
  private contextTemplate!: MongooseModel<ContextTemplate>

  @Inject(MiniContextTemplate)
  private miniContextTemplate!: MongooseModel<MiniContextTemplate>;

  @Inject(Project)
  private project!: MongooseModel<Project>;

  @Inject(Task)
  private task!: MongooseModel<Task>;
  /*
    // GET Schedule with date: 
    // Get the date name (default to todays date)
    // Get the template for the day with that name
    // generate events list
    // iterate through events list:
    //  Get currently relevant tasks
    //  Sort tasks
    //  Add task to events
    getScheduleByDay(date, startTime: 'HH:mm') {
      // contexts, miniContexts, projects
    }
    createEventsListForContexts(contexts, miniContexts, projects) {
      // eventsList
    }
  
    populateEventsListWithTasks(eventsList, excludedTasksList) {
      // explicit start time driven by eventsList first item
      // declare current contexts/miniContexts/projects
      // get next entry time.
      getCurrentlyRelativeTasks(contexts, minicontexts, projects){
        // task[]
      }
      sortTasks(taskList, contexts, minicontexts, projects){
        // task[]
  
      }
      // LOOP:
      // compare next entry time with cursor, if cursor is before, repeat: (otherwise continue)
      addTaskToEvents(task[0], eventsList){
        // events list
      }
      // eventsList
    }
  */



  async getContextMatchingTasks(currentContexts: string[], currentMiniContexts: string[]) {
    const taskList: TaskTemplate[] = []
    const contextMatchedTasks = await this.taskTemplate.find({ 'contexts.name': { $in: currentContexts } })
    const miniContextMatchedTasks = await this.taskTemplate.find({ 'miniContexts.name': { $in: currentMiniContexts } })
    miniContextMatchedTasks.map((task: TaskTemplate) => taskList.push(task))
    contextMatchedTasks.map((task: TaskTemplate) => taskList.push(task))
    return taskList
  }

  @Get('/')
  async getSchedule(@QueryParams('date') date: string) {
    try {
      if (!date) {
        date = moment().format('YYYY-MM-DD')
      }

      console.log("Starting schedule ...")


      /* NOTE: 
       *   list all contexts
        */

      const currentDate = date ? moment(date, 'YYYY-MM-DD') : moment();
      const dayOfWeek = currentDate.day();

      /* NOTE: 
       *   list all contexts
        */
      const contexts: IContext[] = await this.contextTemplate.find({}) // TODO: need to be created from templates first
      const miniContexts: IMiniContext[] = await this.miniContextTemplate.find({}) // TODO: need to be created from templates first
      const projects = await this.project.find({
        isActive: true
      })

      /* NOTE:
       *  list all tasks with a hard date
        */
      const hardTimedTasks = this.taskTemplate.find({ isFlexible: false })

      /* TODO: 
       * calculate the presence of a container with its repeating phases and/or dates
        */

      const allTimeContainers = [
        ...contexts.map(c => (
          {
            startTime: c.startTime,
            endTime: c.endTime,
            name: c.name,
            type: 'context'
          } as ITimeframeContainerForSort)),
        ...miniContexts.map(m => (
          {
            startTime: m.startTime,
            endTime: m.endTime,
            name: m.name,
            type: 'miniContext'
          } as ITimeframeContainerForSort))
      ]
      const OriginalTimelineMap = allTimeContainers.reduce((acc: Record<string, IScheduleItem[]>, item: ITimeframeContainerForSort) => {

        const addEvent = (time: Moment, action: actionType) => {
          const newTime = `${time.hour().toString().padStart(2, '0')}:${time.minute().toString().padStart(2, '0')}`;
          if (!acc[newTime]) acc[newTime] = [];

          acc[newTime].push({
            name: item.name,
            action: action,
            type: item.type
          });
        };
        addEvent(moment(item.startTime, 'HH:mm'), 'start');
        addEvent(moment(item.endTime, "HH:mm"), 'end');
        return acc;
      }, {} as Record<string, IScheduleItem[]>
      )

      let timelineMap = OriginalTimelineMap

      const timeLineKeys = Object.keys(timelineMap)
      const timeLineSorted = timeLineKeys.sort((a, b) => timeDiff(a, b))
      const timeLineMapped = timeLineSorted.map(time => ({
        time: time,
        events: timelineMap[time] as IScheduleItem[]
      }));
      const timeLine = timeLineMapped

      const tasks = await this.task.find({})
      const schedule: Task[] = []

      let taskList: ITaskTemplate[] = []
      let cursor: string // TODO: add type for string of time
      const floatingTime = "06:45"
      let defaultContexts: string[] = []
      let defaultMiniContexts: string[] = []
      for (let i = 0; i < timeLine.length; i++) {
        const timeEntry = timeLine[i]

        const timeSquezedTasks: Task[] = []
        const nextEntry = timeLine[i + 1] ?? { time: '23:59', events: [{ type: '*', action: 'end' }] }

        let { currentContexts, currentMiniContexts } = getTimeEntryEvents(timeEntry, defaultContexts, defaultMiniContexts)

        if (currentContexts.length == 0 && currentMiniContexts.length == 0) {
          return ["no contexts or miniContexts"]
        }
        const entryIsBeforeNow = momentFromString(timeEntry.time).isBefore(momentFromString(floatingTime))
        const nextEntryIsAfterNow = momentFromString(nextEntry.time).isAfter(momentFromString(floatingTime))
        cursor = entryIsBeforeNow ? floatingTime : timeEntry.time
        if (entryIsBeforeNow && !nextEntryIsAfterNow) continue

        console.log("shouldn't get here with time of less than 6:45", timeEntry.time)
        taskList = await this.getContextMatchingTasks(currentContexts, currentMiniContexts)

        let timeTillNextEntry = timeDiff(nextEntry.time, cursor)
        let unscheduledTasks = filterTasksForScheduling(taskList, schedule, timeTillNextEntry)

        while (timeTillNextEntry > 0
          && unscheduledTasks.length > 0
        ) {
          unscheduledTasks = filterTasksForScheduling(unscheduledTasks, schedule, timeTillNextEntry)
          if (unscheduledTasks.length === 0)
            break
          const nextTask = getHighestScoredTask(unscheduledTasks, currentContexts, currentMiniContexts)
          nextTask.startTime = momentFromString(cursor)
          nextTask.endTime = momentFromString(cursor).add(nextTask.duration, 'minutes')
          if (nextTask.startTime.isAfter(nextTask.endTime)) {
            timeSquezedTasks.push(nextTask)
          }

          cursor = momentFromString(cursor).add(nextTask.duration, 'minutes').format("HH:mm")
          schedule.push(nextTask)

          timeTillNextEntry = timeDiff(nextEntry.time, cursor)
          unscheduledTasks = filterTasksForScheduling(unscheduledTasks, schedule, timeTillNextEntry)
        }
        // NOTE:
        // Return the taskInstances list

      }

      let fullTimeLine = timeLine
      console.log("TIMELINE", timeLine)
      let runningSchedule = AddTaskListToEvents(schedule, fullTimeLine)
      runningSchedule = runningSchedule.sort((a, b) => timeDiff(a.time, b.time))
      runningSchedule.map(e =>
        console.log(`${e.time}: ${e.events.map(ee => `${ee.action}-${ee.name}, `)}`))

      // TODO: add task list to the "timeline"
      for (const scheduleTask of schedule) {
        /*console.log()
        console.log(scheduleTask.name)
        console.log("start")
        console.log(scheduleTask.startTime.hour(), ":", scheduleTask.startTime.minute())
        console.log("duration")
        console.log(scheduleTask.duration)*/
      }
      return schedule
    }
    catch (e) {
      console.error(e)

      return ['oops']
    }
  }
}
