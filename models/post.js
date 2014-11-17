var mongodb = require("./db");

function Post(username,post,time){
	this.user = username;
	this.post = post;
	if(time){
		this.time = time;
	}
	else{
		this.time = new Date();
	}
};

module.exports = Post;

Post.prototype.save = function save(callback){
	//存入Mongodb的文档
	var post = {
		username:this.user,
		post:this.post,
		time:this.time
	};

	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		//读取posts集合
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//为user属性添加索引
			collection.ensureIndex('user',function(err){
				//写入post文档
				collection.insert(post,{safe:true},function(err,post){
					mongodb.close();
					callback(err,post);
				});
			});

		});

	});
};

Post.get = function get(username,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//查找user属性为username的文档，如果sername是null则全部匹配
			var query = {};
			if(username){
				query.username = username;
			}
			collection.find(query).sort({time:-1}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					callback(err,null);
				}
				//封装posts为Post对象
				var posts = [];
				docs.forEach(function(doc,index){
					var post = new Post(doc.username,doc.post,doc.time);
					posts.push(post);
				});
				callback(null,posts);
			});
		});
	});
};

