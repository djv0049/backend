import { Moment } from "moment"

interface IFrequency {
  count: number
  interval: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
}

interface ITimeframeContainerTemplate {
  name: string
  color: string
  tasks: ITaskTemplate[]
}

export interface ITimeframeContainer extends ITimeframeContainerTemplate {
  startTime: Moment
  endTime: Moment
}

export interface ITaskTemplate {
  name: string
  duration: number // seconds
  isFlexible: boolean
  repeating: boolean
  frequency: IFrequency

  miniContexts?: IMiniContext[] 
  projects?: IProject[]
  contexts?: IContext[]
}

export interface ITask extends ITaskTemplate {
  startTime: Moment
  endTime: Moment
  completedAt: Moment
  started: boolean
  timeStarted: Moment
}

interface IContextTemplate extends ITimeframeContainerTemplate {
  icon: string
}

export interface IMiniContextTemplate extends IContextTemplate { // contexts like walking or being in a meeting or driving or gaming or coding. accessible and switchable. 
  flexiStart: boolean
  flexiEnd: boolean
}

export interface IMiniContext extends IMiniContextTemplate, ITimeframeContainer { }

export interface IContext extends IContextTemplate, ITimeframeContainer { // like at home, at work, at dads, geraldine.. and other common overarching influences on daily activities
}

export interface IProject {
  name: string
  color: string
  isActive: boolean
  tasks: ITaskTemplate[]
  contexts: IContextTemplate[]
}

export interface IDayTemplate {
  name: string
  contexts: IContext[]
  miniContexts: IMiniContext[]
}

export interface IDay extends IDayTemplate {
  date: Moment
  tasks: ITask[]
}



// Later interfaces: 
//

interface IGoal {
  type: 'build up,' | 'count down'
}

