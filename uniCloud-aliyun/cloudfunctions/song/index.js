'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const db = uniCloud.database({
		spaceId: '83f39ab3-e69c-48b0-9317-ffcf4be15cb7'
	});
	const song = db.collection('song').get();
	console.log("song", song.result)

	//返回数据给客户端
	return song
};
