<template>
	<view>
		<view>
			<canvas canvas-id="mini_poster" :style="{ width: canvasW + 'px', height: canvasH + 'px' }"></canvas>
		</view>
		<view style="height: 106rpx;"></view>
		<view class="footer-left">
			<button @tap="goLogin" type="warn">生成我的</button>
		</view>
		<view class="footer-right">
			<button type="primary" @tap="toSaveImage">保存名片</button>
		</view>
	</view>
</template>

<script>
	import {
		calendar
	} from '../../sdk/calendar.js';
	export default {
		data() {
			return {
				canvasW: 0,
				canvasH: 0,
				nickname: "日历大师",
				avatar: "https://github.com/xixici/xixici.github.io/blob/master/uploads/wechat-qcode.gif",
				location: "上海",
				city: "上海",
				lat: 31.231706,
				lon: 121.472644,
				icon: '../../static/weather/01d@2x.png',
				temp: "18℃",
				des: "晴",
				mpWxQr: '../../static/qr-code.png'
				finished: false
			}
		},
		onLoad() {
			this.getSong()
			this.getLocation()
			this.userInfo = getApp().globalData.userInfo
			this.lunar = this.getLunar()
			this.canvasW = uni.getSystemInfoSync().windowWidth
			this.canvasH = this.calculateCanvasHeight()
			this.toDrawCanvas(this.nickname, this.location, this.avatar)
		},
		methods: {
			/*登录 */
			goLogin() {
				let self = this;
				uni.login({
					provider: 'weixin',
					success(login) {
						console.log(login);
					}
				})
				uni.getUserProfile({
					desc: '显示用户名片信息',
					lang: 'zh_CN',
					success(user) {
						self.avatar = user.userInfo.avatarUrl
						self.nickname = user.userInfo.nickName
						self.location = user.userInfo.country + ' - ' + user.userInfo.province + ' - ' + user
							.userInfo.city
						console.log(self)
						self.toDrawCanvas(self.nickname, self.location, self.avatar, self.lat, self.lon)
					}
				})
			},
			toSaveImage() {
				if (!this.finished) {
					uni.showToast({
						title: '正在生成图片，稍后再试',
						icon: 'none'
					})
					return
				}
				const that = this
				uni.canvasToTempFilePath({
					canvasId: 'mini_poster',
					success: (res) => {
						uni.saveImageToPhotosAlbum({
							filePath: res.tempFilePath,
							success: () => {
								uni.showToast({
									title: '保存成功'
								})
							},
							fail() {
								uni.showToast({
									icon: 'none',
									title: '保存名片码失败'
								})
							}
						})
					},
					fail() {
						uni.showToast({
							icon: 'none',
							title: '保存名片码失败'
						})
					}
				})
			},
			async toDrawCanvas(nickname, location, avatar, lat, lon) {
				const padding = uni.upx2px(34)
				const cardHeight = uni.upx2px(170)
				const lunarHeight = uni.upx2px(70)
				const cw = this.canvasW - 2 * padding
				const halfCw = (this.canvasW - 3 * padding) / 2

				let ctx = uni.createCanvasContext('mini_poster', this)

				// 透明背景
				ctx.setFillStyle('#F3F4F5')
				ctx.fillRect(0, 0, this.canvasW, this.canvasH)
				// draw card round rect
				const r = uni.upx2px(12)
				const hp = uni.upx2px(52)
				const iconW = uni.upx2px(30)
				const textH = hp + iconW + 6
				const vp = uni.upx2px(45)

				const fz50 = uni.upx2px(50)
				const fz100 = uni.upx2px(100)
				const fz200 = uni.upx2px(200)
				const dateY = padding
				ctx.setFillStyle('#333333')
				ctx.setTextBaseline('middle')


				await this.getWeather(lat, lon)
				console.log(lat, lon, this.weather)
				this.icon = '../../static/weather/' + this.weather.weather[0].icon + '@2x.png'
				this.temp = this.weather.main.temp + "℃"
				this.des = this.weather.weather[0].description
				this.city = this.weather.name.split(' ')[0]
				console.log(lat, lon, this.city)
				// draw lunar content
				ctx.setFontSize(fz50)
				this.drawWeather(ctx, padding, dateY, halfCw, cardHeight, r, fz200, this.icon, this.temp, this.des,
					this.city)

				// draw date content
				ctx.setFontSize(fz100)
				this.drawDate(ctx, padding, dateY, halfCw, cardHeight, r)

				// draw weather content
				const lunarY = cardHeight + padding + padding
				this.drawRoundRectWithBorder(ctx, padding, lunarY, cw, lunarHeight, r, 2, '#336699')
				this.drawLunar(ctx, padding, lunarY, cw, lunarHeight)

				// draw song content
				const songY = cardHeight + padding + padding + lunarHeight + padding
				this.drawRoundRectWithBorder(ctx, padding, songY, cw, cardHeight, r, 2, '#993366')
				this.drawSong(ctx, padding, songY, cw, cardHeight)

				// draw card content
				const cardY = this.canvasH - cardHeight - cardHeight
				this.drawRoundRectWithBorder(ctx, padding, cardY, cw, cardHeight, r, 2, '#663399')
				this.drawCard(ctx, padding, cardY, cw, cardHeight, nickname, location, avatar)

				// draw hello info
				this.drawHelloInfo(ctx, padding, this.canvasH, cw)
				// draw avatar
				const av = uni.upx2px(128)
				const hi = await this.downloadImage(avatar)
				if (hi.tempFilePath) {
					this.drawRoundRectAvatar(ctx, cw - padding - padding - padding, cardY + padding, av, av, r, hi
						.tempFilePath)
				}
				// draw qr code
				if (this.mpWxQr) {
					const hello = await this.downloadImage(this.mpWxQr)
					const padding = uni.upx2px(34)
					const av = uni.upx2px(180)
					const totalH = this.calculateCanvasHeight()
					if (hello.tempFilePath) {
						ctx.drawImage(hello.tempFilePath, this.canvasW - padding - av, totalH - padding - av, av, av)
					}
				}
				ctx.draw()
				this.finished = true
			},
			async drawCard(ctx, x, y, w, h, nickname, location, avatar) {
				let vp = y + uni.upx2px(45)
				const hp = x + uni.upx2px(52)
				ctx.setTextBaseline('top')
				const fz30 = uni.upx2px(30)
				ctx.setFontSize(fz30)

				const iconW = uni.upx2px(30)
				const textH = hp + iconW + 6

				ctx.drawImage('../../static/Mouse-Pointer.png', hp, vp + 3, iconW, iconW)

				ctx.setFillStyle('#333333')
				ctx.fillText(nickname, textH, vp)

				vp += 30
				ctx.drawImage('../../static/position.png', hp, vp + 3, iconW, iconW)

				ctx.fillText(location, textH, vp)
			},
			async drawSong(ctx, x, y, w, h) {
				let vp = y + uni.upx2px(20)
				const hp = x + uni.upx2px(30)
				ctx.setTextBaseline('top')
				const fz30 = uni.upx2px(30)
				ctx.setFontSize(fz30)
				const textH = hp + fz30
				const song = "他明白 他明白 我给不起 于是转身向山里走去"
				ctx.fillText(song, textH, vp)
				const author = "山海 - 草东没有派对"
				ctx.fillText(author, textH, vp + fz30 + fz30)
			},
			async drawLunar(ctx, x, y, w, h) {
				let vp = y + uni.upx2px(20)
				const hp = x + uni.upx2px(30)
				ctx.setTextBaseline('top')
				const fz30 = uni.upx2px(30)
				ctx.setFontSize(fz30)
				const textH = hp + fz30
				ctx.fillText(this.lunar, textH, vp)
			},
			async drawHelloInfo(ctx, x, y, w) {
				let vp = y - 56
				const hp = x
				ctx.setTextBaseline('top')
				const fz30 = uni.upx2px(30)
				ctx.setFontSize(fz30)
				ctx.fillText('长按识别二维码', hp, vp)
				vp += 26
				ctx.fillText('制作我的专属名片吧', hp, vp)
			},
			calculateCanvasHeight() {
				// 400 is card height
				const ctx = uni.createCanvasContext('test_poster')
				const padding = uni.upx2px(34)
				const text = "我是来自 " + ' 的投资人' + this.nickname
				const rows = this.drawTextInLines(ctx, text, padding, 0, this.canvasW - 2 * padding, 26)
				const cardH = uni.upx2px(380)
				const h = padding * 2 + cardH + padding + 12 + 26 * 3 + rows * 26
				return h + 90
			},
			_drawRoundRect(ctx, x, y, w, h, r) {
				ctx.beginPath()
				// 左上角
				ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
				// 右上角
				ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
				// 右下角
				ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
				// 左下角
				ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
				ctx.closePath()
				// ctx.strokeStyle = '#D8D8D8';
				ctx.fillStyle = '#FFFFFF';
				// ctx.stroke()
				ctx.fill()
			},
			drawRoundRect(ctx, x, y, w, h, r, lineWidth) {
				ctx.save()
				this._drawRoundRect(ctx, x, y, w, h, r)
				ctx.clip()
				ctx.restore()
			},
			drawRoundRectWithBorder(ctx, x, y, w, h, r, lineWidth, color) {
				ctx.save()
				this._drawRoundRect(ctx, x, y, w, h, r)
				ctx.clip()
				// draw left border
				ctx.fillStyle = color
				const bWidth = uni.upx2px(12)
				ctx.fillRect(x, y, bWidth, h)
				ctx.restore()
			},
			drawRoundRectAvatar(ctx, x, y, w, h, r, imgPath) {
				ctx.save()
				this._drawRoundRect(ctx, x, y, w, h, r)
				ctx.clip()
				ctx.drawImage(imgPath, x, y, w, h)
				ctx.restore()
			},
			// TODO: measureText not works in App
			drawTextInLines(ctx, t, x, y, w, lineHeight) {
				const chr = t.split("")
				let temp = ''
				let row = []
				for (let i = 0; i < chr.length; i++) {
					if (ctx.measureText(temp).width < w) {
						//
					} else {
						row.push(temp)
						temp = ''
					}
					temp += chr[i]
				}
				row.push(temp)
				for (const i in row) {
					// i + 1 will be 11, 21,...
					ctx.fillText(row[i], x, (y + (i * 1 + 1) * lineHeight))
				}
				return row.length
			},
			// TODO: measureText not works in app
			drawTextInOneLine(ctx, t, x, y, w) {
				const chr = t.split('')
				let temp = ''
				for (let i = 0; i < chr.length; i++) {
					if (ctx.measureText(temp + '...').width <= w) {
						temp += chr[i]
					} else {
						temp = temp.substring(0, temp.length - 1)
						temp += '...'
						break
					}
				}
				ctx.fillText(temp, x, y)
			},
			downloadImage(url) {
				return new Promise((resolve, reject) => {
					uni.downloadFile({
						url: url,
						success: (res) => {
							return resolve(res)
						},
						fail: (err) => {
							return reject(err)
						}
					})
				})
			},
			getLunar() {
				var date = new Date()
				this.year = date.getFullYear()
				this.month = date.getMonth() + 1
				this.day = date.getDate();
				var lunar = calendar.solar2lunar(this.year, this.month, this.day);
				return lunar.gzYear + '年 ' + lunar.IMonthCn + lunar.IDayCn + ' ' + lunar.ncWeek
			},
			async drawDate(ctx, padding, dateY, halfCw, cardHeight, r) {
				this.drawRoundRect(ctx, padding, dateY, halfCw, cardHeight, r, 2)
				const dateText = this.month + '/' + this.day
				const dateWidth = ctx.measureText(dateText).width
				ctx.fillText(this.month + '/' + this.day, padding + (halfCw - dateWidth) / 2, cardHeight / 2 + padding)

			},
			async drawWeather(ctx, padding, dateY, halfCw, cardHeight, r, fz200, icon, temp, des, city) {
				this.drawRoundRect(ctx, padding + halfCw + padding, dateY, halfCw, cardHeight, r, 2)
				const fz30 = uni.upx2px(30)
				ctx.setFontSize(fz30)

				ctx.drawImage(icon, halfCw + padding + 8, padding - 2, fz200, fz200)
				ctx.fillText(temp, padding + halfCw + fz200, cardHeight / 2 - 2)
				ctx.fillText(des, padding + halfCw + fz200, cardHeight / 2 - 2 + padding)
				ctx.fillText(city, padding + halfCw + fz200, cardHeight / 2 - 2 + padding +
					padding)
			},
			async getWeather(lat, lon) {
				return new Promise((resolve, reject) => {
					uni.request({
						url: 'https://api.openweathermap.org/data/2.5/weather?lat=' +
							lat +
							'&lon=' + lon +
							'&appid=2253ad037b671940f70d2467be16ded2' +
							'&lang=zh_cn' + '&units=metric',
						data: {},
						success: (res) => {
							this.weather = res.data
							return resolve(res.data)
						},
						fail: (res) => {
							return reject(res)
						}
					})
				})
			},
			getLocation() {
				uni.getLocation({
					type: 'wgs84',
					geocode: true, //必写项
					success: (data) => {
						if (data) {
							this.lat = data.latitude
							this.lon = data.longitude
						}
					},
					fail: (data) => {
						this.lat = 31.2318
						this.lon = 121.4727
					}
				})
			},
			getSong() {
				uniCloud.callFunction({
					name: 'song',
					data :{}
				}).then((res) =>{
					console.log("song",  res)
				}).catch((res) =>{
					console.error("song", res)
				});
			}
		},
	}
</script>

<style>
	.footer-left {
		position: fixed;
		width: 50%;
		left: 0;
		bottom: 0;
		box-shadow: none;
		border-top: 1px solid #E2E2E2;
	}

	.footer-right {
		position: fixed;
		width: 50%;
		right: 0;
		bottom: 0;
		box-shadow: none;
		border-top: 1px solid #E2E2E2;
	}
</style>
