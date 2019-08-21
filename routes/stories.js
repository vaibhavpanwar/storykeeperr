const express =require('express');
const router =express.Router();
const mongoose= require('mongoose');
const Story =mongoose.model('stories');
const User =mongoose.model('users');
const {ensureAuthenticated, ensureGuest} =require('../helpers/auth')
router.get('/', (req, res)=>{
    Story.find({status : "public"})
    .populate('user')
    .then(stories => {
        res.render("stories/index", {stories : stories})
    })
})
//show single stories
router.get('/show/:id' , (req, res)=>{
    Story.findOne({
        _id : req.params.id
    })
    .populate('user')
    .populate('comments.commentUser')
    .then(story=>{
        res.render('stories/show', {story : story})
    })
})
router.get('/add', (req, res)=>{
    res.render("stories/add")
    
})

//edit route
router.get('/edit/:id',ensureAuthenticated, (req, res)=>{
    Story.findOne({_id : req.params.id})
    .then(story=>{
        res.render('stories/edit', {story: story})
    })
    
})

router.post('/', (req, res)=>{
    let allowComments;
    if(req.body.allowComments){
        allowComments= true;

    }
    else{
        allowComments =false
    }

    const newStory = {
        title : req.body.title,
        body : req.body.body,
        status : req.body.status, 
        allowComments : allowComments,
        user : req.user.id
        
    }

    //create story 
    new Story(newStory)
    .save()
    .then(story =>{
        res.redirect(`/stories/show/${story.id}`)
    })
})
//update 
router.put('/:id',(req, res)=>{
    Story.findOne({_id : req.params.id})
    .then(story=>{
        let allowComments;
    if(req.body.allowComments){
        allowComments= true;

    }
    else{
        allowComments =false
    }
        
        story.title = req.body.title,
        story.body =req.body.body,
        story.status = req.body.status, 
        story.allowComments =allowComments
        story.save()
        .then(story=>{
            res.redirect('/dashboard')
        })

})
});
//delete request
router.delete("/:id", (req, res)=>{
        Story.deleteOne({_id: req.params.id})
        .then(()=>{
            res.redirect('/dashboard')
        })

})
//
router.post("/comment/:id", (req, res)=>{
    Story.findOne({
        _id : req.params.id
    })
    .then(story=>{
        const newComment= {
            commentBody : req.body.commentBody,
            CommentUser : req.user.id 
        }
        //add comments to story
        story.comments.unshift(newComment)
        story.save()
        .then(story=>{
            res.redirect(`/stories/show/${story.id}`)
        })
    })  
})
module.exports =router;







