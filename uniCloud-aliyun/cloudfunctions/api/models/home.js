const db = uniCloud.database({
  spaceId: '83f39ab3-e69c-48b0-9317-ffcf4be15cb7'
});

var home = {
    tabs: () => {
		let tabs = db.collection('tab').get();
		return tabs
	},
	coupons: () => {
		let coupons = db.collection('coupon').orderBy("sort", "desc").get();
		return coupons
	},
	song: () => {
		let song = db.collection('song').get();
		return song
	},
}

module.exports = home;
