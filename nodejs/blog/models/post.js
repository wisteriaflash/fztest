var mongodb = require('./db'),
    markdown = require('markdown').markdown;

function Post(name, title, tags, post){
    this.name = name;
    this.title = title;
    this.tags = tags;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function(callback) {//存储一篇文章及其相关信息
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date : date,
        year: date.getFullYear(),
        month: date.getFullYear()+'-'+(date.getMonth()+1),
        day: date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
        minute: date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours() + ":" + date.getMinutes()
    };
    //要存入数据库的文档
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        tags: this.tags,
        post: this.post,
        comments: [],
        pv: 0
    };
    //打开数据库
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts', function(err, collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将文档插入posts集合
            collection.insert(post, {
                safe: true
            }, function(err, post){
                mongodb.close();
                callback(null);
            });
        });
    });
};

Post.getTen = function(name, page, callback) {//一次获取十篇文章
    //打开数据库
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }
            //根据query对象查询文章，并跳过前(page-1)*10个结果，返回之后的10个结果
            collection.find(query,{skip:(page-1)*10,limit:10}).sort({
                time: -1
            }).toArray(function(err, docs){
                mongodb.close();
                if(err){
                    callback(err, null);//失败！返回null
                }
                docs.forEach(function(doc){
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs);//成功！以数组形式返回查询的结果
            })
        });
    });
};

Post.getOne = function(name, day, title, callback){//获取一篇文章
    //打开数据库
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            // //每访问1次，pv值增加1
            collection.update({'name':name, 'time.day':day, 'title':title}, {$inc: {'pv':1}},function(err){
                if(err){
                    callback(err);
                }
            });
            //根据用户名、发表日期及文章名进行精确查询
            collection.findOne({'name':name, 'time.day':day, 'title':title}, function(err, doc){
                mongodb.close();
                if(err){
                    callback(err, null);
                }
                //解析markdown 为html
                if(doc){
                    doc.post = markdown.toHTML(doc.post);
                    doc.comments.forEach(function(comment){
                        comment.content = markdown.toHTML(comment.content);
                    })
                }
                callback(null, doc);//返回特定查询的文章
            });

        });
    });
}
Post.getArchive = function(callback){//返回所有文章
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //返回只包含name、time、title的文档组成的数组
            collection.find({}, {}).sort({
                time: -1
            }).toArray(function(err, docs){
                mongodb.close();
                if(err){
                    callback(err, null);
                }
                callback(null, docs);
            })
        })
    })
}

Post.getTags = function(callback){//返回所有标签
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //distinct用来找出给定键的所有不同值
            collection.distinct('tags.tag', function(err, docs){
                mongodb.close();
                if(err){
                    callback(err, null);
                }
                callback(null, docs);
            });
        });
    });
}

Post.getTag = function(tag, callback){//返回含有特定标签的所有文章
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //通过tags.tag查询并返回只含有name、time、title键的文档组成的数组
            collection.find({'tags.tag':tag}, {'name':1, 'time':1, 'title':1}).sort({
                time: -1
            }).toArray(function(err, docs){
                mongodb.close();
                if(err){
                    callback(err, null);
                }
                callback(null, docs);
            })
        });
    });
}