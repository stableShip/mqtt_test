var mqtt = require('mqtt');

//{'topicName':[clientObj,clientObj ..]}
var subscribeTopics={};

//创建服务器对象
var server = new mqtt.Server(function(client) {

  //建立连接时触发
  client.on('connect', function(packet) {
    client.connack({returnCode: 0});
  });

  //客户端发布主题时触发
  client.on('publish', function(packet) {
  	var topic=packet.topic;
  	var payload=packet.payload;

  	//如果没有创建空的主题对应的client数组
  	if(subscribeTopics[topic]==null){
  		subscribeTopics[topic]=[];
  	}else{
  		//遍历该主题下全部client，并逐一发送消息
  		for(var i in subscribeTopics[topic]){
  			var client=subscribeTopics[topic][i];
  			client.publish({
  				topic: topic,
  				payload: payload
  			});
  		}
  	}   
  });

  //当客户端订阅时触发
  client.on('subscribe', function(packet) {
  	var topic=packet.subscriptions[0].topic;

  	//如没有，创建空的主题对应的client数组
  	if(subscribeTopics[topic]==null){
  		subscribeTopics[topic]=[];
  	}

  	//如果client数组中没有当前client，加入
	if(subscribeTopics[topic].indexOf(client)==-1){
		subscribeTopics[topic].push(client);
	}
	
  });

  client.on('pingreq', function(packet) {
    client.pingresp();
  });

  client.on('disconnect', function(packet) {
  	//遍历所有主题，检查对应的数组中是否有当前client，从数组中删除
   	for (var topic in subscribeTopics){
   		var index=subscribeTopics[topic].indexOf(client);
   		if(index>-1){
   			subscribeTopics[topic].splice(index,1);
   		}
   	}
  });
});

//监听端口
server.listen(1883);