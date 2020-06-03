import React, {Component} from 'react'
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native'
import moment from 'moment'
import { ScrollView} from 'react-native-gesture-handler'



function Timer({interval, style}){
  const pad = (n) => n < 10 ? '0' + n : n
  const duration = moment.duration(interval)
  const centiseconds = Math.floor(duration.milliseconds()/10)
  return(

    <View style = {styles.timerContainer}>
      <Text style = {style}>{pad(duration.minutes())}:</Text>
      <Text style = {style}>{pad(duration.seconds())}:</Text>
      <Text style = {style}>{pad(centiseconds)}</Text>
    </View>
    )
}

function RoundButton({title, color, background, onPress, disabled}){
  return(
    <TouchableOpacity onPress = {!disabled && onPress}
    style = {[styles.button,
    {backgroundColor: background}]}
    activeOpacity = {disabled? 0.1 : 0.7}
    >
  
      <View style = {styles.buttonBorder}>
        <Text style = {[styles.buttonTitle, {color}]}>{title}</Text>
      </View>
    </TouchableOpacity>
  )
}


function ButtonsRow({children}){
  return(

    <View style = {styles.buttonsRow}>
      {children}
    </View>

  )
}


function Lap({number, interval, fastest, slowest}) {

  // const pad = (n) => n < 10 ? '0' + 10 : n

  const lapStyle = [ // here we set a const for the style
    styles.lapText, // this way it is affecting the interval text
    fastest && styles.fastest,
    slowest && styles.slowest,
  ]
  return(
    <View style = {styles.lap}>
      <Text style = {lapStyle}>Lap {number}</Text>
      <Timer interval = {interval} style = {[lapStyle, styles.lapTimer]}/>
    </View>
  )
}


function LapTable({laps, timer}){

  const finishedLaps = laps.slice(1) // Here we slice the laps table from one to the end
  let min = Number.MAX_SAFE_INTEGER // this way the first element in the array will be less, so this will be replaced right away
  let max = Number.MIN_SAFE_INTEGER

  if(finishedLaps.length >= 2){ // use for loop to find min and max
    finishedLaps.forEach(lap => {
      if(lap < min) min = lap
      if(lap > max) max = lap
    });
  }

  return(
    
    <ScrollView style = {styles.scrollView}>
      {laps.map((lap, index) => (// here we map the laps into the scrollview table
        <Lap
          number = {laps.length-index}// the number is backwards, since it is easier to insert into the end of the array
          key = {laps.length - index}
          interval = { index === 0 ? timer + lap : lap}
          slowest = {lap === min}// here we set the booleans
          fastest = {lap === max}
        />
      ))}
    </ScrollView>
  )
}


export default class StopwatchScreen extends Component {
  constructor(props){
    super(props)
    this.state = {
      start: 0,
      now: 0,
      laps: [],
    }
  }

  componentWillUnmount(){
    clearInterval(this.timer)
  }

  start = () => {
    const start = new Date().getTime()
    this.setState({
      start: start,
      laps: [0],
    })

    this.timer = setInterval(() => {
      this.setState({now: new Date().getTime()})}, 10)


    }
    //the below functions makes the lap timer its own thing that starts at zero each time, and then in the render the actual timer
    // is updated to be the sum of laps + the lapTimer. So effectively each lap resets the time and then adds the new time to the old time
    lap = () => {
      const timeStamp = new Date().getTime()
      const {now, start,laps} = this.state
      const [ firstLap, ...other] = laps// here we make an array where the most recent lap is the firstlap and is 0
      this.setState({
        laps: [0, firstLap + now - start, ...other], // here we add current time to firstlap, and add a new lap before it
        start: timeStamp, // here we zero start and now for future laps
        now: timeStamp,
      })
    }

    stop = () => {
      clearInterval(this.timer)
      const {laps, now, start} = this.state
      const [firstLap, ...other] = laps
      this.setState({
        laps: [firstLap + now - start, ...other],
        start: 0,
        now: 0,
      })
    }


    resume = () => {

      const now = new Date().getTime()
      this.setState({
        start: now,
      })

      this.timer = setInterval(() => {
        this.setState({now: new Date().getTime()})}, 10)

      

  
      }

      reset = () => {
        this.setState({
          laps: [],
          start: 0,
          now: 0,
        })
      }

//In my timer in the render, the interval is the total time + now-start, so my reset function will work as a normal timer
//In reset, laps is reduced to zero, so then the interval is also 0

  render() {
    const{now, start, laps} = this.state
    const timer = now-start
    return (
      <View style = {styles.Container}>
        <Timer
        interval = {laps.reduce((total, curr) => total + curr, 0) + timer} // Here we made the timer equal to the sum of all laps, rendering it unchanged each time you take a lap
        style = {styles.Timer}/>

        {laps.length === 0 &&
                (<ButtonsRow>
                <RoundButton
                title = 'Reset'
                color = '#FFFFFF'
                background = '#3D3D3D'
                />

                <RoundButton
                title = 'Start'
                color = '#50d167'
                background = '#1B361f'
                onPress = {this.start}
                />
              </ButtonsRow>)
        }

        {start > 0  && 
              (<ButtonsRow>
                <RoundButton
                title = 'Lap'
                color = '#FFFFFF'
                background = '#3D3D3D'
                onPress = {this.lap}
                />
                <RoundButton
                title = 'Stop'
                color = '#E33935'
                background = '#3C1715'
                onPress = {this.stop}
                />
              </ButtonsRow>)
        
        
        }


        {start === 0 && laps.length > 0 &&
                        (<ButtonsRow>
                        <RoundButton
                        title = 'Reset'
                        color = '#FFFFFF'
                        background = '#3D3D3D'
                        onPress= {this.reset}
                        />

                        <RoundButton
                        title = 'Resume'
                        color = '#50d167'
                        background = '#1B361f'
                        onPress = {this.resume}
                        />
                      </ButtonsRow>)
                }




        <LapTable laps = {laps} timer = {timer}/>
      </View>
    )
  }
}



const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 150
  },

  Timer: {
    color: '#FFFFFF',
    fontSize: 76,
    fontWeight: '200',
    width: 110
  },

  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },

  lapTimer: {
    width: 30
  },

  buttonTitle: {
    fontSize: 18
  },

  buttonBorder: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonsRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginTop: 80,
    paddingHorizontal: 20,
  },

  lapText: {
    color: '#FFFFFF',
    fontSize: 18,
    
     
  },
  lap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#151515',
    borderTopWidth: 1,
    paddingVertical: 10
  
  },
  scrollView: {
    alignSelf: 'stretch',
    paddingHorizontal: 30,
    paddingTop: 30

  },
  fastest: {
    color: '#4bc05f'
  },
  slowest: {
    color: '#cc3531'
  },
  timerContainer: {
    flexDirection: 'row'
  }


})
