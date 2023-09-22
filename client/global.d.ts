
declare type User = {
    id : string;
    firstname : string;
    surname : string;
    email : string;
    dob : string;
    gender : string;
    profilepic : string;
}

declare type NewUser = {
    firstname : string;
    surname : string;
    email : string;
    dob : string;
    gender : string;
    password : string;
}

declare type Post = {
    id: string!
    userid: string!
    username: string!
    date: string!
    text: string!
    privacy: string!
    commentcount: String!
    likecount: String!
}

declare type GroupPost = {
    id: string!
    groupid: string!
    groupname: string!
    date: string!
    text: string!
    privacy: string!
    commentcount: String!
    likecount: String!
}

declare type MediaPost = {
    id: string!
    postid: string!
    media: string!
}

declare type CommentPost = {
    id: string!
    postid: string!
    userid: string!
    username: string!
    comment: string!
    date: string!
    replycount: string!
    likecommentcount: string!
}

declare type CommentReels = {
    id: string!
    reelsid: string!
    userid: string!
    username: string!
    comment: string!
    date: string!
}

declare type LikePost = {
    id: string!
    postid: string!
    userid: string!
    username: string!
    isLike: boolean!
}

declare type ReplyPost = {
    id: string!
    commentid: string!
    userid: string!
    username: string!
    replycomment: string!
    date: string!
}

declare type Story = {
    length: number;
    id: string!
    userid: string!
    username: string!
    image: string!
    text: string!
    backgroundColor: string!
    font: string!
    date: string!
}

declare type Reels = {
    id: string!
    userid: string!
    username: string!
    video: string!
    text: string!
    date: string!
    commentcount: string!
}

declare type FriendRequest = {
    id: string!
    userid: string!
    requesterid: string!
}

declare type UserNotification = {
    id: string!
    userid: string!
    username: string!
    text: string!
    date: string!
    status: string!
}

declare type ConversationHeader = {
    id: string!
    user1: User!
    user2: User!
}

declare type Message = {
    id: string!
    conversationid: string!
    senderid: string!
    content: string!
    date: string!
}

declare type Group = {
    id: string!
    name: string!
    privacy: string!
    profilepic: string!
    date: string!
}

declare type GroupHeader = {
    id: string!
    group: Group!
}

declare type FileGroup = {
    id: string!
    groupid: string!
    filename: string!
    mediaurl: string!
    userid: string!
    ownername: string!
    date: string!
    filetype: string!
}