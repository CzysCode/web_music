import React, { memo, useEffect, useState, useRef, useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import { getSizeImage, formatDate, getPlayUrl } from '@/utils/format-utils.js'
import { Slider, Tooltip, message } from 'antd'
import SliderPlaylist from './c-cpns/slider-playlist'
import { Control, Operator, PlayerbarWrapper, PlayerInfo } from './stye'
import {
  getSongDetailAction,
  changePlaySequenceAction,
  changeCurrentIndexAndSongAction,
  changeCurrentLyricIndexAction,
  getAddSongDetailAction,
} from '../store/actionCreator'
import { NavLink } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'

export default memo(function JMAppPlayerBar() {
  // props/state
  const [currentTime, setCurrentTime] = useState(0) // 用于保存当前播放的时间
  const [isShowBar, setIsShowBar] = useState(false) // 是否显示音量播放条
  const [progress, setProgress] = useState(0) // 滑块进度
  const [isChanging, setIsChanging] = useState(false) // 是否正在滑动
  const [isPlaying, setIsPlaying] = useState(false) // 是否正在播放
  const [isShowSlide, setIsShowSlide] = useState(true) // 是否显示播放列表

  // redux hook
  const dispatch = useDispatch()
  const {
    currentSong,
    playSequence,
    playListCount,
    firstLoad,
    lyricList,
    currentLyricIndex
  } = useSelector(
    state => ({
      currentSong: state.getIn(['player', 'currentSong']),
      playSequence: state.getIn(['player', 'playSequence']),
      firstLoad: state.getIn(['player', 'firstLoad']),
      lyricList: state.getIn(['player', 'lyricList']),
      currentLyricIndex: state.getIn(['player', 'currentLyricIndex']),
      playListCount: state.getIn(['player', 'playListCount']),
    }),
    shallowEqual
  )

  // other hook
  const audioRef = useRef()
  // 派发action,发送网络请求歌曲的详情,初始化歌曲列表
  useEffect(() => {
    let firstId = null
    let localPlayList = []
    // 如果没有本地存储音乐.默认为:有何不可 & 如果本地存储没有存放播放列表id,添加默认值
    try {
      firstId = JSON.parse(localStorage.getItem('localPlayList'))[0]
      localPlayList = JSON.parse(localStorage.getItem('localPlayList'))
    } catch (error) {
      firstId = 167876
      localPlayList.push(411214279, 1363948882)
    }
    // 当前播放歌曲
    dispatch(getSongDetailAction(firstId))
    // 添加播放列表
    localPlayList.forEach(id => dispatch(getAddSongDetailAction(id)))
  }, [dispatch])

  // 设置音频src
  useEffect(() => {
    audioRef.current.src = getPlayUrl(currentSong.id)
    // 设置音量
    audioRef.current.volume = 0.5
    // 如果不是首次加载: 播放音乐
    if (!firstLoad) setIsPlaying(true + Math.random())
  }, [currentSong, firstLoad])

  // 切换歌曲时播放音乐
  useEffect(() => {
    isPlaying && audioRef.current.play()
  }, [isPlaying])

  // other handle
  const picUrl = currentSong.al && currentSong.al.picUrl // 图片url
  const songName = currentSong.name // 歌曲名字
  const singerName = currentSong.ar && currentSong.ar[0].name //作者名字
  const duration = currentSong.dt //播放总时间

  // other function
  // 点击播放或暂停按钮后音乐
  const playMusic = useCallback(() => {
    // 设置src属性
    setIsPlaying(!isPlaying)
    // 播放音乐
    isPlaying ? audioRef.current.pause() : audioRef.current.play()
  }, [isPlaying])

  // 歌曲播放触发
  function timeUpdate(e) {
    // 没有在滑动滑块时触发(默认时没有滑动)
    let currentTime = e.target.currentTime
    if (!isChanging) {
      setCurrentTime(currentTime * 1000)
      setProgress(((currentTime * 1000) / duration) * 100)
    }

    // 获取当前播放歌词

    let i = 0 //用于获取歌词的索引
    // 2.遍历歌词数组
    for (; i < lyricList.length; i++) {
      const item = lyricList[i]
      if (currentTime * 1000 < item.totalTime) {
        // 4.跳出循环
        break
      }
    }
    // 对dispatch进行优化,如果index没有改变,就不进行dispatch
    if (currentLyricIndex !== i - 1) {
      dispatch(changeCurrentLyricIndexAction(i - 1))
    }

    // 展示歌词
    const lyricContent = lyricList[i - 1] && lyricList[i - 1].content
    lyricContent &&
      message.open({
        key: 'lyric',
        content: lyricContent,
        duration: 0,
        className: 'lyric-css',
      })

    // 如果显示播放列表那么不展示歌词
    isShowSlide && message.destroy('lyric')
  }

  // 滑动滑块时触发
  const sliderChange = useCallback(
    value => {
      // 滑动滑块时:更改标识变量为false(touch move for changing state),此时不会触发onTimeUpdate(歌曲播放事件)
      setIsChanging(true)
      // 更改"当前播放时间"要的是毫秒数: 241840(总毫秒)   1 * 241840 / 1000 241.84 / 60  4.016667
      const currentTime = (value / 100) * duration
      setCurrentTime(currentTime)
      // 更改进度条值
      setProgress(value)
    },
    [duration]
  )

  // 手指抬起时触发
  const slideAfterChange = useCallback(
    value => {
      // 重新设置当前播放时长 value(进度)/100 * duration(总毫秒数) / 1000 得到当前播放的"秒数"
      const currentTime = ((value / 100) * duration) / 1000
      audioRef.current.currentTime = currentTime
      // 设置当前播放时间的state,设置的是'毫秒',所以需要*1000
      setCurrentTime(currentTime * 1000)
      setIsChanging(false)
      // 更改播放状态
      setIsPlaying(true)
      // 播放音乐
      audioRef.current.play()
    },
    [duration, audioRef]
  )

  // 改变播放列表是否显示
  const changePlaylistShow = useCallback(() => {
    console.log('123')
    setIsShowSlide(!isShowSlide)
  }, [isShowSlide])

  // 更改音量
  function changingVolume(value) {
    audioRef.current.volume = value / 100
  }

  // 更改播放顺序
  const changeSequence = () => {
    let currentSequence = playSequence
    currentSequence++
    if (currentSequence > 2) {
      currentSequence = 0
    }
    dispatch(changePlaySequenceAction(currentSequence))
  }

  // 切换歌曲(点击播放下一首或上一首音乐)
  const changeSong = tag => {
    // 需要需要派发action,所以具体逻辑在actionCreator中完成
    dispatch(changeCurrentIndexAndSongAction(tag))
    setIsPlaying(true + Math.random()) // 更改播放状态图标
  }

  // 当前歌曲播放结束后
  function handleTimeEnd() {
    // 单曲循环
    if (playSequence === 2) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    } else {
      // 播放下一首
      dispatch(changeCurrentIndexAndSongAction(1))
      // 更改播放状态
      setIsPlaying(true + Math.random())
    }
  }

  // 播放音乐
  const forcePlayMusic = () => {
    setIsPlaying(true + Math.random())
  }

  return (
    <PlayerbarWrapper className="sprite_player">
      <div className="w980 content">
        <Control isPlaying={isPlaying}>
          <button
            className="sprite_player pre"
            onClick={e => changeSong(-1)}
          ></button>
          <button className="sprite_player play" onClick={playMusic}></button>
          <button
            className="sprite_player next"
            onClick={e => changeSong(1)}
          ></button>
        </Control>
        <PlayerInfo>
          <NavLink
            to={{
              pathname: '/discover/song',
              search: `?id=${currentSong.id}`,
              state: { id: `${currentSong.id}` },
            }}
            className="image"
          >
            <img src={getSizeImage(picUrl, 35)} alt="" />
          </NavLink>
          <div className="play-detail">
            <div className="song-info">
              <a href="/songDetail" className="song-name">
                {songName}
              </a>
              <a href="/author" className="singer-name">
                {singerName}
              </a>
            </div>
            <Slider
              defaultValue={0}
              value={progress}
              onChange={sliderChange}
              onAfterChange={slideAfterChange}
            />
          </div>
          <div className="song-time">
            <span className="now-time">{formatDate(currentTime, 'mm:ss')}</span>
            <span className="total-time">
              {' '}
              / {duration && formatDate(duration, 'mm:ss')}
            </span>
          </div>
        </PlayerInfo>
        <Operator playSequence={playSequence}>
          <div className="left">
            <button className="sprite_player btn favor"></button>
            <button className="sprite_player btn share"></button>
          </div>
          <div className="right sprite_player">
            <button
              className="sprite_player btn volume"
              onClick={e => setIsShowBar(!isShowBar)}
            ></button>
            <Tooltip
              title={[
                '顺序播放',
                '随机播放',
                '单曲循环',
              ].filter((item, index) =>
                index === playSequence ? item : undefined
              )}
            >
              <button
                className="sprite_player btn loop"
                onClick={e => changeSequence()}
              ></button>
            </Tooltip>
            <button
              className="sprite_player btn playlist"
              // 阻止事件捕获,父元素点击事件,不希望点击子元素也触发该事件
              onClick={e => setIsShowSlide(!isShowSlide)}
            >
              <span>{playListCount}</span>
              <CSSTransition
                in={isShowSlide}
                timeout={3000}
                classNames="playlist"
              >
                <SliderPlaylist
                  isShowSlider={isShowSlide}
                  playlistCount={playListCount}
                  closeWindow={changePlaylistShow}
                  playMusic={forcePlayMusic}
                />
              </CSSTransition>
            </button>
          </div>
          <div
            className="sprite_player top-volume"
            style={{ display: isShowBar ? 'block' : 'none' }}
          >
            <Slider vertical defaultValue={50} onChange={changingVolume} />
          </div>
        </Operator>
      </div>
      <audio ref={audioRef} onTimeUpdate={timeUpdate} onEnded={handleTimeEnd} />
    </PlayerbarWrapper>
  )
})