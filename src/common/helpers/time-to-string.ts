export  const timeToString = (time: number) => {
    let min = Math.floor(time / 60).toString()
    let sec = (time % 60).toString()
    sec = sec.length < 2 ? `0${sec}` : sec
    min = min.length < 2 ? `0${min}` : min
    return {min, sec}
}