var mqtt = require('mqtt');


var client = mqtt.connect('mqtt://localhost:1883');

client.subscribe('testMessage');
client.publish('testMessage', '发布测试信息');

client.on('message', function (topic, message) {
  console.log(message.toString());
  client.end();
});