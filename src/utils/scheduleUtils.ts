import moment, { Moment } from "moment";
import { IScheduleItem } from "../controllers/ScheduleController";
import { Task, TaskTemplate } from "../entities";
import { ITaskTemplate } from "../interfaces";

export function timeDiff(a: string, b: string): number {
  const [aHour, aMinute] = a.split(':').map(Number);
  const [bHour, bMinute] = b.split(':').map(Number);
  return (aHour * 60 + aMinute) - (bHour * 60 + bMinute);
}

export function getTimeEntryEvents(timeEntry: { time: string, events: IScheduleItem[] }, currentContexts: string[], currentMiniContexts: string[]) {
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
  return { currentContexts, currentMiniContexts }
}

export function getTaskScore(task: ITaskTemplate, currentContexts: string[], currentMiniContexts: string[]) {
  // .. count the current contexts that match.
  // and save the score.. to use for ordering.
  // TODO: change contexts arrays to be {name, start, end}, this will give duration, and ability to prioritise contexts by length, and weight them accordingly
  const contextWeight = 1
  const miniContextWeight = 2
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
  return score
}

export function taskFactory(task: ITaskTemplate, score: number) {
  const newtask = new Task()
  newtask.score = score
  newtask.name = task.name
  newtask.duration = task.duration
  newtask.contexts = task.contexts
  newtask.miniContexts = task.miniContexts

  return newtask
}

export function filterTasksForScheduling(taskList: ITaskTemplate[], schedule: Task[], timeTillNextEntry: number) {
  const durationFiltered = taskList = filterTasksByDurations(taskList, timeTillNextEntry)
  const durationAndScheduleFiltered = filterTasksByScheduled(durationFiltered, schedule)
  return durationAndScheduleFiltered
}

export function filterTasksByDurations(taskList: ITaskTemplate[], timeTillNextEntry: number) {
  return taskList.filter(t => t.duration < timeTillNextEntry)
}
export function filterTasksByScheduled(taskList: ITaskTemplate[], schedule: Task[]) {
  return taskList.filter(t => !schedule.some(s => s.name === t.name))
}

export function sortTasksByDurationsAndScore(taskList: Task[]) {
  // TODO: replace number with 'rank' within context. each context should list all tasks in order. each context should have its own order of priorities of tasks. 
  // Also TODO: rank, then weight contexts by their duraion, shorter context should always be prioritised
  console.log("tlist @ sortTasksByDurationsAndScore", taskList.length)
  if (taskList.some(t => !t.score))
    console.error("NO SCORE")
  return taskList.sort((a, b) => {
    const durationScore = a.duration > b.duration ? 2 : 1
    const scoreScore = a.score! - b.score!
    const number = a.number || 1 - b.number || 1

    const score = durationScore + scoreScore + number
    /*console.log("score", a.name, "vs", b.name)
    console.log(a.score, b.score)
    console.log(a.duration, b.duration)
    console.log("score", score)*/

    return score
  })
}

export function momentFromString(time: string) {
  return moment(time, 'HH:mm')
}

export function getHighestScoredTask(
  taskList: ITaskTemplate[],
  currentContexts: string[],
  currentMiniContexts: string[]
) {
  let newTaskList: Task[] = []
  taskList.forEach(task => {
    let score = getTaskScore(task, currentContexts, currentMiniContexts)
    const newtask = taskFactory(task, score)
    newTaskList.push(newtask)
  })
  const newTaskListSorted = sortTasksByDurationsAndScore(newTaskList)
  console.log("highest score", newTaskListSorted[0].name)
  return newTaskListSorted[0]

}

export function AddTaskListToEvents(taskList: Task[], eventsList: { time: string, events: IScheduleItem[] }[]) {
  let events = eventsList
  for (const task of taskList) {
    events = AddTaskToEvents(task, eventsList)
  }
  return events

}

export function AddTaskToEvents(task: Task, events: { time: string, events: IScheduleItem[] }[]) {
  // TODO: working on this function
  const start: IScheduleItem = {
    name: task.name,
    action: 'start',
    type: 'task'
  }
  const end: IScheduleItem = {
    name: task.name,
    action: 'end',
    type: 'task'
  }
  const x = ([
    [task.startTime.format("HH:mm"), start],
    [task.endTime.format("HH:mm"), end]
  ] as [string, IScheduleItem][])
    .forEach(([time, value]) => {
      (events.find(e => e.time === time) ||
        events[events.push({ time, events: [] }) - 1]
      ).events.push(value)
    })
  return events
}
