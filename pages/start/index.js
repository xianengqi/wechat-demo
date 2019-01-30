const api = require('../../utils/request.js');
// 获取应用实例
const app = getApp();
Page({
  data:{
    remind: '加载中',
    angle: 0,
    userInfo: {}
  },

  goToIndex: function(e) {
    api.fetchRequest('/template-msg/wxa/formId', {
      token: wx.getStorageSync('token'),
      type: 'form',
      formId: e.detail.formId
    })

    if (app.globalData.isConnected) {
      wx.switchTab({
        url: '/pages/index/index',
      });
    } else {
      wx.showToast({
        title: '当前无网络',
        icon: 'none',
      })
    }
  },

  onLoad:function(options){
    // 生命周期函数--监听页面加载
    const that = this;
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
  },
  onReady:function(){
    // 生命周期函数--监听页面初次渲染完成
    let that = this;
    setTimeout(function() {
      that.setData({
        remind: ''
      });
    }, 1000);
    wx.onAccelerometerChange(function(res) {
      let angle = -(res.x * 30).toFixed(1);
      if (angle > 14) {
        angle = 14;
      } else if (angle <- 14) {
        angle =- 14;
      }
      if (that.data.angle !== angle) {
        that.setData({
          angle: angle
        });
      }
    });
  },
  onShow:function(){
    // 生命周期函数--监听页面显示
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      app.goLoginPageTimeOut()
    } else {
      that.setData({
        userInfo: userInfo
      })
    }
  },
  onHide:function(){
    // 生命周期函数--监听页面隐藏
    
  },
  onUnload:function(){
    // 生命周期函数--监听页面卸载
    
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
    
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
    
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: 'title', // 分享标题
      desc: 'desc', // 分享描述
      path: 'path' // 分享路径
    }
  }
})