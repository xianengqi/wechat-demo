const api = require('../../utils/request.js');
const CONFIG = require('../../config.js');
// 获取应用实例

const app = getApp();
Page({
  data:{
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false, // loading
    userInfo: {},
    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    scrollTop: 0,
    loadingMorehidden: true,
    hasNoCoupons: true,
    coupons: [],
    searchInput: '',
    curPage: 1,
    pageSize: 20
  },
  
  tabClick: function(e) {
    this.setData({
      activeCategoryId: e.currentTarget.id,
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  
  // 事件处理函数
  swiperchange: function(e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  
  toDetailsTap: function(e) {
    wx.navigateTo({
      url: "pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  
  tapBanner: function(e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateToMiniProgram({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },

  bindTypeTap: function(e) {
    this.setData({
      selectCurrent: e.index
    })
  },

  onLoad:function(options){
    // 生命周期函数--监听页面加载
    const that = this;
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })

    /**
     * 示例：
     * 调用接口封装方法
     */
    api.fetchRequest('/banner/list', {
      key: 'mallName'
    }).then(function(res) {
      if (res.data.code == 404) {
        wx.showModal({
          title: '提示',
          content: '请在后台添加 banner 轮播图片',
          showCancel: false
        })
      } else {
        that.setData({
          banners: res.data.data
        });
      }
    }).catch(function(res) {
      wx.showToast({
        title: res.data.msg,
        icon: 'none'
      });
    })
    api.fetchRequest('/shop/goods/category/all').then(function(res) {
      let categories = [{
        id: 0,
        name: '全部'
      }];
      if (res.data.code == 0) {
        for (var i = 0; i < res.data.data.length; i++) {
          categories.push(res.data.data[i]);
        }
      }
      that.setData({
        categories: categories,
        activeCategoryId: 0,
        curPage: 1
      });
      that.getGoodsList(0);
    })
    that.getCoupons();
    that.getNotice();
  },

  onPageScroll(e) {
    let scrolltop = this.data.scrollTop;
    this.setData({
      scrollTop: e.scrollTop
    })
  },

  getGoodsList: function(categoryID, append) {
    if (categoryID == 0) {
      categoryId = "";
    }
    let that = this;
    wx.showLoading({
      "mask": true
    })
    api.fetchRequest('/shop/goods/list', {
      categoryId: categoryId,
      nameLike: that.data.searchInput,
      page: this.data.curPage,
      pageSize: this.data.pageSize
    }).then(function(res) {
      wx.hideLoading()
      if (res.data.code == 404 || res.data.code == 700) {
        let newData = {
          loadingMoreHidden: false
        }
        if (!append) {
          newData.goods = [];
        }
        that.setData(newData);
        return
      }
      let goods = [];
      if (append) {
        goods = that.data.goods;
      }
      for (var i = 0; i < res.data.data.length; i++) {
        goods.push(res.data.data[i]);
      }
      that.setData({
        loadingMoreHidden: true,
        goods: goods,
      });
    })
  },
  
  getCoupons: function() {
    let that = this;
    api.fetchRequest('/discounts/coupons').then(function (res) {
      if (res.data.code == 0) {
        that.setData({
          hasNoCoupons: false,
          coupons: res.data.data
        });
      }
    })
  },
  
  gitCoupon: function(e) {
    let that = this;
    api.fetchRequest('/discounts/fetch', {
      id: e.currentTarget.dataSet.id,
      token: wx.getStorageSync('token')
    }).then(function (res) {
      if (res.data.code == 20001 || res.data.code == 20002) {
        wx.showModal({
          title: '错误',
          content: '来晚了',
          showCancel: false,
        });
        return;
      }
      if (res.data.code == 20003) {
        wx.showModal({
          title: '错误',
          content: '你领过啦， 别贪心哦～',
          showCancel: false
        });
        return;
      }
      if (res.data.code == 30001) {
        wx.showModal({
          title: '错误',
          content: '您的积分不足',
          showCancel: false
        });
        return;
      }
      if (res.data.code == 20004) {
        wx.showModal({
          title: '错误',
          content: '已过期～',
          showCancel: false
        })
        return;
      }
      if (res.data.code == 0) {
        wx.showToast({
          title: '领取成功, 赶紧去下单吧～',
          icon: 'success',
          duration: 2000
        })
      } else {
        wx.showModal({
          title: '错误',
          content: res.data.msg,
          showCancel: false
        })
      }
    })
  },

  getNotice: function() {
    let that = this;
    api.fetchRequest('/notice/list', {pageSize: 5}).then(function(res) {
      if (res.data.code == 0) {
        that.setData({
          noticeList: res.data.data
        });
      }
    })
  },
  
  listenerSearchInput: function(e) {
    this.setData({
      searchInput: e.detail.value
    })
  },
  
  toSearch: function () {
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId);
  },

  onReachBottom: function() {
    this.setData({
      curPage: this.data.curPage + 1
    });
    this.getGoodsList(this.data.activeCategoryID, true)
  },
  onPullDownRefresh(){
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId)
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
    return {
      title: wx.getStorageSync('mallName') + '__' + CONFIG.shareProfile, // 分享标题
      desc: 'desc', // 分享描述
      path: '/pages/index/index' // 分享路径
    }
  }
})