import { Inject, Controller, Post, BodyParams, Get, Put, Delete } from "@tsed/common";
import { QueryParams } from '@tsed/platform-params';
import { MongooseModel } from '@tsed/mongoose';
import moment, { Moment } from 'moment';
import { TaskTemplate } from '../entities/TaskTemplate';
//import { generateScheduleLogic } from '../utils/scheduler';
import type { IContext, IMiniContext, ITaskTemplate } from '../interfaces';
import { Context, MiniContext, Project, Task } from '../entities/';


interface ITimeframeContainerForSort {
  name: string
  type: 'context' | 'miniContext'
  startTime: Moment
  endTime: Moment
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

  @Inject(Context)
  private context!: MongooseModel<Context>;

  @Inject(MiniContext)
  private miniContext!: MongooseModel<MiniContext>;

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
      const contexts: IContext[] = await this.context.find({}) // TODO: need to be created from templates first
      const miniContexts: IMiniContext[] = await this.miniContext.find({}) // TODO: need to be created from templates first
      const projects = await this.project.find({
        /*any of the contexts == any of the projects contexts*/
        /*any of the miniContexts == any of the projects miniContexts*/
        isActive: true
      })
      /* NOTE:
       *  list all tasks with a hard date
        */
      const hardTimedTasks = this.task.find({ isFlexible: false })

      /* TODO: 
       * calculate the presence of a container with its repeating phases and/or dates
        */

      const allTimeContainers = [
        ...contexts.map(c => ({ ...c, type: 'context' } as ITimeframeContainerForSort)),
        ...miniContexts.map(m => ({ ...m, type: 'miniContext' } as ITimeframeContainerForSort))
      ]
      const timelineMap = allTimeContainers.reduce((acc: Record<string, IScheduleItem[]>, item: ITimeframeContainerForSort) => {

        const addEvent = (time: Moment, action: actionType) => {
          const newTime = `${time.hour().toString().padStart(2, '0')}:${time.minute().toString().padStart(2, '0')}`;

          if (!acc[newTime]) acc[newTime] = [];

          acc[newTime].push({
            name: item.name,
            action: action,
            type: item.type
          });
        };

        addEvent(item.startTime, 'start');
        addEvent(item.endTime, 'end');

        return acc;
      }, {} as Record<string, IScheduleItem[]>
      )

      const timeLine: ITimeEntry[] = Object.keys(timelineMap)
        .sort((a, b) => timeDiff(a, b))
        .map(time => ({
          time: time,
          events: timelineMap[time] as IScheduleItem[]
        }));

      console.log("final timeline", timeLine);

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
        const nextEntry = timeLine[i + 1]

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
        }

        // NOTE: filter all tasks by the tasks that have any of event.events.contexts matching any of their contexts. 
        // TODO: if contexts are empty, return all tasks
        (await this.taskTemplate.find({ 'contexts.name': { $in: currentContexts } })).map((task: TaskTemplate) => taskList.push(task));
        (await this.taskTemplate.find({ 'miniContexts.name': { $in: currentMiniContexts } })).map((task: TaskTemplate) => taskList.push(task));
        // at this point, I have a list of tasks that are either in the current context OR miniContext. 
        // Next step is to filter by duration, 

        let timeTillNextEntry = timeDiff(nextEntry.time, cursor)
        taskList.filter(t => {
          return t.duration > timeTillNextEntry && !schedule.some(s => s.name === t.name)
        })
        while (timeTillNextEntry > 1 && taskList.length > 1) {

          if (taskList.length === 0)
            return

          let newTaskList: Task[] = []

          // then give each task a priority weight.
          // .. count the current contexts that match.
          taskList.forEach(task => {
            let miniContextCount: number =0
            let contextCount: number = 0
            if( task.miniContexts)
            miniContextCount = task.miniContexts.filter(ctx =>
              currentMiniContexts.includes(ctx.name)
            ).length;
            if( task.contexts)
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
          nextTask.startTime = moment(cursor, 'HH:mm')
          nextTask.endTime = moment(cursor, 'HH:mm').add(nextTask.duration)
          cursor = moment(cursor, "HH:mm").add(nextTask.duration).format("HH:mm")
          schedule.push(nextTask)

          timeTillNextEntry = timeDiff(nextEntry.time, cursor)
          taskList.filter(t => {
            return t.duration > timeTillNextEntry && !schedule.some(s => s.name === t.name)
          })
        }
        // NOTE:
        // Return the taskInstances list

      }

      return schedule
    }
    catch{
      return []
    }
  }
}
