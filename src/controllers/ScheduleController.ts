import { Inject, Controller, Post, BodyParams, Get, Put, Delete } from "@tsed/common";
import { QueryParams } from '@tsed/platform-params';
import { MongooseModel } from '@tsed/mongoose';
import moment, { duration, Moment } from 'moment';
import { TaskTemplate } from '../entities/TaskTemplate';
//import { generateScheduleLogic } from '../utils/scheduler';
import type { IContext, IMiniContext, ITaskTemplate } from '../interfaces';
import { Context, ContextTemplate, MiniContext, MiniContextTemplate, Project, Task } from '../entities/';


interface ITimeframeContainerForSort {
  name: string
  type: 'context' | 'miniContext'
  startTime: string
  endTime: string
}

type actionType = 'start' | 'end'

interface IScheduleItem {
  name: string
  type: 'context' | 'miniContext'
  action: actionType
}

interface ITimeEntry {
  time: string
  events: IScheduleItem[]
}

const contextWeight = 1
const miniContextWeight = 2

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

  @Get('/')
  async getSchedule(@QueryParams('date') date: string) {
    try {
      if (!date) {
        date = moment().format('YYYY-MM-DD')
      }

      console.log("Starting schedule ...")

      const timeDiff = (a: string, b: string): number => {
        const [aHour, aMinute] = a.split(':').map(Number);
        const [bHour, bMinute] = b.split(':').map(Number);
        return (aHour * 60 + aMinute) - (bHour * 60 + bMinute);
      }

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
        /*any of the contexts == any of the projects contexts*/
        /*any of the miniContexts == any of the projects miniContexts*/
        isActive: true
      })

      /* NOTE:
       *  list all tasks with a hard date
        */
      const hardTimedTasks = this.taskTemplate.find({ isFlexible: false })
      //console.log("listed all contexts...")
      //console.log(contexts.length)
      //console.log("listed all miniContexts...")
      //console.log(miniContexts.length)

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
      //console.log("all time containers")
      //console.log(allTimeContainers.length)
      const timelineMap = allTimeContainers.reduce((acc: Record<string, IScheduleItem[]>, item: ITimeframeContainerForSort) => {

        const addEvent = (time: Moment, action: actionType) => {
          //console.log("time: ", time)
          //console.log("action: ", action)
          const newTime = `${time.hour().toString().padStart(2, '0')}:${time.minute().toString().padStart(2, '0')}`;

          if (!acc[newTime]) acc[newTime] = [];

          acc[newTime].push({
            name: item.name,
            action: action,
            type: item.type
          });
          //console.log(acc)
        };
        //console.log("ITEM", item)

        addEvent(moment(item.startTime, 'HH:mm'), 'start');
        addEvent(moment(item.endTime, "HH:mm"), 'end');

        return acc;
      }, {} as Record<string, IScheduleItem[]>
      )
      //console.log("timeline map")
      //console.log(timelineMap)

      const timeLineKeys = Object.keys(timelineMap)
      //console.log("keys timeline", timeLineKeys);
      const timeLineSorted = timeLineKeys.sort((a, b) => timeDiff(a, b))
      //console.log("sorted timeline", timeLineSorted);
      const timeLineMapped = timeLineSorted.map(time => ({
        time: time,
        events: timelineMap[time] as IScheduleItem[]
      }));

      //console.log("final timeline", timeLineMapped);
      const timeLine = timeLineMapped

      const tasks = await this.task.find({})

      // set a list of tasks
      const schedule: Task[] = []
      let taskList: ITaskTemplate[] = []
      let cursor: string // TODO: add type for string of time
      let currentContexts: string[] = []
      let currentMiniContexts: string[] = []
      for (let i = 0; i < timeLine.length; i++) {
        const timeEntry = timeLine[i]
        cursor = timeEntry.time
        const nextEntry = timeLine[i + 1] ?? { time: '23:59', events: [{ type: '*', action: 'end' }] }

        // NOTE: get all current contexts into lists
        if (timeEntry.events) {
          timeEntry?.events?.forEach((m) => {
            if (m.type == 'context')
              if (m.action == 'start')
                currentContexts.push(m.name)
              else if (m.action == 'end')
                currentContexts.filter(c => c != m.name)
            if (m.type == 'miniContext' && m.action == 'start')
              if (m.action == 'start')
                currentMiniContexts.push(m.name)
              else if (m.action == 'end')
                currentMiniContexts.filter(c => c != m.name)
          })
          //console.log("timeEntry events: ", timeEntry.time, ":", timeEntry.events)
        }

        // NOTE: filter all tasks by the tasks that have any of event.events.contexts matching any of their contexts. 
        // TODO: if contexts are empty, return all tasks
        (await this.taskTemplate.find({ 'contexts.name': { $in: currentContexts } })).map((task: TaskTemplate) => taskList.push(task));
        (await this.taskTemplate.find({ 'miniContexts.name': { $in: currentMiniContexts } })).map((task: TaskTemplate) => taskList.push(task));
        // at this point, I have a list of tasks that are either in the current context OR miniContext. 
        // Next step is to filter by duration, 

        let timeTillNextEntry = timeDiff(nextEntry.time, cursor)
        taskList = taskList.filter(t => {
          return t.duration < timeTillNextEntry && !schedule.some(s => s.name === t.name)
        })
        let unscheduledTasks = taskList
        //console.log("time till next timeEntry", timeTillNextEntry)
        //console.log("taskList length", taskList.length)
        while (timeTillNextEntry > 0 
          && unscheduledTasks.length > 0 
          && moment(cursor, 'HH:mm').isBefore(moment('23:59', 'HH:mm'))
          && !moment(cursor, 'HH:mm').isSame(moment('00:00', 'HH:mm'),'minute')
          ) {

          unscheduledTasks.filter(t => (t.duration > timeTillNextEntry) && (!schedule.find(s => s.name === t.name)))
          //console.log("unscheduledTasks", unscheduledTasks.length)
          //console.log("time till next entry:", timeTillNextEntry)
          //console.log("cursor at start of while loop", cursor)

          if (unscheduledTasks.length === 0)
            break

          let newTaskList: Task[] = []

          // then give each task a priority weight.
          // .. count the current contexts that match.
          unscheduledTasks.forEach(task => {
            let miniContextCount: number = 0
            let contextCount: number = 0
            if (task.miniContexts)
              miniContextCount = task.miniContexts.filter(ctx =>
                currentMiniContexts.includes(ctx.name)
              ).length;
            if (task.contexts)
              contextCount = task.contexts.filter(ctx =>
                currentContexts.includes(ctx.name)
              ).length;
            // multiply the context by the context type weight. 
            let score = miniContextCount * miniContextWeight
            score += contextCount * contextWeight
            // and save the score.. to use for ordering.

            // TODO: convert to constructor/factory
            const newtask = new Task()
            newtask.score = score
            newtask.name = task.name
            newtask.duration = task.duration
            newtask.contexts = task.contexts
            newtask.miniContexts = task.miniContexts
            newTaskList.push(newtask)
          })
          // NOTE:
          // order the task instances list
          newTaskList.sort((a, b) => {
            const aScore = Number(a?.score)
            const bScore = Number(b?.score)
            return aScore - bScore
          })
          const nextTask = newTaskList[0]
          // console.log("next task",nextTask)
          nextTask.startTime = moment(cursor, 'HH:mm')
          nextTask.endTime = moment(cursor, 'HH:mm').add(nextTask.duration, 'minutes')
          cursor = moment(cursor, "HH:mm").add(nextTask.duration, 'minutes').format("HH:mm")
          schedule.push(nextTask)
          //console.log("Schedule: ",schedule.length)
          //console.log("cursor", cursor)

          timeTillNextEntry = timeDiff(nextEntry.time, cursor)
          //console.log(moment(cursor,"HH:mm"))
            //console.log("schedule", schedule.length)
            //console.log("task list ", unscheduledTasks.length)
          unscheduledTasks = unscheduledTasks.filter(t => {
            //console.log(t.duration, t.name)
            //console.log(!schedule.some(s=> {return s.name == t.name}))
            //console.log(t.duration > timeTillNextEntry)
            return (t.duration > timeTillNextEntry) && (!schedule.find(s => s.name === t.name))
          })
        }
        // NOTE:
        // Return the taskInstances list

      }

      console.log("Return Schedule", schedule)
      return schedule
    }
    catch (e) {
      console.error(e)

      return ['oops']
    }
  }
}
