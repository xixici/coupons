<template>
	<view>
		<view>
			<canvas canvas-id="mini_poster" :style="{ width: canvasW + 'px', height: canvasH + 'px' }"></canvas>
		</view>
		<view style="height: 106rpx;"></view>
		<view class="footer-left">
			<button open-type="getUserInfo" lang="zh_CN" @getuserinfo="onGotUserInfo" type="warn">生成我的</button>
		</view>
		<view class="footer-right">
			<button type="primary" @tap="toSaveImage">保存名片</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				mpWxQr: "https://github.com/xixici/xixici.github.io/blob/master/uploads/wechat-qcode.gif",
				canvasW: 0,
				canvasH: 0,
				nickname: "日历大师",
				avatar: "https://github.com/xixici/xixici.github.io/blob/master/uploads/wechat-qcode.gif",
				location: "上海",
				finished: false
			}
		},
		onLoad() {
			this.userInfo = getApp().globalData.userInfo
			this.canvasW = uni.getSystemInfoSync().windowWidth
			this.canvasH = this.calculateCanvasHeight()
			this.toDrawCanvas()
		},
		methods: {
			/*登录 */
			onGotUserInfo(e) {
				this.userInfo = e.detail.userInfo
				uni.setStorageSync('userInfo', e.detail.userInfo);
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
			async toDrawCanvas() {
				const padding = uni.upx2px(34)
				const cardHeight = uni.upx2px(170)
				const cw = this.canvasW - 2 * padding

				let ctx = uni.createCanvasContext('mini_poster', this)

				// 透明背景
				ctx.setFillStyle('#F3F4F5')
				ctx.fillRect(0, 0, this.canvasW, this.canvasH)
				// draw card round rect
				const r = uni.upx2px(12)
				this.drawRoundRect(ctx, padding, padding, cw, cardHeight, r, 2)
				// draw card content
				this.drawCard(ctx, padding, padding, cw, cardHeight)
				// draw avatar
				const av = uni.upx2px(128)
				console.log(this.userInfo)
				const hi = await this.downloadImage(this.userInfo.avatarUrl)
				if (hi.tempFilePath) {
					const x = this.canvasW - padding - uni.upx2px(40) - av
					const y = padding + uni.upx2px(40)
					this.drawRoundRectAvatar(ctx, x, y, av, av, r, hi.tempFilePath)
				}
				// draw hello info
				this.drawHelloInfo(ctx, padding, padding + cardHeight + padding, cw)
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
			async drawCard(ctx, x, y, w, h) {
				let vp = y + uni.upx2px(45)
				const hp = x + uni.upx2px(52)
				ctx.setTextBaseline('top')
				const fz30 = uni.upx2px(30)
				ctx.setFontSize(fz30)

				const iconW = uni.upx2px(30)
				const textH = hp + iconW + 6
				// #ifdef APP-PLUS
				ctx.drawImage('../../static/Mouse-Pointer.png', hp, vp + 3, iconW, iconW)
				// #endif
				// #ifndef APP-PLUS
				ctx.drawImage('../../static/Mouse-Pointer.png', hp, vp, iconW, iconW)
				// #endif
				ctx.setFillStyle('#333333')
				ctx.fillText(this.userInfo.nickName, textH, vp)

				vp += 30
				// #ifdef APP-PLUS
				ctx.drawImage('../../static/position.png', hp, vp + 3, iconW, iconW)
				// #endif
				// #ifndef APP-PLUS
				ctx.drawImage('../../static/position.png', hp, vp, iconW, iconW)
				// #endif
				ctx.fillText(this.userInfo.country + this.userInfo.province + this.userInfo.city, textH, vp)

			},
			async drawHelloInfo(ctx, x, y, w) {
				let vp = y + 12
				const hp = x
				ctx.setTextBaseline('top')
				const fz30 = uni.upx2px(30)
				ctx.setFillStyle('#333333')
				ctx.setFontSize(fz30)
				ctx.fillText('长按识别二维码', hp, vp)
				vp += 26
				ctx.fillText('添加微信与我沟通', hp, vp)
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
				// draw left border
				ctx.fillStyle = this.company ? '#F37231' : '#333333'
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
			}
		}
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
