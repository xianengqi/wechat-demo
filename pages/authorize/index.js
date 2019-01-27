const api = require('../../utils/request.js');
var app = getApp();
Page({
  data:{
  
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    
  },
  onReady:function(){
    // 生命周期函数--监听页面初次渲染完成
    
  },
  onShow:function(){
    // 生命周期函数--监听页面显示
    
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
    // return {
    //   title: 'title', // 分享标题
    //   desc: 'desc', // 分享描述
    //   path: 'path' // 分享路径
    // }
  },
  bindGetUserInfo: function(e) {
    if (!e.detail.userInfo) {
      return;
    }
    if (app.globalData.isConnected) {
      wx.setStorageSync('userInfo', e.detail.userInfo)
      this.login();
    } else {
      wx.showToast({
        title: '当前无网络',
        icon: 'none',
      })
    }
  },
  login: function() {
    let that = this;
    let token = wx.getStorageSync('token');
    if (token) {
      api.fetchRequest('/user/check-token').then(function(res) {
        if (res.data.code != 0) {
          wx.removeStorageSync('token')
          that.login();
        } else {
          // 回到原来的地方放
          app.navigateToLogin = false;
          wx.navigateBack();
        }
      })
      return;
    }
    wx.login({
      success: function(res) {
        api.fetchRequest('user/wxapp/login', {
          code: res.code
        }).then(function(res) {
          if (res.data.code == 10000) {
            // 去注册
            that.registerUser();
            return;
          }
          if (res.data.code != 0) {
            // 登录错误
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: '无法登录，请重试',
              showCancel: false
            })
            return;
          }
          wx.setStorageSync('token', res.data.data.token);
          wx.setStorageSync('uid', res.data.data.uid)
          //  回到原来的地方放
          app.navigateToLogin = false;
          wx.navigateback();
        })
      }
    })
  },
  registerUser: function() {
    let that = this;
    wx.login({
      success: function(res) {
        let code = res.code; // 微信登录接口返回的code参数， 下面注册接口需要用到
        wx.getUserInfo({
          success: function(res) {
            let iv = res.iv;
            let encryptedData = res.encryptedData;
            let referrer = '' // 推荐人 
            let referrer_storage = wx.getStorageSync('referrer');
            if (referrer_storage) {
              referrer = referrer_storage;
            }
            // 下面开始调用注册接口
            api.fetchRequest('/user/wxapp/register/complex', {
              code: code,
              encryptedData: encryptedData,
              iv: iv,
              referrer: referrer
            }).then(function(res) {
              wx.hideLoading();
              that.login();
            })
          }
        })
      }
    })
  }
})