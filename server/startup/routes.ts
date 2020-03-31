import {Application } from 'express';
import express from 'express';
import error from '../middleware/error';
import users from '../routes/users';
import posts from '../routes/posts';
import comments from '../routes/comments';
import auth from '../routes/auth';
export default function(app:Application){
    app.use(express.json());
    // USERS
    app.use('/users', users)

    // POSTS
    app.use('/posts', posts)
    
    //COMMENTS
    app.use('/comments', comments)

    app.use('/auth', auth)
    // Error handle
     app.use(error)
}