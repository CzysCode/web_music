import React, { lazy } from 'react'
import { Redirect } from 'react-router-dom'

const JMDiscover = lazy(() => import('@/pages/discover'))
const JMRecommend = lazy(() =>
  import('@/pages/discover/child-pages/recommend')
)

const JMSongs = lazy(() => import('@/pages/discover/child-pages/songs'))
  

const JMSongDetail = lazy(() => import('@/pages/player'))
const JMFriend = lazy(() => import('@/pages/friend'))
const JMMine = lazy(() => import('@/pages/mine'))

const JMSearch = lazy(() => import('@/pages/search'))
const JMSingle = lazy(() => import('@/pages/search/child-pages/single'))
const JMSinger = lazy(() => import('@/pages/search/child-pages/singer'))
const JMSearchAlbum = lazy(() =>
  import('@/pages/search/child-pages/album')
)
const JMSonglist = lazy(() => import('@/pages/song-detail'))
const JMUser = lazy(() => import('@/pages/profile'))

const JM404 = lazy(() => import('@/pages/404'))


const routes = [
  { path: '/', exact: true, render: () => <Redirect to="/discover" /> },
  {
    path: '/discover',
    component: JMDiscover,
    routes: [
      {
        path: '/discover',
        exact: true,
        render: () => <Redirect to="/discover/recommend" />,
      },
      { path: '/discover/recommend', component: JMRecommend },
      { path: '/discover/songs', component: JMSongs },
      { path: '/discover/song', component: JMSongDetail },
    ],
  },
  { path: '/mine', component: JMMine },
  { path: '/friend', component: JMFriend },
  {
    path: '/search',
    component: JMSearch,
    routes: [
      {
        path: '/search',
        exact: true,
        render: () => <Redirect to="/search/single?song=&type=1" />,
      },
      { path: '/search/single', component: JMSingle },
      { path: '/search/singer', component: JMSinger },
      { path: '/search/album/', component: JMSearchAlbum },
    ],
  },
  {
    path: '/songlist',
    exact: true,
    component: JMSonglist,
  },
  {
    path: '/user',
    exact: true,
    component: JMUser,
  },
  {
    component: JM404,
  },
]

export default routes
