import React, { PropTypes } from 'react'
import { shallow, mount, render } from 'enzyme'
import { Link } from 'react-router'
import { Provider } from 'react-redux'
import { bindActionCreators } from 'redux'

import configureStore from '../../../store/configureStore'
import testConfig from '../../../../config/test'

// https://github.com/airbnb/enzyme/issues/341
import 'jsdom-global/register'

import PostsDetail from '../index'
import CommentList from '../../../components/comment-list'
import HTMLText from '../../../components/html-text'

import styles from '../style.scss'

import { signin } from '../../../actions/sign'
import { loadUserInfo } from '../../../actions/user'
import { loadPostsById } from '../../../actions/posts'

describe('<PostsDetail />', ()=>{

  const store = configureStore()
  const { dispatch } = store

  let wrapper = null

  let props = {
    params: {
      id: '58c182f3662018842b3ab484'
    }
  }

  let posts = null
  let me = null

  it('应该可以正常登录', ()=>{
    const action = bindActionCreators(signin, dispatch)
    return action(testConfig.email, testConfig.password, (res, result)=>{
      expect(res).toEqual(true)
    })
  })

  it('应该可以获取到用户的信息', function() {
    const action = bindActionCreators(loadUserInfo, dispatch)
    return action({
      callback: (result)=> {
        me = result.data
        expect(result.success).toEqual(true)
      }
    })
  })

  it('应该可以获取到帖子', ()=>{
    const action = bindActionCreators(loadPostsById, dispatch)
    return action({
      id: props.params.id,
      callback: (result) => {
        posts = result
        expect(result ? true : false).toEqual(true);
      }
    })
  })

  it('应该有 作者链接', ()=>{

    wrapper = mount(<Provider store={store}><PostsDetail {...props} /></Provider>)

    expect(wrapper.contains(<Link to={`/people/${posts.user_id._id}`}>
      <img className={styles['author-avatar']} src={posts.user_id.avatar_url} />
      {posts.user_id.nickname}
    </Link>)).toBe(true);
  })

  it('应该有 标题', ()=>{
    expect(wrapper.contains(<h1 className={styles.title}>{posts.title}</h1>)).toBe(true);
  })

  it('应该有或没有 正文', ()=>{
    expect(wrapper.contains(<HTMLText content={posts.content_html} />))
    .toBe(posts.content_html ? true : false);
  })

  it('应该有 评论列表', ()=>{
    expect(wrapper.contains(<CommentList
      name={props.params.id}
      filters={{ posts_id: props.params.id, parent_exists: 0 }}
    />)).toBe(true);
  })

  it('应该有或没有 评论链接', ()=>{
    expect(wrapper.contains(<Link to={`/write-comment?posts_id=${posts._id}`}>评论</Link>))
    .toBe(me._id != posts.user_id._id ? true : false)
  })

  it('应该有或没有 编辑链接`', ()=>{
    expect(wrapper.contains(<Link to={`/edit-posts/${posts._id}`}>编辑</Link>))
    .toBe(me._id == posts.user_id._id ? true : false)
  })

})
