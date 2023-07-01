import React from 'react';
import { connect } from 'react-redux';
import { fetchPostsAndUsers } from './BlogActions.js';
import UserHeader from './UserHeader.js';
class PostList extends React.Component {
    componentDidMount() {
        this.props.fetchPostsAndUsers();
    }
    classes = 'stripe p-20 color-black m-10 r-10 bg-soft';
    buttonClasses = 'button p-10 r-10 m-1';
    list = () => {
        return this.props.posts.map(post => {
            return (
                <div key={post.id} className={this.buttonClasses}>
                    <div className='flexContainer'>
                        <div className={this.classes}>
                            
                            <i className='larger middle aligned icon user' />
                            <br />{post.userId}
                        </div>
                    </div>
                    <div className='columnLeft p-10 color-lite size20 mr-20 ml-20'>
                        {post.title}
                    </div>
                    <div className='p-10 white columnLeft color-soft  mr-20 ml-20'>
                        {post.body}
                        <UserHeader userId={post.userId}/>
                    </div>
                    <div className='horizontalStripe mt-20'></div>
                </div>
            )
        });
    }
    render() {
        //console.log(`PostList => posts: ${JSON.stringify(this.props.posts,null,2)}`)
        return this.list();
    }
}

const mapStateToProps = state => {
    //console.log(`PostList => mapStateToProps =>\nstate: ${JSON.stringify(state.posts,null,2)}`)
    return { posts: state.posts };
}

export default connect(mapStateToProps,
    { fetchPostsAndUsers }
)(PostList);